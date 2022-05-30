import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { AutoRow, RowBetween } from '../../../components/Row'
import Button, { ButtonError } from '../../../components/Button'
import { Currency, CurrencyAmount, Percent, WNATIVE, currencyEquals, NATIVE } from '@evmoswap/core-sdk'
import { ONE_BIPS, ZERO_PERCENT } from '../../../constants'
import React, { useCallback, useState } from 'react'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../../modals/TransactionConfirmationModal'
import { calculateGasMargin, calculateSlippageAmount } from '../../../functions/trade'
import { currencyId, maxAmountSpend } from '../../../functions/currency'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../../state/mint/hooks'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from '../../../state/user/hooks'
import Alert from '../../../components/Alert'
import { AutoColumn } from '../../../components/Column'
import { BigNumber } from '@ethersproject/bignumber'
import { ConfirmAddModalBottom } from '../../../features/liquidity/ConfirmAddModalBottom'
import Container from '../../../components/Container'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'
import Dots from '../../../components/Dots'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import ExchangeHeader from '../../../features/trade/Header'
import { Field } from '../../../state/mint/actions'
import Head from 'next/head'
import LiquidityHeader from '../../../features/liquidity/LiquidityHeader'
import LiquidityPrice from '../../../features/liquidity/LiquidityPrice'
import { MinimalPositionCard } from '../../../components/PositionCard'
import NavLink from '../../../components/NavLink'
import { PairState } from '../../../hooks/useV2Pairs'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { TransactionResponse } from '@ethersproject/providers'
import UnsupportedCurrencyFooter from '../../../features/swap/UnsupportedCurrencyFooter'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useCurrency } from '../../../hooks/Tokens'
import { useIsSwapUnsupported } from '../../../hooks/useIsSwapUnsupported'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useRouterContract } from '../../../hooks/useContract'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { ChevronRightIcon } from '@heroicons/react/outline'
import { PlusIcon } from '@heroicons/react/solid'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function Add() {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()
  const router = useRouter()
  const tokens = router.query.tokens
  const [currencyIdA, currencyIdB] = (tokens as string[]) || [undefined, undefined]

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WNATIVE[chainId])) ||
        (currencyB && currencyEquals(currencyB, WNATIVE[chainId])))
  )

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const [isExpertMode] = useExpertModeManager()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  // const [allowedSlippage] = useUserSlippageTolerance(); // custom from users

  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE) // custom from users

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  const routerContract = useRouterContract()

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], routerContract?.address)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], routerContract?.address)

  const addTransaction = useTransactionAdder()

  async function onAdd() {
    if (!chainId || !library || !account || !routerContract) return

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts

    console.log({ parsedAmountA, parsedAmountB, currencyA, currencyB, deadline })

    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
    }

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null
    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsETH = currencyB.isNative
      estimate = routerContract.estimateGas.addLiquidityETH
      method = routerContract.addLiquidityETH
      args = [
        (tokenBIsETH ? currencyA : currencyB)?.wrapped?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).quotient.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).quotient.toString())
    } else {
      estimate = routerContract.estimateGas.addLiquidity
      method = routerContract.addLiquidity
      args = [
        currencyA?.wrapped?.address ?? '',
        currencyB?.wrapped?.address ?? '',
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ]
      value = null
    }

    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: i18n._(
              t`Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
                currencies[Field.CURRENCY_A]?.symbol
              } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`
            ),
          })

          setTxHash(response.hash)

          ReactGA.event({
            category: 'Liquidity',
            action: 'Add',
            label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
          })
        })
      )
      .catch((error) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <div className="pb-4">
        <div className="flex items-center justify-start gap-6 bg-light-bg dark:bg-dark-bg px-6 py-4 rounded-xl">
          <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} size={40} className="-space-x-2" />
          <div className="text-lg font-extrabold text-dark-bg dark:text-light-bg transition-all">
            {currencies[Field.CURRENCY_A]?.symbol + ' / ' + currencies[Field.CURRENCY_B]?.symbol}
          </div>
        </div>
      </div>
    ) : (
      <div className="pb-4">
        <div className="flex items-center justify-start gap-6 bg-light-bg dark:bg-dark-bg px-6 py-4 rounded-xl">
          <div className="grid grid-flow-col gap-4">
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} size={40} className="-space-x-2" />
          </div>
          <div className="grid">
            <div className="text-base font-extrabold md:text-lg text-dark-primary dark:text-light-primary transition-all">
              {liquidityMinted?.toSignificant(6)}
            </div>
            <div className="text-sm font-medium md:text-base text-dark-primary dark:text-light-primary transition-all">
              {currencies[Field.CURRENCY_A]?.symbol} / {currencies[Field.CURRENCY_B]?.symbol}
              &nbsp;{i18n._(t`pool token`)}
            </div>
          </div>
        </div>
        <div className="pt-6 text-xs text-dark-primary/80 dark:text-light-primary/30">
          {i18n._(
            t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
              4
            )}% your transaction will revert.`
          )}
        </div>
      </div>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = i18n._(
    t`Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
      currencies[Field.CURRENCY_A]?.symbol
    } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`
  )

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        router.push(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        router.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, router, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          router.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          router.push(`/add/${newCurrencyIdB}`)
        }
      } else {
        router.push(`/add/${currencyIdA ? currencyIdA : 'EVMOS'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, router, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  // console.log(
  //   { addIsUnsupported, isValid, approvalA, approvalB },
  //   approvalA === ApprovalState.APPROVED && approvalB === ApprovalState.APPROVED
  // )
  return (
    <>
      <Head>
        <title>Add Liquidity | EvmoSwap</title>
        <meta
          key="description"
          name="description"
          content="Add liquidity to the EvmoSwap AMM to enable gas optimised and low slippage trades across countless networks"
        />
      </Head>

      <Container id="add-liquidity-page" className="py-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">
        <div className="flex items-center mb-5">
          <NavLink href="/pool">
            <a className="flex items-center space-x-2 text-base text-center transition-all cursor-pointer text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80">
              <span>{i18n._(t`View Liquidity Positions`)}</span>
              <ChevronRightIcon width={18} height={18} />
            </a>
          </NavLink>
          {/* <button
            style={{
              backgroundColor: 'rgba(167, 85, 221, 0.25)',
              border: '1px solid #A755DD',
              borderRadius: 20,
              padding: '5px 40px',
              fontSize: 14,
            }}
          >
            FARM THE {currencies[Field.CURRENCY_A]?.symbol}-{currencies[Field.CURRENCY_B]?.symbol} POOL
          </button> */}
        </div>

        <Alert
          message={
            noLiquidity ? (
              i18n._(
                t`When creating a pair you are the first liquidity provider. The ratio of tokens you add will set the price of this pool. Once you are happy with the rate, click supply to review`
              )
            ) : (
              <>
                <b>{i18n._(t`Tip:`)}</b>{' '}
                {i18n._(
                  t`By adding liquidity you'll earn 0.25% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`
                )}
              </>
            )
          }
          type="information"
          dismissable={false}
        />

        <DoubleGlowShadow>
          <div className="gap-4 p-6 transition-all rounded-3xl z-0">
            {/* <AddRemoveTabs creating={isCreate} adding={true} defaultSlippage={DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE} /> */}

            <ExchangeHeader
              input={currencies[Field.CURRENCY_A]}
              output={currencies[Field.CURRENCY_B]}
              allowedSlippage={allowedSlippage}
            />

            <TransactionConfirmationModal
              isOpen={showConfirm}
              onDismiss={handleDismissConfirmation}
              attemptingTxn={attemptingTxn}
              hash={txHash}
              content={() => (
                <ConfirmationModalContent
                  title={noLiquidity ? i18n._(t`You are creating a pool`) : i18n._(t`You will receive`)}
                  onDismiss={handleDismissConfirmation}
                  topContent={modalHeader}
                  bottomContent={modalBottom}
                />
              )}
              pendingText={pendingText}
            />
            <div className="flex flex-col space-y-4">
              {pair && pairState !== PairState.INVALID && (
                <LiquidityHeader input={currencies[Field.CURRENCY_A]} output={currencies[Field.CURRENCY_B]} />
              )}

              <div>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onFieldAInput}
                  onMax={() => {
                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  }}
                  onCurrencySelect={handleCurrencyASelect}
                  showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                  currency={currencies[Field.CURRENCY_A]}
                  id="add-liquidity-input-tokena"
                  showCommonBases
                />

                <AutoColumn justify="space-between" className="pl-2 -mt-4 -mb-6 transition-all">
                  <div className="flex flex-wrap justify-center w-full px-4">
                    <div className="p-1.5 rounded-2.5xl bg-light-bg dark:bg-dark-bg transition-all">
                      <div className="p-2 transition-all bg-white rounded-2xl hover:bg-white/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 text-dark-bg dark:text-light-bg">
                        <PlusIcon width={24} height={24} />
                      </div>
                    </div>
                  </div>
                </AutoColumn>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onFieldBInput}
                  onCurrencySelect={handleCurrencyBSelect}
                  onMax={() => {
                    onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                  }}
                  showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                  currency={currencies[Field.CURRENCY_B]}
                  id="add-liquidity-input-tokenb"
                  showCommonBases
                />
              </div>

              {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
                <div className="p-px rounded-2xl bg-light-stroke dark:bg-dark-stroke transition-all">
                  <LiquidityPrice
                    currencies={currencies}
                    price={price}
                    noLiquidity={noLiquidity}
                    poolTokenPercentage={poolTokenPercentage}
                    className="bg-light-primary dark:bg-dark-primary transition-all rounded-2xl"
                  />
                </div>
              )}

              {addIsUnsupported ? (
                <Button color="red" size="lg" disabled className="font-extrabold">
                  {i18n._(t`Unsupported Asset`)}
                </Button>
              ) : !account ? (
                <Web3Connect size="lg" color="gradient" className="w-full py-4 font-extrabold" />
              ) : (
                (approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING ||
                  isValid) && (
                  <AutoColumn gap={'md'}>
                    {
                      <RowBetween>
                        {approvalA !== ApprovalState.APPROVED && currencyA !== NATIVE[chainId] && (
                          <Button
                            color="gradient"
                            size="lg"
                            onClick={approveACallback}
                            disabled={approvalA === ApprovalState.PENDING}
                            className="font-extrabold"
                            style={{
                              width:
                                approvalB !== ApprovalState.APPROVED && currencyB !== NATIVE[chainId] ? '48%' : '100%',
                            }}
                          >
                            {approvalA === ApprovalState.PENDING ? (
                              <Dots>{i18n._(t`Approving ${currencies[Field.CURRENCY_A]?.symbol}`)}</Dots>
                            ) : (
                              i18n._(t`Approve ${currencies[Field.CURRENCY_A]?.symbol}`)
                            )}
                          </Button>
                        )}
                        {approvalB !== ApprovalState.APPROVED && currencyB !== NATIVE[chainId] && (
                          <Button
                            color="gradient"
                            size="lg"
                            onClick={approveBCallback}
                            disabled={approvalB === ApprovalState.PENDING}
                            className="font-extrabold"
                            style={{
                              width:
                                approvalA !== ApprovalState.APPROVED && currencyA !== NATIVE[chainId] ? '48%' : '100%',
                            }}
                          >
                            {approvalB === ApprovalState.PENDING ? (
                              <Dots>{i18n._(t`Approving ${currencies[Field.CURRENCY_B]?.symbol}`)}</Dots>
                            ) : (
                              i18n._(t`Approve ${currencies[Field.CURRENCY_B]?.symbol}`)
                            )}
                          </Button>
                        )}
                      </RowBetween>
                    }

                    {approvalA === ApprovalState.APPROVED && approvalB === ApprovalState.APPROVED && (
                      <ButtonError
                        onClick={() => {
                          isExpertMode ? onAdd() : setShowConfirm(true)
                        }}
                        disabled={
                          !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                        }
                        error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                        className="font-extrabold"
                      >
                        {error ?? i18n._(t`Confirm Adding Liquidity`)}
                      </ButtonError>
                    )}
                  </AutoColumn>
                )
              )}
            </div>

            {!addIsUnsupported ? (
              pair && !noLiquidity && pairState !== PairState.INVALID ? (
                <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
              ) : null
            ) : (
              <UnsupportedCurrencyFooter
                show={addIsUnsupported}
                currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
              />
            )}
          </div>
        </DoubleGlowShadow>
      </Container>
    </>
  )
}
