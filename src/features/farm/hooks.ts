import { useEffect, useState, Dispatch, useCallback, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'app/services/web3'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, CurrencyAmount, JSBI } from '@sushiswap/core-sdk'
import { useContract, useDashboardContract, useMasterChefContract, useSimpleIncentiveContract } from 'app/hooks/useContract'
import { NEVER_RELOAD, useSingleCallResult } from 'app/state/multicall/hooks'
import { useCurrency, useToken } from 'app/hooks/Tokens'

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

export function usePendingReward ( farm ) {
    const { account } = useActiveWeb3React()
    const contract = useMasterChefContract()
    const args = [ String( farm.pid ), String( account ) ]
    const [ reward, setReward ] = useState<any>()
    const getReward = async () => {
        setReward( await contract.pendingTokens( ...args ) )
    }
    useEffect( () => {
        getReward()
    }, [] )

    return reward
}


export function useIncentive ( incentiveAddress: string ) {
    const { account } = useActiveWeb3React()
    const contract = useSimpleIncentiveContract( incentiveAddress );
    const tokenAddress = useSingleCallResult( contract, 'rewardToken' )?.result?.[ 0 ];
    const rewardToken = useCurrency( tokenAddress );
    const pendingReward = useSingleCallResult( contract, 'pendingTokens', [ account ] )?.result?.[ 0 ];
    const rewardAmount = rewardToken && pendingReward ? CurrencyAmount.fromRawAmount( rewardToken, pendingReward ) : null;
    return {
        rewardToken,
        pendingReward,
        rewardAmount
    }
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
