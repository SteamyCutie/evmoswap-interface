import { Currency, CurrencyAmount, Pair, Percent, Token } from '@evmoswap/core-sdk'
import React, { ReactNode, useCallback, useState } from 'react'
import { classNames, formatCurrencyAmount } from '../../functions'

import Button from '../Button'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { CurrencyLogo } from '../CurrencyLogo'
import CurrencySearchModal from '../../modals/SearchModal/CurrencySearchModal'
import DoubleCurrencyLogo from '../DoubleLogo'
import { FiatValue } from './FiatValue'
import Input from '../Input'
import Lottie from 'lottie-react'
import selectCoinAnimation from '../../animation/select-coin.json'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'

interface CurrencyInputProps {
    value?: string
    onUserInput?: ( value: string ) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: ( currency: Currency ) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    otherCurrency?: Currency | null
    fiatValue?: CurrencyAmount<Token> | null
    priceImpact?: Percent
    id: string
    showCommonBases?: boolean
    allowManageTokenList?: boolean
    renderBalance?: ( amount: CurrencyAmount<Currency> ) => ReactNode
    locked?: boolean
    customBalanceText?: string
    showSearch?: boolean
    currencyList?: string[]
    className?: string
}

export default function CurrencyInput ( {
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = 'Input',
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    otherCurrency,
    id,
    showCommonBases,
    renderBalance,
    fiatValue,
    priceImpact,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    locked = false,
    customBalanceText,
    allowManageTokenList = true,
    showSearch = true,
    currencyList = null,
    className = ''
}: CurrencyInputProps ) {
    const { i18n } = useLingui()
    const [ modalOpen, setModalOpen ] = useState( false )
    const { account } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance( account ?? undefined, currency ?? undefined )

    const handleDismissSearch = useCallback( () => {
        setModalOpen( false )
    }, [ setModalOpen ] )

    return (
        <div id={ id }>
            <div className={ classNames( "flex flex-row items-center justify-between", hideInput ? 'p-4' : 'p-5', 'rounded-xl', className ) }>
                <div className={ classNames( 'w-auto' ) }>
                    <div className="flex">
                        { pair ? (
                            <DoubleCurrencyLogo currency0={ pair.token0 } currency1={ pair.token1 } size={ 40 } margin={ true } />
                        ) : currency ? (
                            <div className="flex items-center">
                                <CurrencyLogo currency={ currency } size={ '40px' } />
                            </div>
                        ) : (
                            <div className="rounded" style={ { maxWidth: 40, maxHeight: 40 } }>
                                <div style={ { width: 40, height: 40 } }>
                                    <Lottie animationData={ selectCoinAnimation } autoplay loop />
                                </div>
                            </div>
                        ) }
                    </div>
                </div>
                { !hideInput && (
                    <div
                        className={ classNames(
                            'flex items-center w-full space-x-3 rounded p-3'
                            // showMaxButton && selectedCurrencyBalance && 'px-3'
                        ) }
                    >
                        <>
                            { showMaxButton && selectedCurrencyBalance && (
                                <Button
                                    onClick={ onMax }
                                    size="xs"
                                    className="text-sm font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
                                >
                                    { i18n._( t`Max` ) }
                                </Button>
                            ) }
                            <Input.Numeric
                                id="token-amount-input"
                                value={ value }
                                onUserInput={ ( val ) => {
                                    onUserInput( val )
                                } }
                            />
                            { !hideBalance && currency && selectedCurrencyBalance ? (
                                <div className="flex flex-col">
                                    <div onClick={ onMax } className="text-base font-semibold text-right cursor-pointer text-low-emphesis">
                                        { renderBalance ? (
                                            renderBalance( selectedCurrencyBalance )
                                        ) : (
                                            <>
                                                { i18n._( t`Balance:` ) } { formatCurrencyAmount( selectedCurrencyBalance, 4 ) } { currency.symbol }
                                            </>
                                        ) }
                                    </div>
                                    <FiatValue fiatValue={ fiatValue } priceImpact={ priceImpact } />
                                </div>
                            ) : null }
                        </>
                    </div>
                ) }
            </div>
        </div>
    )
}
