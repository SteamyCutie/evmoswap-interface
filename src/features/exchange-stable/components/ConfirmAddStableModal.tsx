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
    poolTokenPercentage,
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
            <div className="grid mb-8 gap-3">
                {/* <div className='flex justify-between mb-2'>
          {i18n._(t`You are depositing`)}:
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">{i18n._(t`Share of Pool:`)}</div>
            <div className="text-sm justify-center items-center flex right-align pl-1.5 text-white">
              {poolTokenPercentage}
            </div>
          </div>
        </div> */}
                { parsedAmounts.map( ( amount, index ) => {
                    const cIndex = parsedAmounts.length - 1
                    return (
                        <div
                            key={ index }
                            className={ classNames(
                                'flex items-center text2xl md:text-3xl font-medium gap-4 p-4 rounded-xl bg-light-secondary dark:bg-dark-secondary transition-all'
                            ) }
                        >
                            <CurrencyLogo currency={ amount?.currency } size={ 36 } />
                            { amount?.toSignificant( 6 ) }&nbsp;
                            { amount?.currency.symbol }
                        </div>
                    )
                } ) }
            </div>
            <div className="text-base font-semibold my-4">{ i18n._( t`Minimum receivable` ) }</div>
            <div className="mb-4 mt-2 p-4 rounded-lg bg-light-secondary dark:bg-dark-secondary transition-all">
                <div className="flex items-center justify-between font-semibold">
                    <div className="font-medium">
                        { lpToken.symbol }
                        &nbsp;{ i18n._( t`LP Token` ) }
                    </div>
                    { estimatedSLP?.toFixed( 6 ) }&nbsp;
                </div>
            </div>

            <Button color="gradient" size="lg" onClick={ onAdd } disabled={ !estimatedSLP.greaterThan( ZERO ) }>
                { i18n._( t`Confirm Deposit` ) }
            </Button>
        </div>
    )
}

export default ConfirmAddStableModalBottom
