import { Currency, CurrencyAmount, Fraction, Percent } from '@evmoswap/core-sdk'

import Button from '../../components/Button'
import { Field } from '../../state/mint/actions'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CurrencyLogo } from 'app/components/CurrencyLogo'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
  estimatedSLP,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  poolTokenPercentage?: Percent
  onAdd: () => void
  estimatedSLP?: CurrencyAmount<Currency>,
}) {
  const { i18n } = useLingui()
  return (
    <div className="mt-0 rounded">
      {/* <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <div className="text-sm text-high-emphesis">{i18n._(t`Rates`)}</div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {`1 ${parsedAmounts[Field.CURRENCY_A]?.currency.symbol} = ${price?.toSignificant(4)} ${
              parsedAmounts[Field.CURRENCY_B]?.currency.symbol
            }`}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {`1 ${parsedAmounts[Field.CURRENCY_B]?.currency.symbol} = ${price?.invert()?.toSignificant(4)} ${
              parsedAmounts[Field.CURRENCY_A]?.currency.symbol
            }`}
          </div>
        </div>
      </div> */}
      {/* <div className="h-px my-6 bg-gray-700" /> */}
      {/* <div className="grid gap-1 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">{i18n._(t`${currencies[Field.CURRENCY_A]?.symbol} Deposited`)}</div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            <div>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</div>
            <span className="ml-1">{parsedAmounts[Field.CURRENCY_A]?.currency.symbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">{i18n._(t`${currencies[Field.CURRENCY_B]?.symbol} Deposited`)}</div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            <div>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</div>
            <span className="ml-1">{parsedAmounts[Field.CURRENCY_B]?.currency.symbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">{i18n._(t`Share of Pool:`)}</div>
          <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphesis">
            {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
          </div>
        </div>
      </div> */}
      <div className='p-4 my-2 rounded-lg bg-dark-1000'>
        <div className='flex justify-between mb-2'>
          You are depositing:
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">{i18n._(t`Share of Pool:`)}</div>
            <div className="text-sm justify-center items-center flex right-align pl-1.5 text-white">
              {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
            </div>
          </div>
        </div>
        <div className='flex gap-2 p-4 border-[1px] border-gray-600 rounded-t-lg bg-dark-800'>
          <CurrencyLogo currency={parsedAmounts[Field.CURRENCY_A]?.currency} />
          {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}&nbsp;
          {parsedAmounts[Field.CURRENCY_A]?.currency.symbol}
        </div>
        <div className='flex gap-2 p-4 border-[1px] border-gray-600 rounded-b-lg bg-dark-800'>
          <CurrencyLogo currency={parsedAmounts[Field.CURRENCY_B]?.currency} />
          {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}&nbsp;
          {parsedAmounts[Field.CURRENCY_B]?.currency.symbol}
        </div>
      </div>
      <div className='p-4 mb-4 rounded-lg bg-dark-1000'>
        <div>You will receive(at least):</div>
        <div className='flex items-center justify-between mt-1 font-bold text-white'>
          {estimatedSLP?.toSignificant(6)}&nbsp;
          <div>
            {parsedAmounts[Field.CURRENCY_A]?.currency.symbol}/
            {parsedAmounts[Field.CURRENCY_B]?.currency.symbol}
            &nbsp;LP Token
          </div>
        </div>
      </div>

      <Button color="blue" size="lg" onClick={onAdd}>
        {noLiquidity ? i18n._(t`Create Pool & Supply`) : i18n._(t`Confirm Deposit`)}
      </Button>
    </div>
  )
}

export default ConfirmAddModalBottom
