import { Currency, CurrencyAmount, JSBI, Token, TradeType, Trade as V2Trade } from '@evmoswap/core-sdk'
import { ApprovalState, useApproveCallbackFromTrade } from '../../../hooks/useApproveCallback'
import { BottomGrouping, SwapCallbackError } from '../../../features/swap/styleds'
import { ButtonConfirmed, ButtonError } from '../../../components/Button'
import Column, { AutoColumn } from '../../../components/Column'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAllTokens, useCurrency } from '../../../hooks/Tokens'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserTransactionTTL } from '../../../state/user/hooks'
import { useNetworkModalToggle, useToggleSettingsMenu, useWalletModalToggle } from '../../../state/application/hooks'
import useWrapCallback, { WrapType } from '../../../hooks/useWrapCallback'

import AddressInputPanel from '../../../components/AddressInputPanel'
import Alert from '../../../components/Alert'
import Button from '../../../components/Button'
import ConfirmSwapModal from '../../../features/swap/ConfirmSwapModal'
import Container from '../../../components/Container'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import { Field } from '../../../state/swap/actions'
import Head from 'next/head'
import Loader from '../../../components/Loader'
import Lottie from 'lottie-react'
import ProgressSteps from '../../../components/ProgressSteps'
import ReactGA from 'react-ga'
import SwapHeader from '../../../features/trade/Header'
import TokenWarningModal from '../../../modals/TokenWarningModal'
import TradePrice from '../../../features/swap/TradePrice'
import UnsupportedCurrencyFooter from '../../../features/swap/UnsupportedCurrencyFooter'
import Web3Connect from '../../../components/Web3Connect'
import { classNames } from '../../../functions'
import { computeFiatValuePriceImpact } from '../../../functions/trade'
import confirmPriceImpactWithoutFee from '../../../features/swap/confirmPriceImpactWithoutFee'
import { maxAmountSpend } from '../../../functions/currency'
import swapArrowsAnimationData from '../../../animation/swap-arrows.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import useENSAddress from '../../../hooks/useENSAddress'
import useIsArgentWallet from '../../../hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from '../../../hooks/useIsSwapUnsupported'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useSwapCallback } from '../../../hooks/useSwapCallback'
import { useUSDCValue } from '../../../hooks/useUSDCPrice'
import { warningSeverity } from '../../../functions/prices'

import Banner from '../../../components/Banner'
import { useStableSwapCallback } from 'app/features/exchange-stable/hooks'
import TradingMode, { TRADING_MODE } from 'app/features/exchange-stable/components/TradingMode'
import _ from 'lodash'
import { SwitchVerticalIcon } from '@heroicons/react/outline'

