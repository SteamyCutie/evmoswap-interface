import { SUSHI, Token, ZERO } from '@evmoswap/core-sdk'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'
import Dots from 'app/components/Dots'
import NumericalInput from 'app/components/NumericalInput'
import { ApprovalState, useApproveCallback, useTreasuryContract } from 'app/hooks'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback, useState } from 'react'
import { tryParseAmount } from 'app/functions'
import { EvmoSwap, GEMO } from 'app/config/tokens'
import Checkbox from 'app/components/Checkbox'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { useBuyGemEMO, useSellGemEMO } from './useGemEMO'
import { useSingleCallResult } from 'app/state/multicall/hooks'
import Loader from 'app/components/Loader'

const GEmoControl = () => {
  const styleCard = 'grid w-full p-4 md:p-6 rounded-xl bg-dark-900/60 gap-3'
  const styleItem = 'grid p-8 py-6 rounded-xl bg-dark-900 w-full text-center uppercase'

  const convertRate = 0.7
  const returnFee = 0.02

  const { account, chainId } = useActiveWeb3React()

  const [pendingConvert, setPendingConvert] = useState(false)
  const [pendingReturn, setPendingReturn] = useState(false)

  const [depositValue, setDepositValue] = useState<string>('')
  const [returnValue, setReturnValue] = useState<string>('')

  const stakingToken = EvmoSwap[chainId]
  const earningToken = GEMO[chainId]
  const treasuryContract = useTreasuryContract()

  const typedDepositValue = tryParseAmount(depositValue, stakingToken)
  const typedReturnValue = tryParseAmount(returnValue, earningToken)

  const stakeBalance = useTokenBalance(account, stakingToken)
  const earnBalance = useTokenBalance(account, earningToken)

  const [approvalDepositState, approveDeposit] = useApproveCallback(typedDepositValue, treasuryContract.address)
  const [approvalReturnState, approveReturn] = useApproveCallback(typedReturnValue, treasuryContract.address)
  const addTransaction = useTransactionAdder()

  const initMax = 50
  const [maxValue, setMaxValue] = useState(initMax)

  const { handleBuy } = useBuyGemEMO()
  const { handleSell } = useSellGemEMO()

  const buy = useCallback(async () => {
    try {
      setPendingConvert(true)
      let tx = await handleBuy(depositValue)
      addTransaction(tx, {
        summary: `${i18n._(t`Convert `)} ${stakingToken?.symbol} ${i18n._(t`to `)} ${earningToken?.symbol}`,
      })
      setPendingConvert(false)
    } catch (e) {
      setPendingConvert(false)
      console.warn(e)
    }
  }, [handleBuy, depositValue, addTransaction, stakingToken?.symbol, earningToken?.symbol])

  const sell = useCallback(async () => {
    try {
      setPendingReturn(true)
      let tx = await handleSell(returnValue)
      addTransaction(tx, {
        summary: `${i18n._(t`Convert `)} ${earningToken?.symbol} ${i18n._(t`to `)} ${stakingToken?.symbol}`,
      })
      setPendingReturn(false)
    } catch (e) {
      setPendingReturn(false)
      console.warn(e)
    }
  }, [addTransaction, earningToken?.symbol, handleSell, returnValue, stakingToken?.symbol])

  return (
    <div className="grid items-start justify-center w-full grid-cols-1 gap-4 bg-center bg-no-repeat bg-cover md:gap-0 md:grid-cols-2 rounded-2xl md:flex">
      <div className={`${styleCard} md:rounded-r-none md:pr-3`}>
        <div className={styleItem}>
          <p className="font-extrabold">Convert</p>
          <p className="flex items-center justify-center text-sm font-extrabold text-yellow">
            EMO <ChevronRightIcon width={24} /> GEMO
          </p>
        </div>
        <div className={styleItem}>
          <div className="mb-2 text-sm text-right normal-case">
            {stakeBalance ? Number(stakeBalance?.toFixed(stakingToken.decimals)).toFixed(2) : 0} {stakingToken?.symbol}{' '}
            Available
          </div>
          <div className="relative flex items-center w-full mb-4">
            <NumericalInput
              className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
              value={depositValue}
              onUserInput={setDepositValue}
            />
            {account && (
              <Button
                variant="outlined"
                color="blue"
                size="xs"
                onClick={() => {
                  if (!stakeBalance?.equalTo(ZERO)) {
                    setDepositValue(
                      Number(stakeBalance?.toFixed(stakingToken?.decimals)) > maxValue
                        ? maxValue.toFixed()
                        : stakeBalance?.toFixed(stakingToken?.decimals)
                    )
                  }
                }}
                className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
              >
                {i18n._(t`MAX`)}
              </Button>
            )}
          </div>

          {approvalDepositState === ApprovalState.NOT_APPROVED || approvalDepositState === ApprovalState.PENDING ? (
            <Button
              className="w-full"
              color="gradient"
              disabled={approvalDepositState === ApprovalState.PENDING}
              onClick={approveDeposit}
            >
              {approvalDepositState === ApprovalState.PENDING ? (
                <div className="flex justify-center items-center space-x-2">
                  <Loader stroke="white" />
                  <Dots>{i18n._(t`Approving`)}</Dots>
                </div>
              ) : (
                i18n._(t`Approve Contract`)
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              color="blue"
              disabled={
                pendingConvert ||
                !typedDepositValue ||
                Number(depositValue) > maxValue ||
                stakeBalance?.lessThan(typedDepositValue)
              }
              onClick={buy}
            >
              {pendingConvert ? (
                <div className="flex justify-center items-center space-x-2">
                  <Loader stroke="white" />
                  <Dots>{i18n._(t`Confirming`)}</Dots>
                </div>
              ) : (
                i18n._(t`Convert`)
              )}
            </Button>
          )}
          <div className="mt-8 font-extrabold">Output GEMO {Number(Number(depositValue) * convertRate).toFixed(2)}</div>
          <div className="mb-2 text-sm font-extrabold normal-case">
            * Current max conversion is {maxValue === initMax ? initMax : 'unlimited'}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-left normal-case">
            <Checkbox
              checked={maxValue !== initMax}
              color="blue"
              set={() => setMaxValue(maxValue === initMax ? 1000000000 : initMax)}
            />
            I understand what I am doing and want to enable unlimited conversion.
          </div>
        </div>
      </div>
      <div className={`${styleCard} md:rounded-l-none md:pl-3`}>
        <div className={styleItem}>
          <p className="font-extrabold">Return</p>
          <p className="flex items-center justify-center text-sm font-extrabold text-yellow">
            GEMO <ChevronRightIcon width={24} /> EMO
          </p>
        </div>
        <div className={styleItem}>
          <div className="mb-2 text-sm text-right normal-case">
            {earnBalance ? Number(earnBalance?.toFixed(earningToken.decimals)).toFixed(2) : 0} {earningToken?.symbol}{' '}
            Available
          </div>
          <div className="relative flex items-center w-full mb-4">
            <NumericalInput
              className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
              value={returnValue}
              onUserInput={setReturnValue}
            />
            {account && (
              <Button
                variant="outlined"
                color="blue"
                size="xs"
                onClick={() => {
                  if (!earnBalance?.equalTo(ZERO)) {
                    setReturnValue(earnBalance?.toFixed(earningToken?.decimals))
                  }
                }}
                className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
              >
                {i18n._(t`MAX`)}
              </Button>
            )}
          </div>

          {approvalReturnState === ApprovalState.NOT_APPROVED || approvalReturnState === ApprovalState.PENDING ? (
            <Button
              className="w-full"
              color="gradient"
              disabled={approvalReturnState === ApprovalState.PENDING}
              onClick={approveReturn}
            >
              {approvalReturnState === ApprovalState.PENDING ? (
                <Dots>{i18n._(t`Approving`)}</Dots>
              ) : (
                i18n._(t`Approve Contract`)
              )}
            </Button>
          ) : (
            <Button
              className="w-full"
              color="blue"
              disabled={pendingReturn || !typedReturnValue || Number(earnBalance) < Number(typedReturnValue.toFixed())}
              onClick={sell}
            >
              {pendingReturn ? (
                <div className="flex justify-center items-center space-x-2">
                  <Loader stroke="white" />
                  <Dots>{i18n._(t`Confirming`)}</Dots>
                </div>
              ) : (
                i18n._(t`Return`)
              )}
            </Button>
          )}
          <div className="mt-8 font-extrabold">
            Output EMO {Number(Number(returnValue) * (1 - returnFee)).toFixed(2)}
          </div>
          <div className="mb-2 text-sm font-extrabold normal-case md:mb-16">*After 2% reflect fees</div>
        </div>
      </div>
    </div>
  )
}

export default GEmoControl
