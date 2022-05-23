import { useEffect, useState, Dispatch, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'app/services/web3'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, JSBI } from '@sushiswap/core-sdk'
import { useDashboardContract, useMasterChefContract, useSimpleIncentiveContract } from 'app/hooks/useContract'
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from 'app/state/multicall/hooks'
import { useCurrency, useToken } from 'app/hooks/Tokens'
import { Token } from '@evmoswap/core-sdk'
import ERC20_INTERFACE from 'app/constants/abis/erc20'

// @ts-ignore TYPE NEEDS FIXING
export function useUserInfo ( farm, token ) {
    const { account } = useActiveWeb3React()

    const contract = useMasterChefContract()

    const args = useMemo( () => {
        if ( !account ) {
            return
        }
        return [ String( farm.pid ), String( account ) ]
    }, [ farm, account ] )

    const result = useSingleCallResult( args ? contract : null, 'userInfo', args )?.result

    const value = result?.[ 0 ]

    const amount = value ? JSBI.BigInt( value.toString() ) : undefined

    return {
        stakedAmount: amount && token ? CurrencyAmount.fromRawAmount( token, amount ) : undefined,
    }
}

export function useFarmPendingRewardsAmount ( farm ) {
    const { account, chainId } = useActiveWeb3React()
    const contract = useMasterChefContract()

    let tokenAddresses = [];
    let amountsRaw = [];

    //base rewards from masterchef
    const baseRewards = useSingleCallResult( contract, 'pendingTokens', [ String( farm.pid ), String( account ) ] )?.result;
    if ( baseRewards?.tokens && baseRewards?.amounts )
        baseRewards.tokens.map( ( token, index ) => {
            tokenAddresses.push( token );
            amountsRaw.push( baseRewards?.amounts[ index ] )
        } )

    //get tokens info
    const symbolsResult = useMultipleContractSingleData( tokenAddresses, ERC20_INTERFACE, 'symbol' )
    const decimalsResult = useMultipleContractSingleData( tokenAddresses, ERC20_INTERFACE, 'decimals' )
    const symbols = symbolsResult.map( ( s ) => s?.result?.[ 0 ] );
    const decimals = decimalsResult.map( ( d ) => d?.result?.[ 0 ] );

    //create each token instance.
    const tokens = useMemo( () => {
        if ( decimals && symbols && symbols.length === decimals.length )
            return decimals.map( ( decimal, i ) => new Token( chainId, tokenAddresses[ i ], decimal, symbols[ i ] ) )
    }, [ decimals, symbols ] );

    //make amounts
    const amounts = tokens.map( ( token, i ) => token ? CurrencyAmount.fromRawAmount( token, amountsRaw[ i ] || "0" ) : null );

    return amounts;
}


export const useEmoUsdcPrice = (): BigNumber | undefined => {
    const dashboard = useDashboardContract()
    return useSingleCallResult( dashboard, 'rewardPriceInUSD' )?.result?.[ 0 ]
}

export function useTokenInfo ( tokenContract?: Contract | null ) {
    const _totalSupply = useSingleCallResult( tokenContract ? tokenContract : null, 'totalSupply', undefined, NEVER_RELOAD )
        ?.result?.[ 0 ]

    const _burnt = useSingleCallResult(
        tokenContract ? tokenContract : null,
        'balanceOf',
        [ '0x000000000000000000000000000000000000dEaD' ],
        NEVER_RELOAD
    )?.result?.[ 0 ]

    const totalSupply = _totalSupply ? JSBI.BigInt( _totalSupply.toString() ) : JSBI.BigInt( 0 )
    const burnt = _burnt ? JSBI.BigInt( _burnt.toString() ) : JSBI.BigInt( 0 )

    const circulatingSupply = JSBI.subtract( totalSupply, burnt )

    const token = useToken( tokenContract?.address )

    return useMemo( () => {
        if ( !token ) {
            return {
                totalSupply: '0',
                burnt: '0',
                circulatingSupply: '0',
            }
        }

        return {
            totalSupply: CurrencyAmount.fromRawAmount( token, totalSupply ).toFixed( 0 ),
            burnt: CurrencyAmount.fromRawAmount( token, burnt ).toFixed( 0 ),
            circulatingSupply: CurrencyAmount.fromRawAmount( token, circulatingSupply ).toFixed( 0 ),
        }
    }, [ totalSupply, burnt, circulatingSupply, token ] )
}

export function useInfiniteScroll ( items ): [ number, Dispatch<number> ] {
    const [ itemsDisplayed, setItemsDisplayed ] = useState( 10 )
    useEffect( () => setItemsDisplayed( 10 ), [ items.length ] )
    return [ itemsDisplayed, setItemsDisplayed ]
}
