import { AlertTriangle } from 'react-feather'
import { Currency, Percent, TradeType, Trade as V2Trade } from '@evmoswap/core-sdk'
import React, { useState } from 'react'
import { isAddress, shortenAddress } from '../../functions'

import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { CurrencyLogo } from '../../components/CurrencyLogo'
import TradePrice from './TradePrice'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useUSDCValue } from '../../hooks/useUSDCPrice'
import { warningSeverity } from '../../functions'
import TradingMode, { TRADING_MODE } from '../exchange-stable/components/TradingMode'
import { ArrowSmDownIcon } from '@heroicons/react/solid'

export default function SwapModalHeader ( {
    trade,
    allowedSlippage,
    recipient,
    showAcceptChanges,
    onAcceptChanges,
}: {
    trade: V2Trade<Currency, Currency, TradeType>
    allowedSlippage: Percent
    recipient: string | null
    showAcceptChanges: boolean
    onAcceptChanges: () => void
} ) {
    const { i18n } = useLingui()

    const [ showInverted, setShowInverted ] = useState<boolean>( false )

    const fiatValueInput = useUSDCValue( trade.inputAmount )
    const fiatValueOutput = useUSDCValue( trade.outputAmount )

    const priceImpactSeverity = warningSeverity( trade.priceImpact )

    const tradingMode = trade?.[ 'mode' ] ?? TRADING_MODE.STANDARD
    return (
        <div className="grid gap-4">
            <div className="grid">
                <div className="flex items-center justify-between bg-light-secondary dark:bg-dark-secondary p-3 pr-4 rounded-lg transition-all">
                    <div className="flex items-center gap-3">
                        <CurrencyLogo currency={ trade.inputAmount.currency } size={ 30 } />
                        <div className="overflow-ellipsis w-[220px] overflow-hidden font-bold text-lg text-dark-primary dark:text-light-primary transition-all">
                            { trade.inputAmount.toSignificant( 6 ) }
                        </div>
                    </div>
                    <div className="ml-3 text-slg font-semibold text-dark-primary dark:text-light-primary transition-all">
                        { trade.inputAmount.currency.symbol }
                    </div>
                </div>
                <div className="mx-auto -my-3.5 p-1 border-4 border-light-primary dark:border-dark-primary z-0 rounded-xl bg-light-secondary dark:bg-dark-secondary transition-all">
                    <ArrowSmDownIcon width={ 18 } height={ 18 } />
                </div>
                <div className="flex items-center justify-between bg-light-secondary dark:bg-dark-secondary p-3 pr-4 rounded-lg transition-all">
                    <div className="flex items-center gap-3">
                        <CurrencyLogo currency={ trade.outputAmount.currency } size={ 30 } />
                        <div
                            className={ `overflow-ellipsis w-[220px] overflow-hidden font-bold text-lg transition-all ${priceImpactSeverity > 2 ? 'text-red' : 'text-dark-primary dark:text-light-primary'
                                }` }
                        >
                            { trade.outputAmount.toSignificant( 6 ) }
                        </div>
                    </div>
                    <div className="ml-3 text-slg font-semibold text-dark-primary dark:text-light-primary transition-all">
                        { trade.outputAmount.currency.symbol }
                    </div>
                </div>
            </div>

            <TradePrice
                price={ trade.executionPrice }
                showInverted={ showInverted }
                setShowInverted={ setShowInverted }
                className="px-0"
            />
            <TradingMode mode={ tradingMode } />
            <AdvancedSwapDetails trade={ trade } allowedSlippage={ allowedSlippage } />

            { showAcceptChanges ? (
                <div className="flex items-center justify-between p-2 px-3 border border-gray-800 rounded">
                    <div className="flex items-center justify-start text-sm font-bold uppercase transition-all text-dark-primary dark:text-light-primary">
                        <div className="mr-3 min-w-[24px]">
                            <AlertTriangle size={ 24 } />
                        </div>
                        <span>{ i18n._( t`Price Updated` ) }</span>
                    </div>
                    <span className="text-sm cursor-pointer text-blue-special" onClick={ onAcceptChanges }>
                        { i18n._( t`Accept` ) }
                    </span>
                </div>
            ) : null }
            <div className="justify-start text-sm text-dark-primary dark:text-light-primary transition-all">
                { trade.tradeType === TradeType.EXACT_INPUT ? (
                    <>
                        { i18n._( t`Output is estimated. You will receive at least` ) }{ ' ' }
                        <b>
                            { trade.minimumAmountOut( allowedSlippage ).toSignificant( 6 ) } { trade.outputAmount.currency.symbol }
                        </b>{ ' ' }
                        { i18n._( t`or the transaction will revert.` ) }
                    </>
                ) : (
                    <>
                        { i18n._( t`Input is estimated. You will sell at most` ) }{ ' ' }
                        <b>
                            { trade.maximumAmountIn( allowedSlippage ).toSignificant( 6 ) } { trade.inputAmount.currency.symbol }
                        </b>{ ' ' }
                        { i18n._( t`or the transaction will revert.` ) }
                    </>
                ) }
            </div>

            { recipient !== null ? (
                <div className="flex-start">
                    <>
                        { i18n._( t`Output will be sent to` ) }{ ' ' }
                        <b title={ recipient }>{ isAddress( recipient ) ? shortenAddress( recipient ) : recipient }</b>
                    </>
                </div>
            ) : null }
        </div>
    )
}
