import React, { useCallback, useState } from 'react'

import { ChevronDownIcon } from '@heroicons/react/solid'
import { Currency } from '@evmoswap/core-sdk'
import { CurrencyLogo } from '../CurrencyLogo'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import Lottie from 'lottie-react'
import selectCoinAnimation from '../../animation/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useLingui } from '@lingui/react'

interface CurrencySelectPanelProps {
    onClick?: () => void
    onCurrencySelect?: ( currency: Currency ) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
}

export default function CurrencySelectPanel ( {
    onClick,
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    otherCurrency,
    id,
    showCommonBases,
}: CurrencySelectPanelProps ) {
    const { i18n } = useLingui()

    const [ modalOpen, setModalOpen ] = useState( false )
    const { chainId } = useActiveWeb3React()

    const handleDismissSearch = useCallback( () => {
        setModalOpen( false )
    }, [ setModalOpen ] )

    return (
        <div id={ id } className="px-8 py-6 rounded-2xl bg-light-primary dark:bg-dark-primary transition-all">
            <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                <div className="w-full" onClick={ onClick }>
                    <div
                        className="items-center h-full text-xl font-medium border-none outline-none cursor-pointer select-none"
                        onClick={ () => {
                            if ( !disableCurrencySelect ) {
                                setModalOpen( true )
                            }
                        } }
                    >
                        <div className="flex">
                            { currency ? (
                                <CurrencyLogo currency={ currency } size={ 42 } />
                            ) : (
                                <div
                                    className="rounded-full bg-light-secondary dark:bg-dark-secondary transition-all"
                                    style={ { maxWidth: 42, maxHeight: 42 } }
                                >
                                    <div style={ { width: 42, height: 42 } }>
                                        <Lottie animationData={ selectCoinAnimation } autoplay loop />
                                    </div>
                                </div>
                            ) }

                            <div className="flex flex-col items-start justify-center mx-3.5">
                                <div className="flex items-center text-dark-primary dark:text-light-primary transition-all">
                                    <div className="mr-2 text-lg font-bold md:text-lg">
                                        { ( currency && currency.symbol && currency.symbol.length > 20
                                            ? currency.symbol.slice( 0, 4 ) +
                                            '...' +
                                            currency.symbol.slice( currency.symbol.length - 5, currency.symbol.length )
                                            : currency?.symbol ) || (
                                                <div className="px-2 py-1 mt-1 text-xs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap">
                                                    { i18n._( t`Select a token` ) }
                                                </div>
                                            ) }
                                    </div>
                                    { !disableCurrencySelect && currency && (
                                        <ChevronDownIcon className={ `stroke-current` } width={ 16 } height={ 16 } />
                                    ) }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            { !disableCurrencySelect && onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={ modalOpen }
                    onDismiss={ handleDismissSearch }
                    onCurrencySelect={ onCurrencySelect }
                    selectedCurrency={ currency }
                    otherSelectedCurrency={ otherCurrency }
                    showCommonBases={ showCommonBases }
                />
            ) }
        </div>
    )
}
