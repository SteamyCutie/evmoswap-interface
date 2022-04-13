import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { ZERO, NATIVE } from '@evmoswap/core-sdk'
import React, { useState, useRef } from 'react'
import { EvmoSwap, XEMOS } from '../../../config/tokens'
import BigNumber from 'bignumber.js'
import Button from '../../../components/Button'
import Dots from '../../../components/Dots'
import Image from 'next/image'
import Input from '../../../components/Input'
import TransactionFailedModal from '../../../modals/TransactionFailedModal'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../../functions/parse'
import { useActiveWeb3React } from '../../../services/web3'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { useLingui } from '@lingui/react'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { classNames, formatBalance, getExplorerLink, formatNumberScale } from '../../../functions'
import { useEmosVaultContract } from 'hooks/useContract'
import DoubleLogo from '../../../components/DoubleLogo'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { getDecimalAmount, getBalanceNumber, getBalanceAmount } from 'functions/formatBalance'
import {
  getAPY,
  convertSharesToEmos,
  convertEmosToShares,
  useWithdrawalFeeTimer,
  getEMOSPrice,
} from 'features/staking/useStaking'
import { EMOSVAULT_ADDRESS } from 'constants/addresses'
import { BIG_ZERO } from 'app/functions/bigNumber'
import NumericalInput from 'app/components/NumericalInput'
import QuestionHelper from 'app/components/QuestionHelper'
import { CalculatorIcon } from '@heroicons/react/solid'
import ROICalculatorModal from 'app/components/ROICalculatorModal'

const INPUT_CHAR_LIMIT = 18

const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
const activeTabStyle = `${tabStyle} text-high-emphesis font-bold bg-dark-900`
const inactiveTabStyle = `${tabStyle} text-secondary`

const buttonStyle =
  'flex justify-center items-center w-full h-14 rounded font-bold md:font-medium md:text-lg mt-5 text-sm focus:outline-none focus:ring'
const buttonStyleEnabled = `${buttonStyle} text-high-emphesis bg-cyan-blue hover:bg-opacity-90`
const buttonStyleInsufficientFunds = `${buttonStyleEnabled} opacity-60`
const buttonStyleDisabled = `${buttonStyle} text-secondary bg-dark-700`
const buttonStyleConnectWallet = `${buttonStyle} text-high-emphesis bg-cyan-blue hover:bg-opacity-90`

