import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { NATIVE, WNATIVE, WNATIVE_ADDRESS } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import Web3Connect from 'app/components/Web3Connect'
import { useFarmListItemDetailsModal } from 'app/features/farm/FarmListItemDetails'
import { calculateGasMargin, calculateSlippageAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useRouterContract } from 'app/hooks/useContract'
import useTransactionDeadline from 'app/hooks/useTransactionDeadline'
import { useActiveWeb3React } from 'app/services/web3'
import { Field } from 'app/state/burn/actions'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useExpertModeManager } from 'app/state/user/hooks'
import React, { useState, useCallback, useMemo } from 'react'
import ReactGA from 'react-ga'
import { AutoColumn } from 'app/components/Column'
import { AutoRow } from 'app/components/Row'
import { Plus } from 'react-feather'
import { RowBetween } from 'app/components/Row'
import Dots from 'app/components/Dots'
import { ButtonError } from 'app/components/Button'
import { useUserSlippageToleranceWithDefault } from 'app/state/user/hooks'
import { Percent } from '@evmoswap/core-sdk'
import { ConfirmationModalContent } from 'app/modals/TransactionConfirmationModal'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import RemovePercentInput from 'app/components/RemovePercentInput'
import useDebouncedChangeHandler from 'app/hooks/useDebouncedChangeHandler'
import { useBurnActionHandlers } from 'app/state/burn/hooks'
import { ArrowDownIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Contract } from '@ethersproject/contracts'
import { useV2LiquidityTokenPermit } from 'app/hooks/useERC20Permit'
import { usePairContract } from 'app/hooks'
import { useDerivedBurnInfo } from 'app/state/burn/hooks'
import { useBurnState } from 'app/state/burn/hooks'
import { ButtonConfirmed } from 'app/components/Button'
import { TokenAmountCard } from 'app/components/TokenAmountCard'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 1000)

