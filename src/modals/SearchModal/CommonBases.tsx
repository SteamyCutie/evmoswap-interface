import { ChainId, Currency, Token, currencyEquals } from '@evmoswap/core-sdk'

import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import Button from '../../components/Button'
import { COMMON_BASES } from '../../config/routing'
import { CurrencyLogo } from '../../components/CurrencyLogo'
import QuestionHelper from '../../components/QuestionHelper'
import React from 'react'
import Typography from '../../components/Typography'
import { currencyId } from '../../functions'

export default function CommonBases ( {
    chainId,
    onSelect,
    selectedCurrency,
}: {
    chainId?: number
    selectedCurrency?: Currency | null
    onSelect: ( currency: Currency ) => void
} ) {
    const bases = typeof chainId !== 'undefined' ? COMMON_BASES[ chainId ] ?? [] : []

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center text-base">
                Common bases
                <QuestionHelper text="These tokens are commonly paired with other tokens." />
            </div>
            <div className="flex flex-wrap">
                { bases.map( ( currency: Currency ) => {
                    const isSelected = selectedCurrency?.equals( currency )
                    return (
                        <Button
                            variant="empty"
                            type="button"
                            onClick={ () => !isSelected && onSelect( currency ) }
                            disabled={ isSelected }
                            key={ currencyId( currency ) }
                            className="flex items-center px-3 py-2 m-1 space-x-2 transition-all rounded-2xl bg-light-secondary/90 hover:bg-light-secondary/40 disabled:bg-light-secondary dark:bg-dark-secondary/90 dark:hover:bg-dark-secondary/40 dark:disabled:bg-dark-secondary disabled:cursor-not-allowed"
                        >
                            <CurrencyLogo currency={ currency } />
                            <Typography variant="sm" className="font-semibold">
                                { currency.symbol }
                            </Typography>
                        </Button>
                    )
                } ) }
            </div>
        </div>
    )
}
