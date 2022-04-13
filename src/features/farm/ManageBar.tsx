import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { MinusIcon, PlusIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { ChainId, Token } from '@evmoswap/core-sdk'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import Switch from 'app/components/Switch'
import Typography from 'app/components/Typography'
import Web3Connect from 'app/components/Web3Connect'
import { useFarmListItemDetailsModal } from './FarmListItemDetails'
import { classNames, tryParseAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import React, { useState } from 'react'

import { Chef } from './enum'
import { useUserInfo } from './hooks'
import useMasterChef from './useMasterChef'
import NumericalInput from 'app/components/NumericalInput'
import Dots from 'app/components/Dots'
import { MASTERCHEF_ADDRESS } from 'app/constants/addresses'

const APPROVAL_ADDRESSES = {
  [Chef.MASTERCHEF]: {
    [ChainId.ETHEREUM]: MASTERCHEF_ADDRESS[ChainId.ETHEREUM],
    [ChainId.BSC_TESTNET]: MASTERCHEF_ADDRESS[ChainId.BSC_TESTNET],
  },
}

// @ts-ignore TYPE NEEDS FIXING
const ManageBar = ({ farm, handleDismiss }) => {
  const { account, chainId } = useActiveWeb3React()
  const { setContent } = useFarmListItemDetailsModal()
  const [toggle, setToggle] = useState(true)
  const [depositValue, setDepositValue] = useState<string>()
  const [withdrawValue, setWithdrawValue] = useState<string>()
  const { deposit, withdraw } = useMasterChef(farm.chef)
  const addTransaction = useTransactionAdder()
  const liquidityToken = new Token(
    // @ts-ignore TYPE NEEDS FIXING
    chainId,
    getAddress(farm.lpToken),
    farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18,
    'SLP'
  )
  // const balance = useCurrencyBalance(account ?? undefined, liquidityToken)
  const balance = useTokenBalance(account, liquidityToken)
  const { stakedAmount } = useUserInfo(farm, liquidityToken)
  const parsedDepositValue = tryParseAmount(depositValue, liquidityToken)
  const parsedWithdrawValue = tryParseAmount(withdrawValue, liquidityToken)
  // @ts-ignore TYPE NEEDS FIXING
  const [approvalState, approve] = useApproveCallback(parsedDepositValue, APPROVAL_ADDRESSES[farm.chef][chainId])

  const depositError = !parsedDepositValue
    ? 'Enter an amount'
    : balance?.lessThan(parsedDepositValue)
    ? 'Insufficient balance'
    : undefined
  const isDepositValid = !depositError
  const withdrawError = !parsedWithdrawValue
    ? 'Enter an amount'
    : // @ts-ignore TYPE NEEDS FIXING
    stakedAmount?.lessThan(parsedWithdrawValue)
    ? 'Insufficient balance'
    : undefined
  const isWithdrawValid = !withdrawError
  const [pendingTx, setPendingTx] = useState(undefined)

  return (
    <>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-4 bg-dark-1000/40">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              {toggle ? i18n._(t`Stake liquidity`) : i18n._(t`Unstake liquidity`)}
            </Typography>
            <Switch
              size="sm"
              checked={toggle}
              onChange={() => setToggle(!toggle)}
              checkedIcon={<PlusIcon className="text-dark-1000" />}
              uncheckedIcon={<MinusIcon className="text-dark-1000" />}
            />
          </div>

          <Typography variant="sm" className="text-secondary">
            {i18n._(t`Use one of the buttons to set a percentage or enter a value manually using the input field`)}
          </Typography>
        </div>

        <div className="flex justify-end gap-2">
          {['25', '50', '75', '100'].map((multiplier, i) => (
            <Button
              variant="outlined"
              size="xs"
              color={toggle ? 'blue' : 'pink'}
              key={i}
              onClick={() => {
                toggle
                  ? balance
                    ? // @ts-ignore TYPE NEEDS FIXING
                      setDepositValue(balance.multiply(multiplier).divide(100).toExact())
                    : undefined
                  : stakedAmount
                  ? // @ts-ignore TYPE NEEDS FIXING
                    setWithdrawValue(stakedAmount.multiply(multiplier).divide(100).toExact())
                  : undefined
              }}
              className={classNames(
                'text-md border border-opacity-50',
                toggle ? 'focus:ring-blue border-blue' : 'focus:ring-pink border-pink'
              )}
            >
              {multiplier === '100' ? 'MAX' : multiplier + '%'}
            </Button>
          ))}
        </div>
        <NumericalInput
          className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
          value={toggle ? depositValue : withdrawValue}
          onUserInput={toggle ? setDepositValue : setWithdrawValue}
        />
      </HeadlessUiModal.BorderedContent>
      {toggle ? (
        !account ? (
          <Web3Connect size="lg" color="blue" />
        ) : (isDepositValid && approvalState === ApprovalState.NOT_APPROVED) ||
          approvalState === ApprovalState.PENDING ? (
          <Button
            className="w-full"
            color="gradient"
            disabled={approvalState === ApprovalState.PENDING}
            onClick={approve}
          >
            {approvalState === ApprovalState.PENDING ? <Dots>{i18n._(t`Approving`)}</Dots> : i18n._(t`Approve`)}
          </Button>
        ) : (
          <Button
            className="w-full"
            color={!isDepositValid && !!parsedDepositValue ? 'red' : 'blue'}
            // disabled={pendingTx || !typedDepositValue || balance?.lessThan(typedDepositValue)}
            disabled={!isDepositValid}
            onClick={async () => {
              setPendingTx(true)
              try {
                // KMP decimals depend on asset, SLP is always 18
                // @ts-ignore TYPE NEEDS FIXING
                const tx = await deposit(farm.pid, BigNumber.from(parsedDepositValue?.quotient.toString()))
                addTransaction(tx, {
                  summary: `Deposit ${farm.token0.symbol}/${farm.token1.symbol}`,
                })
              } catch (error) {
                console.error(error)
              }
              setTimeout(() => {
                handleDismiss(), setPendingTx(false)
              }, 4000)
            }}
          >
            {pendingTx ? <Dots>{i18n._(t`Depositing`)}</Dots> : depositError || i18n._(t`Confirm Deposit`)}
          </Button>
        )
      ) : (
        <Button
          className="w-full"
          color={!isWithdrawValid && !!parsedWithdrawValue ? 'red' : 'blue'}
          disabled={!isWithdrawValid}
          onClick={async () => {
            setPendingTx(true)
            try {
              // KMP decimals depend on asset, SLP is always 18
              // @ts-ignore TYPE NEEDS FIXING
              const tx = await withdraw(farm.pid, BigNumber.from(parsedWithdrawValue?.quotient.toString()))
              addTransaction(tx, {
                summary: `Withdraw ${farm.token0.symbol}/${farm.token1.symbol}`,
              })
            } catch (error) {
              console.error(error)
            }
            setTimeout(() => {
              handleDismiss(), setPendingTx(false)
            }, 4000)
          }}
        >
          {pendingTx ? <Dots>{i18n._(t`Withdrawing`)}</Dots> : withdrawError || i18n._(t`Confirm Withdraw`)}
        </Button>
      )}
    </>
  )
}

export default ManageBar
