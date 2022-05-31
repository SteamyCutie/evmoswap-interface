import { Currency, CurrencyAmount } from '@evmoswap/core-sdk'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { RowBetween } from 'app/components/Row'
import QuestionHelper from 'app/components/QuestionHelper'
import { classNames, formatNumberPercentage } from 'app/functions'
import { sumCurrencyAmounts } from '../utils'

export default function StablePositionCard({
  amounts,
  poolTVL,
  poolTokenPercentage,
  estimatedSLP,
  className = '',
}: {
  amounts: CurrencyAmount<Currency>[] | undefined[]
  poolTVL: number
  className?: string
  estimatedSLP: CurrencyAmount<Currency>
  poolTokenPercentage: string
}) {
  const { i18n } = useLingui()

  const total = Number(sumCurrencyAmounts(amounts))

  const shareOfPool = poolTokenPercentage

  const percent = total / poolTVL

  return (
    <div
      className={classNames(
        'grid gap-1 text-sm bg-light-primary dark:bg-dark-primary text-dark-primary dark:text-light-primary transition-all',
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="text-sm">{i18n._(t`Share of Pool`)}</div>
        <div className="font-extrabold">{shareOfPool}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex text-sm items-center">
          {i18n._(t`Price Impact`)}
          <QuestionHelper text={i18n._(t`The difference between the market price and your price due to trade size.`)} />
        </div>
        <div className="font-extrabold">{formatNumberPercentage(percent, 100)}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex text-sm items-center">
          {i18n._(t`Minimum received`)}
          <QuestionHelper
            text={i18n._(
              t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
            )}
          />
        </div>
        <div className="font-extrabold">{estimatedSLP?.toSignificant()}</div>
      </div>
    </div>
  )
}