export default function AutoPoolCardDetails() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const emosPrice = getEMOSPrice()
  const emosBalance = useTokenBalance(account ?? undefined, EvmoSwap[chainId])
  // const XEMOSBalance = useTokenBalance(account ?? undefined, XEMOS[chainId])
  const [xBalanceAuto, setXBalanceAuto] = useState(0)
  const walletConnected = !!account
  const toggleWalletModal = useWalletModalToggle()
  const addTransaction = useTransactionAdder()
  const emosvaultContract = useEmosVaultContract()

  const [inputStake, setInputStake] = useState<string>('')
  const [inputUnStake, setInputUnStake] = useState<string>('')

  const parsedStakeAmount = tryParseAmount(inputStake, emosBalance?.currency)

  const [approvalStateAuto, approveAuto] = useApproveCallback(parsedStakeAmount, EMOSVAULT_ADDRESS[chainId])

  const [isWithdrawAll, setIsWithdrawAll] = useState(0)
  const fullShare = useRef(BIG_ZERO)
  const results = useRef([0, 0])

  // for countdown
  const lastDepositedTime = useRef(0)
  const userSharesValue = useRef(BIG_ZERO)

  const getEmosVault = async () => {
    const totalstaked = await emosvaultContract.balanceOf()
    if (!account) return
    const userInfo = await emosvaultContract.userInfo(account)
    const userShares = userInfo.shares
    const pricePerFullShare = await emosvaultContract.getPricePerFullShare()
    lastDepositedTime.current = parseInt(userInfo.lastDepositedTime, 10)
    userSharesValue.current = new BigNumber(userShares._hex)
    fullShare.current = new BigNumber(pricePerFullShare._hex)
    const { emosAsBigNumber, emosAsNumberBalance } = convertSharesToEmos(
      new BigNumber(userShares._hex),
      new BigNumber(pricePerFullShare._hex)
    )
    setXBalanceAuto(emosAsNumberBalance)
    const emosAtLastUserAction = new BigNumber(userInfo.emosAtLastUserAction._hex)
    const autoEmosProfit = emosAsBigNumber.minus(emosAtLastUserAction)
    const recentProfit = autoEmosProfit.gte(0) ? getBalanceNumber(autoEmosProfit, 18) : 0
    const totalStakedValue = getBalanceAmount(totalstaked._hex, 18).toNumber()
    results.current = [totalStakedValue, recentProfit]
  }
  getEmosVault()

  const { secondsRemaining } = useWithdrawalFeeTimer(lastDepositedTime.current, userSharesValue.current, 259200)
  const withdrawalFeeTimer = parseInt(secondsRemaining)
  const d = (withdrawalFeeTimer / 86400) | 0
  const h = ((withdrawalFeeTimer % 86400) / 3600) | 0
  const m = ((withdrawalFeeTimer - 86400 * d - h * 3600) / 60) | 0

  const handleInputAuto = (v: string) => {
    if (v.length <= INPUT_CHAR_LIMIT) {
      setInputStake(v)
      setInputUnStake(v)
    }
  }

  const stakeInputError = (emosBalance && emosBalance.equalTo(ZERO)) || parsedStakeAmount?.greaterThan(emosBalance)
  const unstakeInputError = (xBalanceAuto && xBalanceAuto === 0) || Number(inputUnStake) > xBalanceAuto

  const [pendingTxAuto, setPendingTxAuto] = useState(false)
  const stakeButtonDisabled = !inputStake || pendingTxAuto || (parsedStakeAmount && parsedStakeAmount.equalTo(ZERO))
  const unstakeButtonDisabled = !inputUnStake || pendingTxAuto || (xBalanceAuto && xBalanceAuto === 0)

  const handleStake = async () => {
    if (stakeButtonDisabled) return
    if (!walletConnected) {
      toggleWalletModal()
    } else {
      setPendingTxAuto(true)
      if (approvalStateAuto !== ApprovalState.NOT_APPROVED) {
        try {
          const convertedStakeAmount = getDecimalAmount(new BigNumber(inputStake), 18)
          const args = [convertedStakeAmount.toFixed()]
          const gasLimit = await emosvaultContract.estimateGas.deposit(...args)
          const tx = await emosvaultContract.deposit(...args, {
            gasLimit: gasLimit.mul(120).div(100),
          })
          addTransaction(tx, {
            summary: `${i18n._(t`Stake`)} EMOS`,
          })
        } catch (error) {
          setPendingTxAuto(false)
        }
      }

      handleInputAuto('')
      setPendingTxAuto(false)
    }
  }
  const handleUnstake = async () => {
    try {
      if (isWithdrawAll === 0) {
        const convertedStakeAmount = getDecimalAmount(new BigNumber(inputUnStake), 18)
        const shareStakeToWithdraw = convertEmosToShares(convertedStakeAmount, fullShare.current)
        const args = [shareStakeToWithdraw.sharesAsBigNumber.toFixed()]
        const gasLimit = await emosvaultContract.estimateGas.withdraw(...args)
        const tx = await emosvaultContract.withdraw(...args, {
          gasLimit: gasLimit.mul(120).div(100),
        })
        addTransaction(tx, {
          summary: `${i18n._(t`Unstake`)} EMOS`,
        })
      } else {
        const gasLimit = await emosvaultContract.estimateGas.withdrawAll()
        const tx = await emosvaultContract.withdrawAll({ gasLimit: gasLimit.mul(120).div(100) })
        addTransaction(tx, {
          summary: `${i18n._(t`Unstake`)} EMOS`,
        })
      }
    } catch (error) {
      setPendingTxAuto(false)
    }

    handleInputAuto('')
    setPendingTxAuto(false)
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 p-4 rounded-b-lg rounded-tr-lg sm:grid-cols-3 bg-dark-800">
      <div className="col-span-2 text-center md:col-span-1">
        {account && (
          <div className="flex flex-row justify-between">
            <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
              {i18n._(t`Balance`)}: {formatNumberScale(emosBalance?.toSignificant(6, undefined, 2) ?? 0, false, 4)}
              {emosPrice && emosBalance
                ? ` (` +
                  formatNumberScale(Number(emosPrice.toFixed(18)) * Number(emosBalance?.toFixed(18) ?? 0), true) +
                  `)`
                : ``}
            </div>
          </div>
        )}

        <div className="relative flex items-center w-full mb-4">
          <NumericalInput
            className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
            value={inputStake}
            onUserInput={setInputStake}
          />
          {account && (
            <Button
              variant="outlined"
              color="blue"
              size="xs"
              onClick={() => {
                if (!emosBalance?.equalTo(ZERO)) {
                  setInputStake(emosBalance?.toFixed(18))
                }
              }}
              className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
            >
              {i18n._(t`MAX`)}
            </Button>
          )}
        </div>
        {approvalStateAuto === ApprovalState.NOT_APPROVED || approvalStateAuto === ApprovalState.PENDING ? (
          <Button
            className="w-full"
            color="gradient"
            disabled={approvalStateAuto === ApprovalState.PENDING}
            onClick={approveAuto}
          >
            {approvalStateAuto === ApprovalState.PENDING ? <Dots>{i18n._(t`Approving`)}</Dots> : i18n._(t`Approve`)}
          </Button>
        ) : (
          <Button
            className="w-full"
            color="blue"
            disabled={stakeButtonDisabled || stakeInputError}
            onClick={handleStake}
          >
            {i18n._(t`Stake`)}
          </Button>
        )}
      </div>
      <div className="col-span-2 text-center md:col-span-1">
        {account && (
          <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
            {i18n._(t`Your Staked`)}: {formatNumberScale(xBalanceAuto ?? 0, false, 4)}
          </div>
        )}
        <div className="relative flex items-center w-full mb-4">
          <NumericalInput
            className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-light-purple"
            value={inputUnStake}
            onUserInput={setInputUnStake}
          />
          {account && (
            <Button
              variant="outlined"
              color="blue"
              size="xs"
              onClick={() => {
                if (xBalanceAuto) {
                  setInputUnStake(xBalanceAuto.toString())
                  setIsWithdrawAll(1)
                }
              }}
              className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
            >
              {i18n._(t`MAX`)}
            </Button>
          )}
        </div>

        <Button
          className="w-full"
          color="blue"
          disabled={unstakeButtonDisabled || unstakeInputError}
          onClick={handleUnstake}
        >
          {i18n._(t`Unstake`)}
        </Button>
      </div>
      <div className="col-span-2 md:col-span-1">
        <div className="flex justify-between">
          <div className="mb-2 text-xs md:text-base text-secondary">EMOS Earned</div>
        </div>
        <div className="w-full p-4 text-base rounded-lg md:gap-4 bg-dark-700">
          <div className="flex justify-between">
            <div className="mb-2 text-xs md:text-base">Recent EMOS Profit</div>
            <div>{results.current[1]}</div>
          </div>
          <div className="flex justify-between">
            <div className="mb-2 text-xs md:text-base">0.1% unstaking fee until</div>
            <div>
              {d}d: {h}h: {m}m
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs md:text-base">Perfomance fee</div>
            <div>2.99%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
