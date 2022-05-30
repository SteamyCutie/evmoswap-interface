import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { ArrowDown, Plus } from 'react-feather'
import { AutoRow, RowBetween } from '../../../components/Row'
import { ButtonConfirmed, ButtonError } from '../../../components/Button'
import { ChainId, Currency, NATIVE, Percent, WNATIVE, WNATIVE_ADDRESS } from '@evmoswap/core-sdk'
import React, { useCallback, useMemo, useState } from 'react'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../../modals/TransactionConfirmationModal'
import { calculateGasMargin, calculateSlippageAmount } from '../../../functions/trade'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../../state/burn/hooks'
import { usePairContract, useRouterContract } from '../../../hooks/useContract'

import Alert from '../../../components/Alert'
import { ArrowDownIcon, PlusIcon, SwitchHorizontalIcon } from '@heroicons/react/solid'
import { AutoColumn } from '../../../components/Column'
import { BigNumber } from '@ethersproject/bignumber'
import Button from '../../../components/Button'
import Container from '../../../components/Container'
import { Contract } from '@ethersproject/contracts'
import { CurrencyLogo } from '../../../components/CurrencyLogo'
import Dots from '../../../components/Dots'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import { Field } from '../../../state/burn/actions'
import Head from 'next/head'
import Header from '../../../features/trade/Header'
import Link from 'next/link'
import LiquidityHeader from '../../../features/liquidity/LiquidityHeader'
import LiquidityPrice from '../../../features/liquidity/LiquidityPrice'
import { MinimalPositionCard } from '../../../components/PositionCard'
import NavLink from '../../../components/NavLink'
import PercentInputPanel from '../../../components/PercentInputPanel'
import ReactGA from 'react-ga'
import RemoveLiquidityReceiveDetails from '../../../features/liquidity/RemoveLiquidityReceiveDetails'
import { TransactionResponse } from '@ethersproject/providers'
import Web3Connect from '../../../components/Web3Connect'
import { currencyId } from '../../../functions/currency'
import { splitSignature } from '@ethersproject/bytes'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useCurrency } from '../../../hooks/Tokens'
import useDebouncedChangeHandler from '../../../hooks/useDebouncedChangeHandler'
import { useDerivedMintInfo } from '../../../state/mint/hooks'
import useIsArgentWallet from '../../../hooks/useIsArgentWallet'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'
import { useUserSlippageToleranceWithDefault } from '../../../state/user/hooks'
import { useV2LiquidityTokenPermit } from '../../../hooks/useERC20Permit'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { ChevronRightIcon } from '@heroicons/react/outline'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100)

const REMOVE_TIPS = {}

