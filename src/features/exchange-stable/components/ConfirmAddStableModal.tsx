import { Currency, CurrencyAmount, Token, ZERO } from '@evmoswap/core-sdk'

import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import { classNames } from 'app/functions'
import Button from 'app/components/Button'

export function ConfirmAddStableModalBottom ( {
    parsedAmounts,
    onAdd,
    lpToken,
    estimatedSLP,
    poolTokenPercentage
}: {
    parsedAmounts: CurrencyAmount<Currency>[]
    onAdd: () => void
    lpToken: Token
    estimatedSLP: CurrencyAmount<Currency>
    poolTokenPercentage: string
} ) {
    const { i18n } = useLingui()

    return (
        <div className="mt-0 rounded">

            <div className='p-4 my-2 rounded-lg bg-dark-1000'>
                <div className='flex justify-between mb-2'>
                    { i18n._( t`You are depositing` ) }:
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-secondary">{ i18n._( t`Share of Pool:` ) }</div>
                        <div className="text-sm justify-center items-center flex right-align pl-1.5 text-white">
                            { poolTokenPercentage }
                        </div>
                    </div>
                </div>
                {
                    parsedAmounts.map( ( amount, index ) => {
                        const cIndex = parsedAmounts.length - 1;
                        return (
                            <div key={ index } className={ classNames( 'flex gap-2 p-4 border-[1px] border-gray-600 bg-dark-800', index == cIndex ? 'rounded-b-lg' : ( index == 0 ? 'rounded-t-lg' : '' ) ) }>
                                <CurrencyLogo currency={ amount?.currency } />
                                { amount?.toSignificant( 6 ) }&nbsp;
                                { amount?.currency.symbol }
                            </div>
                        )
                    } )
                }
            </div>
            <div className='p-4 mb-4 rounded-lg bg-dark-1000'>
                <div>{ i18n._( t`Minimum receivable` ) }:</div>
                <div className='flex items-center justify-between mt-1 font-bold text-white'>
                    { estimatedSLP?.toFixed( 6 ) }&nbsp;
                    <div>
                        { lpToken?.symbol }
                        &nbsp;{ i18n._( t`LP Token` ) }
                    </div>
                </div>
            </div>

            <Button color="blue" size="lg" onClick={ onAdd } disabled={ !estimatedSLP.greaterThan( ZERO ) } className="disabled:bg-blue-600">
                { i18n._( t`Confirm Deposit` ) }
            </Button>
        </div>
    )
}

export default ConfirmAddStableModalBottom
