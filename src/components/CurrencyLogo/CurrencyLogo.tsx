import { ChainId, Currency, WNATIVE } from '@evmoswap/core-sdk'
import React, { FunctionComponent, useMemo } from 'react'

import Logo from '../Logo'
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo'
import useHttpLocations from '../../hooks/useHttpLocations'

const BLOCKCHAIN = {
    [ ChainId.ETHEREUM ]: 'ethereum',
    [ ChainId.EVMOS ]: 'evmos',
    [ ChainId.EVMOS_TESTNET ]: 'evmos-testnet',
    [ ChainId.BSC_TESTNET ]: 'bsc-testnet',
}

export function getCurrencyLogoUrls ( currency ) {
    const urls = []

    if ( currency.chainId in BLOCKCHAIN ) {
        // urls.push(
        //   `https://raw.githubusercontent.com/evmoswap/default-token-list/main/tokens/assets/${BLOCKCHAIN[currency.chainId]}/${currency.address}/logo.svg`
        // )
        urls.push(
            `https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/tokens/${BLOCKCHAIN[ currency.chainId ]
            }/${currency.address}/logo.png`
        )
    }

    return urls
}

const EvmosLogo = 'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/icons/network/evmos.png'
const BinanceLogo = 'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/icons/network/bsc.svg'

const LOGO: { readonly [ chainId in ChainId ]?: string } = {
    [ ChainId.ETHEREUM ]: EvmosLogo,
    [ ChainId.EVMOS ]: EvmosLogo,
    [ ChainId.EVMOS_TESTNET ]: EvmosLogo,
    [ ChainId.BSC_TESTNET ]: BinanceLogo,
}

export interface CurrencyLogoProps {
    currency?: Currency
    size?: string | number
    style?: React.CSSProperties
    className?: string
    squared?: boolean
}

const unknown = 'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/unknown.png'

const CurrencyLogo: FunctionComponent<CurrencyLogoProps> = ( {
    currency,
    size = '24px',
    style,
    className = '',
    ...rest
} ) => {
    const uriLocations = useHttpLocations(
        currency instanceof WrappedTokenInfo ? currency.logoURI || currency.tokenInfo.logoURI : undefined
    )

    const srcs = useMemo( () => {
        if ( !currency ) {
            return [ unknown ]
        }

        if ( currency.isNative || currency.equals( WNATIVE[ currency.chainId ] ) ) {
            return [ LOGO[ currency.chainId ], unknown ]
        }

        if ( currency.isToken ) {
            const defaultUrls = [ ...getCurrencyLogoUrls( currency ) ]
            if ( currency instanceof WrappedTokenInfo ) {
                return [ ...defaultUrls, ...uriLocations, unknown ]
            }
            return defaultUrls
        }
    }, [ currency, uriLocations ] )

    return <Logo srcs={ srcs } width={ size } height={ size } alt={ currency?.symbol } className={ className } { ...rest } />
}

export default CurrencyLogo