export default function Remove() {
  const { i18n } = useLingui()
  const router = useRouter()
  const tokens = router.query.tokens
  const [currencyIdA, currencyIdB] = tokens || [undefined, undefined]
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [currencyA?.wrapped, currencyB?.wrapped], [currencyA, currencyB])

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = i18n._(
    t`1 ${currencyA?.symbol} = ${tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} ${currencyB?.symbol}`
  )
  const textInverted = i18n._(
    t`1 ${currencyB?.symbol} = ${tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} ${currencyA?.symbol}`
  )

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const deadline = useTransactionDeadline()
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE)

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

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // router contract
  const routerContract = useRouterContract()

  // allowance handling
  const { gatherPermitSignature, signatureData } = useV2LiquidityTokenPermit(
    parsedAmounts[Field.LIQUIDITY],
    routerContract?.address
  )

  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], routerContract?.address)

  // async function onAttemptToApprove() {
  //   if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
  //   const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
  //   if (!liquidityAmount) throw new Error('missing liquidity amount')

  //   if (gatherPermitSignature) {
  //     try {
  //       await gatherPermitSignature()
  //     } catch (error) {
  //       // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
  //       if (error?.code !== 4001) {
  //         await approveCallback()
  //       }
  //     }
  //   } else {
  //     await approveCallback()
  //   }
  // }
  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (chainId !== ChainId.HARMONY && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        // @ts-ignore TYPE NEEDS FIXING
        if (error?.code !== USER_REJECTED_TX) {
          await approveCallback()
        }
      }
    } else {
      await approveCallback()
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput]
  )
  const onCurrencyAInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
    [onUserInput]
  )
  const onCurrencyBInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
    [onUserInput]
  )

  // tx sending
  const addTransaction = useTransactionAdder()

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
        })
        .catch((error: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.log(error)
        })
    }
  }

  function modalHeader() {
    return (
      <div className="grid gap-4 pb-4">
        <div className="grid gap-2 font-extrabold text-dark-primary dark:text-light-primary transition-all">
          <div className="flex items-center justify-between bg-light-bg dark:bg-dark-bg transition-all p-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <CurrencyLogo currency={currencyA} size={36} />
              <div className="text-lg">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</div>
            </div>
            <div className="ml-3 text-base">{currencyA?.symbol}</div>
          </div>
          <div className="-my-6 transition-all z-0">
            <div className="flex flex-wrap justify-center w-full px-4">
              <div className="p-1.5 rounded-2.5xl bg-light-primary dark:bg-dark-primary">
                <div className="p-2 transition-all bg-white rounded-2xl hover:bg-white/80 dark:bg-dark-bg dark:hover:bg-dark-bg/80 text-dark-bg dark:text-light-bg">
                  <PlusIcon width={24} height={24} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-light-bg dark:bg-dark-bg transition-all p-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <CurrencyLogo currency={currencyB} size={36} />
              <div className="text-lg">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</div>
            </div>
            <div className="ml-3 text-base">{currencyB?.symbol}</div>
          </div>
        </div>
        <div className="justify-start text-sm opacity-40">
          {t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
            4
          )}% your transaction will revert.`}
        </div>
      </div>
    )
  }

  function modalBottom() {
    return (
      <div className="grid gap-6 text-dark-primary dark:text-light-primary transition-all">
        <div className="grid gap-2 p-6 bg-light-bg dark:bg-dark-bg transition-all rounded-2xl">
          {pair && (
            <div className="flex items-center justify-between cursor-pointer" onClick={flipPrice}>
              <div className="text-sm">{i18n._(t`Rates`)}</div>
              <div className="flex space-x-2 items-center">
                <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5">
                  {showInverted ? text : textInverted}
                </div>
                <div>
                  <svg
                    width="2"
                    height="12"
                    viewBox="0 0 2 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-0.5"
                  >
                    <line x1="0.5" x2="0.5" y2="12" stroke="currentColor" />
                  </svg>
                </div>
                <SwitchHorizontalIcon width={18} height={18} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm">{i18n._(t`${currencyA?.symbol} / ${currencyB?.symbol} Burned`)}</div>
            <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5">
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </div>
          </div>
        </div>
        <Button
          color="gradient"
          size="lg"
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
          className="font-extrabold"
        >
          {i18n._(t`Confirm`)}
        </Button>
      </div>
    )
  }

  const pendingText = i18n._(
    t`Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${currencyA?.symbol} and ${parsedAmounts[
      Field.CURRENCY_B
    ]?.toSignificant(6)} ${currencyB?.symbol}`
  )

  const liquidityPercentChangeCallback = useCallback(
    (value: string) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value)
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA?.isNative || currencyB?.isNative

  const oneCurrencyIsWETH = Boolean(
    chainId && WNATIVE[chainId] && (currencyA?.equals(WNATIVE[chainId]) || currencyB?.equals(WNATIVE[chainId]))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        router.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        router.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, router]
  )

  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        router.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        router.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, router]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    liquidityPercentChangeCallback
  )

  return (
    <Container id="remove-liquidity-page" className="py-4 space-y-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Remove Liquidity | EvmoSwap</title>
        <meta key="description" name="description" content="Remove liquidity from the EvmoSwap AMM" />
      </Head>
      <div className="flex items-center justify-between px-4 mb-5">
        <NavLink href="/pool">
          <a className="flex items-center space-x-2 text-base text-center transition-all cursor-pointer text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80">
            <span>{i18n._(t`View Liquidity Positions`)}</span>
            <ChevronRightIcon width={18} height={18} />
          </a>
        </NavLink>
      </div>

      <DoubleGlowShadow>
        <div className="gap-4 p-6 transition-all rounded-3xl bg-light-bg dark:bg-dark-bg z-0">
          {/* <AddRemoveTabs
          creating={false}
          adding={false}
          defaultSlippage={DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE}
        /> */}
          <Header input={currencyA} output={currencyB} allowedSlippage={allowedSlippage} />
          <div>
            <TransactionConfirmationModal
              isOpen={showConfirm}
              onDismiss={handleDismissConfirmation}
              attemptingTxn={attemptingTxn}
              hash={txHash ? txHash : ''}
              content={() => (
                <ConfirmationModalContent
                  title={i18n._(t`You will receive`)}
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
            />
            <AutoColumn gap="md">
              {/* <LiquidityHeader input={currencyA} output={currencyB} /> */}

              <div className="grid gap-3">
                <PercentInputPanel
                  value={innerLiquidityPercentage}
                  onUserInput={setInnerLiquidityPercentage}
                  id="liquidity-percent"
                />

                {/* <AutoColumn justify="space-between" className="py-2.5">
                  <AutoRow justify={'flex-start'} style={{ padding: '0 1rem' }}>
                    <button className="z-10 -mt-6 -mb-6 rounded-full cursor-default bg-light-primary dark:bg-dark-primary p-2.5 transition-all">
                      <div className="p-3 rounded-full bg-light-bg dark:bg-dark-bg transition-all">
                        <ArrowDownIcon width="32px" height="32px" />
                      </div>
                    </button>
                  </AutoRow>
                </AutoColumn> */}

                <div
                  id="remove-liquidity-output"
                  className="p-5 rounded text-dark-primary dark:text-light-primary bg-light-primary dark:bg-dark-primary transition-all"
                >
                  <div className="grid gap-3 sm:space-y-0 sm:flex-row">
                    <div className="flex w-full justify-between items-center">
                      <div className="text-base">You will receive</div>
                      {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                        <div className="text-sm">
                          {oneCurrencyIsETH ? (
                            <Link
                              href={`/remove/${currencyA?.isNative ? WNATIVE_ADDRESS[chainId] : currencyIdA}/${
                                currencyB?.isNative ? WNATIVE_ADDRESS[chainId] : currencyIdB
                              }`}
                            >
                              <a className="flex space-x-2 items-center text-baseline opacity-80 hover:opacity-100 whitespace-nowrap transition-all">
                                <div>Receive W{NATIVE[chainId].symbol}</div>
                                <div>
                                  <svg
                                    width="2"
                                    height="12"
                                    viewBox="0 0 2 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="ml-0.5"
                                  >
                                    <line x1="0.5" x2="0.5" y2="12" stroke="currentColor" />
                                  </svg>
                                </div>
                                <SwitchHorizontalIcon width={18} height={18} />
                              </a>
                            </Link>
                          ) : oneCurrencyIsWETH ? (
                            <Link
                              href={`/remove/${currencyA?.equals(WNATIVE[chainId]) ? 'EVMOS' : currencyIdA}/${
                                currencyB?.equals(WNATIVE[chainId]) ? 'EVMOS' : currencyIdB
                              }`}
                            >
                              <a className="flex space-x-2 items-center text-baseline opacity-80 hover:opacity-100 whitespace-nowrap transition-all">
                                <div>Receive {NATIVE[chainId].symbol}</div>
                                <div>
                                  <svg
                                    width="2"
                                    height="12"
                                    viewBox="0 0 2 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="ml-0.5"
                                  >
                                    <line x1="0.5" x2="0.5" y2="12" stroke="currentColor" />
                                  </svg>
                                </div>
                                <SwitchHorizontalIcon width={18} height={18} />
                              </a>
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col space-x-4 md:flex-row">
                      <div className="flex flex-row items-center w-full py-3 pl-5 pr-8 space-x-3 rounded bg-light-bg dark:bg-dark-bg transition-all">
                        <CurrencyLogo currency={currencyA} size={36} />
                        <AutoColumn>
                          <div className="font-extrabold truncate">{formattedAmounts[Field.CURRENCY_A] || '-'}</div>
                          <div className="text-sm">{currencyA?.symbol}</div>
                        </AutoColumn>
                      </div>
                      <div className="flex flex-row items-center w-full py-3 pl-5 pr-8 space-x-3 rounded bg-light-bg dark:bg-dark-bg transition-all">
                        <CurrencyLogo currency={currencyB} size={36} />
                        <AutoColumn>
                          <div className="font-extrabold truncate">{formattedAmounts[Field.CURRENCY_B] || '-'}</div>
                          <div className="text-sm">{currencyB?.symbol}</div>
                        </AutoColumn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                {!account ? (
                  <Web3Connect size="lg" color="blue" className="w-full" />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <ButtonError
                      variant="outlined"
                      onClick={() => {
                        setShowConfirm(true)
                      }}
                      disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                      error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                      color="red"
                      className="font-bold"
                    >
                      {error || i18n._(t`Remove`)}
                    </ButtonError>
                    <ButtonConfirmed
                      onClick={onAttemptToApprove}
                      confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                      disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                      className="font-bold"
                    >
                      {approval === ApprovalState.PENDING ? (
                        <Dots>{i18n._(t`Approving`)}</Dots>
                      ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                        i18n._(t`Approved`)
                      ) : (
                        i18n._(t`Approve`)
                      )}
                    </ButtonConfirmed>
                  </div>
                )}
              </div>
            </AutoColumn>
          </div>

          {pair ? <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} /> : null}
        </div>
      </DoubleGlowShadow>
    </Container>
  )
}
