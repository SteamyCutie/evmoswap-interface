import { Currency, CurrencyAmount } from '@evmoswap/core-sdk'
import React, { } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { RowBetween } from 'app/components/Row'
import QuestionHelper from 'app/components/QuestionHelper'
import { classNames, formatNumberPercentage } from 'app/functions'
import { sumCurrencyAmounts } from '../utils'

export default function StablePositionCard ( { amounts, poolTVL, poolTokenPercentage, estimatedSLP, className = '' }:
    {
        amounts: CurrencyAmount<Currency>[] | undefined[],
        poolTVL: number,
        className?: string,
        estimatedSLP: CurrencyAmount<Currency>,
        poolTokenPercentage: string
    } ) {
    const { i18n } = useLingui()

    const total = Number( sumCurrencyAmounts( amounts ) )

    const shareOfPool = poolTokenPercentage;

    const percent = total / poolTVL

    return (
        <div className={ classNames( "grid gap-1", className ) }>
            <RowBetween>
                <div className="text-sm text-secondary">
                    { i18n._( t`Share oF Pool` ) }
                </div>
                <div>{ shareOfPool }</div>
            </RowBetween>

            <RowBetween>
                <div className="flex text-sm text-secondary">
                    { i18n._( t`Price Impact` ) }
                    <QuestionHelper
                        text={ i18n._(
                            t`The difference between the market price and your price due to trade size.`
                        ) }
                    />
                </div>
                <div>
                    { formatNumberPercentage( percent, 100 ) }
                </div>
            </RowBetween>

            <RowBetween>
                <div className="flex text-sm text-secondary">
                    { i18n._( t`Minimum received` ) }
                    <QuestionHelper
                        text={ i18n._(
                            t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                        ) }
                    />
                </div>
                <div>{ estimatedSLP?.toSignificant() }</div>
            </RowBetween>
        </div>
    )
}