const Swap = () => {
  const { i18n } = useLingui()

  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account, chainId } = useActiveWeb3React()

  const toggleNetworkModal = useNetworkModalToggle()

  const router = useRouter()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()
  const toggleSettings = useToggleSettingsMenu()

  // get custom setting values for user
  const [ttl] = useUserTransactionTTL()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount: standardParsedAmount,
    currencies,
    inputError: standardInputError,
    allowedSlippage,
  } = useDerivedSwapInfo()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  //stable swap callback
  const {
    stableTrade,
    tradingMode,
    parsedOutputAmount: stableParsedAmount,
    approval: stableApproval,
    approvalCallback: stableApprovalCallback,
    swapCallback: stableSwapCallback,
    inputError: stableInputError,
  } = useStableSwapCallback(allowedSlippage)
  const isStableSwap = tradingMode === TRADING_MODE.STABLE

  const trade = showWrap ? undefined : isStableSwap ? stableTrade : v2Trade

  const swapInputError = isStableSwap ? standardInputError ?? stableInputError : standardInputError

  const parsedAmount = isStableSwap ? stableParsedAmount : standardParsedAmount

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const isValid = !swapInputError

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    router.push('/swap/')
  }, [router])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const routeNotFound = !trade?.route

  // check whether the user has approved the router on the input token
  const [approval, approveCallbackV2] = useApproveCallbackFromTrade(trade, allowedSlippage)
  const approvalState = isStableSwap ? stableApproval : approval
  const approveCallback = isStableSwap ? stableApprovalCallback : approveCallbackV2

  const signatureData = undefined

  // const {
  //   state: signatureState,
  //   signatureData,
  //   gatherPermitSignature,
  // } = useERC20PermitFromTrade(trade, allowedSlippage)

  const handleApprove = useCallback(async () => {
    await approveCallback()
    // if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //   try {
    //     await gatherPermitSignature()
    //   } catch (error) {
    //     // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //     if (error?.code !== 4001) {
    //       await approveCallback()
    //     }
    //   }
    // } else {
    //   await approveCallback()
    // }
  }, [approveCallback])
  // }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient,
    signatureData
  )

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    let callbackToUse = swapCallback

    if (tradingMode === TRADING_MODE.STABLE) callbackToUse = stableSwapCallback

    if (!callbackToUse) {
      return
    }

    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }

    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }

    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    callbackToUse()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
        })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            singleHopOnly ? 'SH' : 'MH',
          ].join('/'),
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled',
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    swapCallback,
    stableSwapCallback,
    tradingMode,
    priceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
    singleHopOnly,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = trade?.priceImpact
    return warningSeverity(
      executionPriceImpact && priceImpact
        ? executionPriceImpact.greaterThan(priceImpact)
          ? executionPriceImpact
          : priceImpact
        : executionPriceImpact ?? priceImpact
    )
  }, [priceImpact, trade])

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode

  const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

  return (
    <Container id="swap-page" className="py-4 md:py-8 lg:py-24">
      <Head>
        <title>{i18n._(t`EvmoSwap`)} | EvmoSwap</title>
        <meta
          key="description"
          name="description"
          content="EvmoSwap allows for swapping of ERC20 compatible tokens across multiple networks"
        />
      </Head>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <DoubleGlowShadow>
        <div className="gap-4 p-6 transition-all rounded-3xl z-0">
          <SwapHeader
            input={currencies[Field.INPUT]}
            output={currencies[Field.OUTPUT]}
            allowedSlippage={allowedSlippage}
          />

          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <div>
            <CurrencyInputPanel
              // priceImpact={priceImpact}
              label={
                independentField === Field.OUTPUT && !showWrap ? i18n._(t`Swap From (est.):`) : i18n._(t`Swap From:`)
              }
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueInput ?? undefined}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              showCommonBases={true}
              id="swap-currency-input"
            />
            <AutoColumn
              justify="space-between"
              className={classNames(isExpertMode ? '-mt-3 -mb-3' : '-mt-4 -mb-7', 'transition-all pl-2')}
            >
              <div
                className={classNames(
                  isExpertMode ? 'justify-between' : 'justify-center',
                  'px-4 flex-wrap w-full flex'
                )}
              >
                <button
                  className="z-0 rounded-3xl"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                >
                  <div className="p-1.5 rounded-[18px] bg-light-bg dark:bg-dark-bg transition-all">
                    <div
                      className="p-3 transition-all bg-light-primary rounded-1.5xl hover:bg-light-primary/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 text-dark-bg dark:text-light-bg"
                      // onMouseEnter={() => setAnimateSwapArrows(true)}
                      // onMouseLeave={() => setAnimateSwapArrows(false)}
                    >
                      <SwitchVerticalIcon width={18} height={18} />
                      {/* <Lottie
                        animationData={swapArrowsAnimationData}
                        autoplay={animateSwapArrows}
                        loop={false}
                        style={{ width: 32, height: 32 }}
                      /> */}
                    </div>
                  </div>
                </button>
                {isExpertMode ? (
                  <div className="flex items-center transition-all text-dark-bg dark:text-light-bg hover:text-dark-bg/80 dark:hover:text-light-bg/80">
                    {recipient === null && !showWrap ? (
                      <Button size="xs" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                        + Add recipient (optional)
                      </Button>
                    ) : (
                      <Button size="xs" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                        - {i18n._(t`Remove recipient`)}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </AutoColumn>

            <div>
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap ? i18n._(t`Swap To (est.):`) : i18n._(t`Swap To:`)}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={priceImpact}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases={true}
                id="swap-currency-output"
              />
              {Boolean(trade) && (
                <div className="grid p-5 mt-2 gap-2 transition-all bg-white cursor-pointer dark:bg-dark-primary border border-light-stroke dark:border-dark-stroke rounded-xl">
                  <TradePrice
                    price={trade?.executionPrice}
                    showInverted={showInverted}
                    setShowInverted={setShowInverted}
                    className=""
                  />
                  <TradingMode mode={tradingMode} />
                </div>
              )}
            </div>
          </div>

          {recipient !== null && !showWrap && (
            <>
              <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              {recipient !== account && (
                <Alert
                  type="warning"
                  dismissable={false}
                  showIcon
                  className="p-4 md:p-4 md:pl-4 md:pr-6"
                  message={i18n._(
                    t`Please note that the recipient address is different from the connected wallet address.`
                  )}
                />
              )}
            </>
          )}

          {/* {showWrap ? null : (
            <div
              style={{
                padding: showWrap ? '.25rem 1rem 0 1rem' : '0px',
              }}
            >
              <div className="px-5 mt-1">{doArcher && userHasSpecifiedInputOutput && <MinerTip />}</div>
            </div>
          )} */}
          {/*
          {trade && (
            <div className="p-5 rounded bg-dark-800">
              <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
            </div>
          )} */}

          <BottomGrouping>
            {swapIsUnsupported ? (
              <Button color="red" size="lg" disabled>
                {i18n._(t`Unsupported Asset`)}
              </Button>
            ) : !account ? (
              <Web3Connect size="lg" className="w-full" />
            ) : showWrap ? (
              <Button color="gradient" size="lg" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP
                    ? i18n._(t`Wrap`)
                    : wrapType === WrapType.UNWRAP
                    ? i18n._(t`Unwrap`)
                    : null)}
              </Button>
            ) : routeNotFound && userHasSpecifiedInputOutput ? (
              <div className="grid justify-center text-sm text-center text-dark-primary dark:text-light-primary">
                <div className="mb-1">{i18n._(t`Insufficient liquidity for this trade`)}</div>
                {singleHopOnly && <div className="mb-1">{i18n._(t`Try enabling multi-hop trades`)}</div>}
              </div>
            ) : showApproveFlow ? (
              <div>
                {approvalState !== ApprovalState.APPROVED && (
                  <ButtonConfirmed
                    onClick={handleApprove}
                    disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    size="lg"
                    color="gradient"
                  >
                    {approvalState === ApprovalState.PENDING ? (
                      <div className="flex items-center justify-center h-full space-x-2">
                        <div>Approving</div>
                        <Loader stroke="white" />
                      </div>
                    ) : (
                      i18n._(t`Approve ${currencies[Field.INPUT]?.symbol}`)
                    )}
                  </ButtonConfirmed>
                )}
                {approvalState === ApprovalState.APPROVED && (
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    style={{
                      width: '100%',
                    }}
                    id="swap-button"
                    disabled={
                      !isValid || approvalState !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    error={isValid && priceImpactSeverity > 2}
                    className="text-sm font-extrabold transition-all"
                  >
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? i18n._(t`Price Impact High`)
                      : priceImpactSeverity > 2
                      ? i18n._(t`Swap Anyway`)
                      : i18n._(t`Swap`)}
                  </ButtonError>
                )}
              </div>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                className="text-sm font-extrabold transition-all"
              >
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3 && !isExpertMode
                  ? i18n._(t`Price Impact Too High`)
                  : priceImpactSeverity > 2
                  ? i18n._(t`Swap Anyway`)
                  : i18n._(t`Swap`)}
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approvalState === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>
          {/* {!swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies.INPUT, currencies.OUTPUT]}
        />
      )} */}

          {!swapIsUnsupported ? null : (
            <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
          )}
        </div>
        <Banner />
      </DoubleGlowShadow>
    </Container>
  )
}

export default Swap
