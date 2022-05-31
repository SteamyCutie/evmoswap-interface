import { getAddress } from '@ethersproject/address'
import { ChainId, CurrencyAmount, Token } from '@evmoswap/core-sdk'
import { EVMOROLL_ADDRESS } from 'app/constants/addresses'
import { useAllTokens } from 'app/hooks/Tokens'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MigrationSupported } from '.'

import LPToken from './LPToken'

export interface LPTokensState {
    updateLPTokens: () => Promise<void>
    lpTokens: LPToken[]
    selectedLPToken?: LPToken
    setSelectedLPToken: ( token?: LPToken ) => void
    selectedLPTokenAllowed: boolean
    setSelectedLPTokenAllowed: ( allowed: boolean ) => void
    loading: boolean
    updatingLPTokens: boolean
}

const useLPTokensState = () => {
    const { account, chainId } = useActiveWeb3React()
    const [ lpTokens, setLPTokens ] = useState<LPToken[]>( [] )
    const [ selectedLPToken, setSelectedLPToken ] = useState<LPToken>()
    const [ selectedLPTokenAllowed, setSelectedLPTokenAllowed ] = useState( false )
    const [ loading, setLoading ] = useState( true )
    const tokens = useAllTokens()
    const updatingLPTokens = useRef( false )
    const updateLPTokens = useCallback( async () => {
        const COVALENTHQ_KEY = 'ckey_121823195eeb404aacdc4d66d96';
        try {
            updatingLPTokens.current = true
            if (
                chainId &&
                MigrationSupported.includes(
                    chainId
                )
            ) {

                const dexNames = Object.keys( EVMOROLL_ADDRESS?.[ chainId ] );

                const requests: { [ dex in LPToken[ 'dex' ] ]?: string } = {};

                for ( let index = 0; index < dexNames.length; index++ ) {
                    const dex = dexNames[ index ];
                    requests[ dex ] = `https://api.covalenthq.com/v1/${chainId}/xy=k/${dex}/address/${String(
                        account
                    ).toLowerCase()}/balances/?quote-currency=USD&format=JSON&key=${COVALENTHQ_KEY}`
                }

                const responses = await Promise.all(
                    Object.values<string>( requests ).map( ( url ) => fetch( url ).then( ( response ) => response.json() ) )
                )

                const keys = Object.keys( requests )

                const data = responses.map( ( response, i ) => [
                    keys[ i ],
                    response?.data?.items?.filter( ( pool_token: any ) => pool_token.balance !== '0' ),
                ] )

                //console.log({ data } )

                const lpTokens = data?.reduce( ( previousValue, [ dex, items ] ) => {
                    return [
                        ...previousValue,
                        ...items.map( ( pair: any ) => {
                            console.log( pair )
                            const liquidityToken = new Token(
                                chainId as ChainId,
                                getAddress( pair.pool_token.contract_address ),
                                pair.pool_token.contract_decimals,
                                pair.pool_token.contract_ticker_symbol
                            )

                            const token0Address = getAddress( pair.token_0.contract_address )
                            const token1Address = getAddress( pair.token_1.contract_address )

                            const token0 =
                                token0Address in tokens
                                    ? tokens[ token0Address ]
                                    : new Token(
                                        chainId as ChainId,
                                        token0Address,
                                        pair.token_0.contract_decimals,
                                        pair.token_0.contract_ticker_symbol
                                    )

                            const token1 =
                                token1Address in tokens
                                    ? tokens[ token1Address ]
                                    : new Token(
                                        chainId as ChainId,
                                        token1Address,
                                        pair.token_1.contract_decimals,
                                        pair.token_1.contract_ticker_symbol
                                    )

                            return {
                                dex,
                                address: liquidityToken.address,
                                decimals: liquidityToken.decimals,
                                name: `${token0.symbol}-${token1.symbol} LP Token`,
                                symbol: liquidityToken.symbol,
                                balance: CurrencyAmount.fromRawAmount( liquidityToken, pair.pool_token.balance ),
                                totalSupply: pair.pool_token.total_supply,
                                tokenA: token0,
                                tokenB: token1,
                                version: pair.version,
                            } as LPToken
                        } ),
                    ]
                }, [] )

                if ( lpTokens ) {
                    setLPTokens( lpTokens )
                }
            }
        } finally {
            setLoading( false )
            updatingLPTokens.current = false
        }
    }, [ chainId, account, tokens ] )

    useEffect( () => {
        if ( chainId && account && !updatingLPTokens.current ) {
            updateLPTokens()
        }
    }, [ account, chainId, updateLPTokens ] )

    return {
        updateLPTokens,
        lpTokens,
        selectedLPToken,
        setSelectedLPToken,
        selectedLPTokenAllowed,
        setSelectedLPTokenAllowed,
        loading,
        updatingLPTokens: updatingLPTokens.current,
    }
}

export default useLPTokensState