import { Currency, Percent, Price } from '@evmoswap/core-sdk'

import { Field } from '../../state/mint/actions'
import { ONE_BIPS } from '../../constants'
import React from 'react'
import Typography from '../../components/Typography'
import { classNames } from '../../functions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function LiquidityPrice({
  currencies,
  price,
  noLiquidity,
  poolTokenPercentage,
  className,
}: {
  currencies: { [field in Field]?: Currency }
  price?: Price<Currency, Currency>
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  className?: string
}): JSX.Element {
  const { i18n } = useLingui()
  return (
    <div className={classNames('flex justify-between items-center rounded py-4 px-5 bg-dark-900', className)}>
      <div className="flex flex-col w-full font-extrabold text-dark-primary dark:text-light-primary">
        <div className="text-sm">
          {i18n._(
            t`${price?.toSignificant(6) ?? '-'} ${currencies[Field.CURRENCY_B]?.symbol} per ${
              currencies[Field.CURRENCY_A]?.symbol
            }`
          )}
        </div>
        <div className="text-sm">
          {i18n._(
            t`${price?.invert()?.toSignificant(6) ?? '-'} ${currencies[Field.CURRENCY_A]?.symbol} per ${
              currencies[Field.CURRENCY_B]?.symbol
            }`
          )}
        </div>
      </div>

      <div className="flex flex-col w-full font-light text-right text-dark-primary dark:text-light-primary">
        <div className="text-sm">
          {noLiquidity && price
            ? '100'
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
          %
        </div>
        <div className="text-sm">{i18n._(t`Share of Pool`)}</div>
      </div>
    </div>
  )
}
