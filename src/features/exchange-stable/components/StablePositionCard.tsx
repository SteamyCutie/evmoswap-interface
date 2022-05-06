import { Currency, TradeType, Trade as V2Trade, Percent, CurrencyAmount, Token, computePriceImpact, JSBI } from '@evmoswap/core-sdk'
import React, { ReactNode, useMemo } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { RowBetween } from 'app/components/Row'
import QuestionHelper from 'app/components/QuestionHelper'
import FormattedPriceImpact from 'app/features/swap/FormattedPriceImpact'
import { classNames, computeFiatValuePriceImpact, formatBalance, formatNumber, formatNumberPercentage, formatPercent } from 'app/functions'
import { usePoolsInfo } from 'app/features/staking/IncentivePool/hooks'
import { useStablePool, useStablePoolInfo, useStableTokenToMint } from '../hooks'
import { useUSDCValue } from 'app/hooks/useUSDCPrice'
import { Field } from 'app/state/burn/actions'
import { useWeb3React } from '@web3-react/core'
import { STABLE_POOLS } from 'app/constants/pools'
import { ONE_HUNDRED_PERCENT } from 'app/constants'
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

    /*const pool = STABLE_POOLS[ chainId ]?.[ poolAddress ]
    const lpToken = chainId ? pool.lpToken : undefined;

    const minReceived = useStableTokenToMint( poolAddress, amountsBN, true );
    const baseMinReceived = useStableTokenToMint( poolAddress, unitAmountsBN, true );
    const baseMinReceivedFormatted = Number( formatBalance( baseMinReceived || "0", lpToken.decimals, 4 ) );
    const minReceivedFormatted = Number( formatBalance( minReceived || "0", lpToken.decimals, 4 ) );
*/
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
