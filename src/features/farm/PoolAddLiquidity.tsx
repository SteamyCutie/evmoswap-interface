import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChainId, CurrencyAmount } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import { ZERO_PERCENT } from 'app/constants'
import { useFarmListItemDetailsModal } from 'app/features/farm/FarmListItemDetails'

import { calculateGasMargin, calculateSlippageAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useRouterContract } from 'app/hooks/useContract'
import useTransactionDeadline from 'app/hooks/useTransactionDeadline'
import { useActiveWeb3React } from 'app/services/web3'
import { Field } from 'app/state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'app/state/mint/hooks'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useExpertModeManager } from 'app/state/user/hooks'
import React, { useState, useCallback } from 'react'
import ReactGA from 'react-ga'
import { Currency } from '@evmoswap/core-sdk'
import { maxAmountSpend } from 'app/functions'
import CurrencyInput from 'app/components/CurrencyInput'
import { AutoColumn } from 'app/components/Column'
import { AutoRow } from 'app/components/Row'
import { Plus } from 'react-feather'
import { RowBetween } from 'app/components/Row'
import Dots from 'app/components/Dots'
import { ButtonError } from 'app/components/Button'
import { useUserSlippageToleranceWithDefault } from 'app/state/user/hooks'
import { Percent, NATIVE } from '@evmoswap/core-sdk'
import { ConfirmationModalContent } from 'app/modals/TransactionConfirmationModal'
import ConfirmAddModalBottom from '../liquidity/ConfirmAddModalBottom'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

// @ts-ignore TYPE NEEDS FIXING
const PoolDeposit = ({ currencyA, currencyB, header, handleDismiss }) => {
  const { i18n } = useLingui()
  const { setContent } = useFarmListItemDetailsModal()
  const { account, chainId, library } = useActiveWeb3React()
  const [useETH, setUseETH] = useState(chainId !== ChainId.CELO)
  const [isExpertMode] = useExpertModeManager()
  const deadline = useTransactionDeadline() // custom from users settings
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  // const allowedSlippage = useAppSelector(selectSlippage)
  const routerContract = useRouterContract()
  const addTransaction = useTransactionAdder()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    parsedAmounts,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
    price,
    currencyBalances,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], routerContract?.address)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], routerContract?.address)

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

  const [txHash, setTxHash] = useState<string>('')
  const handleDismissConfirmation = useCallback(() => {
    setContent(undefined)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash, setContent])
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE) // custom from users

  const modalHeader = () => {
    return (
      <div className="pt-3 text-base text-secondary">
        {i18n._(t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
          4
        )}% your transaction
          will revert.`)}
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
        estimatedSLP={liquidityMinted}
      />
    )
  }

  const pendingText = i18n._(
    t`Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
      currencies[Field.CURRENCY_A]?.symbol
    } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`
  )

  async function onAdd() {
    if (!chainId || !library || !account || !routerContract) return

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts

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

          onFieldAInput('')
        })
      )
      .catch((error) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
    setTimeout(() => {
      handleDismiss()
    }, 4000)
  }

  return (
    <>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-4 bg-dark-1000/40 -z-10">
        {header}
        <CurrencyInput
          value={formattedAmounts[Field.CURRENCY_A]}
          onUserInput={onFieldAInput}
          onMax={() => {
            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
          }}
          showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
          currency={currencies[Field.CURRENCY_A]}
          id="add-liquidity-input-tokena"
          showCommonBases
        />
        <div className="mx-auto">
          <AutoColumn justify="space-between" className="py-2.5">
            <AutoRow justify={isExpertMode ? 'space-between' : 'flex-start'} style={{ padding: '0 1rem' }}>
              <button className="z-10 -mt-6 -mb-6 rounded-full cursor-default bg-dark-900 p-3px">
                <div className="p-3 rounded-full bg-dark-800">
                  <Plus size="16" />
                </div>
              </button>
            </AutoRow>
          </AutoColumn>
        </div>
        <CurrencyInput
          value={formattedAmounts[Field.CURRENCY_B]}
          onUserInput={onFieldBInput}
          onMax={() => {
            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
          }}
          showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
          currency={currencies[Field.CURRENCY_B]}
          id="add-liquidity-input-tokenb"
          showCommonBases
        />

        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING ||
          isValid) && (
          <AutoColumn gap={'md'}>
            {
              <RowBetween>
                {approvalA !== ApprovalState.APPROVED && currencyA !== NATIVE[chainId] && (
                  <Button
                    color="blue"
                    size="lg"
                    onClick={approveACallback}
                    disabled={approvalA === ApprovalState.PENDING}
                    style={{
                      width: approvalB !== ApprovalState.APPROVED && currencyB !== NATIVE[chainId] ? '48%' : '100%',
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
                    color="blue"
                    size="lg"
                    onClick={approveBCallback}
                    disabled={approvalB === ApprovalState.PENDING}
                    style={{
                      width: approvalA !== ApprovalState.APPROVED && currencyA !== NATIVE[chainId] ? '48%' : '100%',
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
          </AutoColumn>
        )}
        {approvalA === ApprovalState.APPROVED && approvalB === ApprovalState.APPROVED && (
          <ButtonError
            onClick={() => {
              isExpertMode
                ? onAdd()
                : setContent(
                    <ConfirmationModalContent
                      title={noLiquidity ? i18n._(t`You are creating a pool`) : i18n._(t`Confirm add liquidity`)}
                      onDismiss={handleDismissConfirmation}
                      topContent={modalHeader}
                      bottomContent={modalBottom}
                    />
                  )
            }}
            color={error ? 'gray' : 'blue'}
            disabled={approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
            error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
          >
            {error ? error : i18n._(t`Confirm Adding Liquidity`)}
          </ButtonError>
        )}
      </HeadlessUiModal.BorderedContent>
    </>
  )
}

export default PoolDeposit