// @ts-ignore TYPE NEEDS FIXING
const PoolWithdraw = ({ currencyA, currencyB, header, handleDismiss }) => {
  const { i18n } = useLingui()
  const { setContent } = useFarmListItemDetailsModal()
  const { account, chainId, library } = useActiveWeb3React()
  const [isExpertMode] = useExpertModeManager()
  const deadline = useTransactionDeadline() // custom from users settings
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)
  const routerContract = useRouterContract()
  const addTransaction = useTransactionAdder()

  const isValid = !error

  const router = useRouter()
  const tokens = router.query.tokens
  const [tokenA, tokenB] = useMemo(() => [currencyA?.wrapped, currencyB?.wrapped], [currencyA, currencyB])
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], routerContract?.address)
  const { independentField, typedValue } = useBurnState()
  const [currencyIdA, currencyIdB] = tokens || [undefined, undefined]

  // allowance handling
  const { gatherPermitSignature, signatureData } = useV2LiquidityTokenPermit(
    parsedAmounts[Field.LIQUIDITY],
    routerContract?.address
  )

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE)
  const oneCurrencyIsETH = currencyA?.isNative || currencyB?.isNative
  const oneCurrencyIsWETH = Boolean(
    chainId && WNATIVE[chainId] && (currencyA?.equals(WNATIVE[chainId]) || currencyB?.equals(WNATIVE[chainId]))
  )

  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const handleDismissConfirmation = useCallback(() => {
    setContent(undefined)

    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash, setContent])

  const liquidityPercentChangeCallback = useCallback(
    (value: string) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value)
    },
    [onUserInput]
  )

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    liquidityPercentChangeCallback
  )

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (!gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback()
        }
      }
    } else {
      await approveCallback()
    }
  }

  function modalHeader() {
    return (
      <div className="grid gap-4 px-2">
        <div className="justify-start text-sm text-secondary max-w-md">
          {t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
            4
          )}% your transaction will revert.`}
        </div>
      </div>
    )
  }

  function modalBottom() {
    return (
      <>
        <div className="p-4 rounded-lg bg-dark-1000">
          <div className="grid gap-1 pb-6">
            <div className="">
              <div className="mb-2 text-base text-secondary">{i18n._(t`You are removing`)}</div>
              <div className="p-2 text-sm border-[1px] font-bold border-gray-600 rounded-lg bg-light-secondary dark:bg-dark-secondary text-high-emphasis">
                {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)} {currencyA?.symbol}/{currencyB?.symbol}
              </div>
            </div>
          </div>
          {pair && (
            <>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-high-emphesis">{i18n._(t`Rates`)}</div>
                  <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
                    {`1 ${currencyA?.symbol} = ${tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} ${
                      currencyB?.symbol
                    }`}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
                    {`1 ${currencyB?.symbol} = ${tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} ${
                      currencyA?.symbol
                    }`}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="p-4 rounded-lg bg-dark-1000">
          <div className="text-base text-secondary">{i18n._(t`You will receive(at least):`)}</div>
          <div className="flex items-center gap-2 p-2 mt-2 border-[1px] border-gray-600 rounded-t-lg bg-light-secondary dark:bg-dark-secondary">
            <CurrencyLogo currency={currencyA} />
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencyA?.symbol}
          </div>
          <div className="flex items-center gap-2 p-2 border-[1px] border-gray-600 rounded-b-lg bg-light-secondary dark:bg-dark-secondary">
            <CurrencyLogo currency={currencyB} />
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencyB?.symbol}
          </div>
        </div>
        <Button
          color="blue"
          size="lg"
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
        >
          {i18n._(t`Confirm Withdrawal`)}
        </Button>
      </>
    )
  }

  async function onRemove() {
    if (!chainId || !library || !account || !deadline || !router) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB.isNative
    const oneCurrencyIsETH = currencyA.isNative || currencyBIsETH

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ]
      }
    }
    // we have a signature, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        routerContract.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await routerContract[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: t`Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencyA?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`,
          })

          setTxHash(response.hash)

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currencyA?.symbol, currencyB?.symbol].join('/'),
          })

          setInnerLiquidityPercentage('')
        })
        .catch((error: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.log(error)
        })
      setTimeout(() => {
        handleDismiss()
      }, 4000)
    }
  }

  return (
    <>
      {header}

      <AutoColumn gap="md">
        <div>
          <RemovePercentInput
            value={innerLiquidityPercentage}
            onUserInput={setInnerLiquidityPercentage}
            id="liquidity-percent"
            className="bg-light dark:bg-dark rounded-xl p-4"
          />

          <AutoColumn>
            <AutoRow justify={'center'} className="p-1">
              <button className="z-10 -mt-4 -mb-4 rounded-2xl cursor-default bg-light-secondary dark:bg-dark-secondary p-1">
                <div className="p-2 rounded-xl bg-light dark:bg-dark">
                  <ArrowDownIcon width="14" height="14" />
                </div>
              </button>
            </AutoRow>
          </AutoColumn>

          <div id="remove-liquidity-output" className="p-5 rounded bg-light dark:bg-dark">
            <div className="flex flex-col justify-between space-y-3">
              <div className="w-full text-white sm:w-2/5" style={{ margin: 'auto 0px' }}>
                <AutoColumn>
                  <div className="font-medium">You will receive:</div>
                  {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                    <RowBetween className="text-sm">
                      {oneCurrencyIsETH ? (
                        <Link
                          href={`/remove/${currencyA?.isNative ? WNATIVE_ADDRESS[chainId] : currencyIdA}/${
                            currencyB?.isNative ? WNATIVE_ADDRESS[chainId] : currencyIdB
                          }`}
                        >
                          <a className="text-baseline text-blue opacity-80 hover:opacity-100 focus:opacity-100 whitespace-nowrap">
                            Receive W{NATIVE[chainId].symbol}
                          </a>
                        </Link>
                      ) : oneCurrencyIsWETH ? (
                        <Link
                          href={`/remove/${currencyA?.equals(WNATIVE[chainId]) ? 'EVMOS' : currencyIdA}/${
                            currencyB?.equals(WNATIVE[chainId]) ? 'EVMOS' : currencyIdB
                          }`}
                        >
                          <a className="text-baseline text-blue opacity-80 hover:opacity-100 whitespace-nowrap">
                            Receive {NATIVE[chainId].symbol}
                          </a>
                        </Link>
                      ) : null}
                    </RowBetween>
                  ) : null}
                </AutoColumn>
              </div>

              <div className="flex flex-col space-y-3 ">
                <TokenAmountCard amount={parsedAmounts[Field.CURRENCY_A]} currency={currencyA} />
                <TokenAmountCard amount={parsedAmounts[Field.CURRENCY_B]} currency={currencyB} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {!account ? (
            <Web3Connect />
          ) : isValid && approval !== ApprovalState.APPROVED && signatureData === null ? (
            <Button
              color="blue"
              onClick={onAttemptToApprove}
              disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
            >
              {approval === ApprovalState.PENDING ? <Dots>{i18n._(t`Approving`)}</Dots> : i18n._(t`Approve`)}
            </Button>
          ) : (
            <Button
              color={
                !isValid
                  ? !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                    ? 'red'
                    : 'gray'
                  : 'gradient'
              }
              onClick={() => {
                setContent(
                  <ConfirmationModalContent
                    title={i18n._(t`Confirm remove liquidity`)}
                    onDismiss={handleDismissConfirmation}
                    topContent={modalHeader}
                    bottomContent={modalBottom}
                  />
                )
              }}
              size="lg"
              disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
            >
              {error || i18n._(t`Confirm Withdrawal`)}
            </Button>
          )}
        </div>
      </AutoColumn>
    </>
  )
}

export default PoolWithdraw
