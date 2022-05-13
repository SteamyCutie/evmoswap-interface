import { Interface } from '@ethersproject/abi'
import { CurrencyAmount, Currency, Token, ChainId } from '@evmoswap/core-sdk'
import { ERC20_ABI } from 'app/constants/abis/erc20'
import { useFeeDistributorContract, useMasterChefContract, useMultiFeeDistributionContract, useRewardPoolContract, useVotingEscrowContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import {
    useMultipleContractSingleData,
    useSingleCallResult,
    useSingleContractMultipleData,
    useSingleContractMultipleMethods,
} from 'app/state/multicall/hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { FARMS } from 'app/constants/farms'

export const EMOSPlaceholder = new Token( ChainId.ETHEREUM, '0x0000000000000000000000000000000000000001', 18, 'EMO' )
const ZERO_BN = '0'.toBigNumber( EMOSPlaceholder.decimals )

export function useLockedBalance () {
    const { account } = useActiveWeb3React()

    const defaultResp = {
        emosSupply: undefined,
        veEmosSupply: undefined,
        veEmos: undefined,
        lockEnd: undefined,
        lockAmount: undefined,
    }

    if ( !account ) {
        return defaultResp
    }

    const booster = useVotingEscrowContract()
    const callsData = useMemo(
        () => [
            { methodName: 'supply', callInputs: [] },
            { methodName: 'totalSupply', callInputs: [] },
            { methodName: 'balanceOf', callInputs: [ account ? account : undefined ] },
            { methodName: 'locked', callInputs: [ account ? account : undefined ] }, // user locked info
        ],
        [ account ]
    )

    const results = useSingleContractMultipleMethods( booster, callsData )
    // lockAmount, lockEnd, veEmos, emosSupply, veEmosSupply
    if ( results && Array.isArray( results ) && results.length === callsData.length ) {
        const [ { result: emosSupply }, { result: veEmosSupply }, { result: veEmos }, { result: lockInfo } ] = results
        return {
            emosSupply: emosSupply?.[ 0 ],
            veEmosSupply: veEmosSupply?.[ 0 ],
            veEmos: veEmos?.[ 0 ],
            lockEnd: Number( lockInfo?.end ),
            lockAmount: CurrencyAmount.fromRawAmount( EMOSPlaceholder, lockInfo?.amount || '0' ),
        }
    }

    return defaultResp
}

/**
 * Rewards pool pending balances
 * @returns object
 */
export function useRewardsBalance () {
    const { account, chainId } = useActiveWeb3React()

    const resp: { amounts: CurrencyAmount<Currency>[]; tokens: Token[]; total: BigNumber } = {
        amounts: [],
        tokens: [],
        total: new BigNumber( 0 ),
    }

    let tokens = []
    let amounts = []

    if ( !account ) {
        return resp
    }

    const rewards = useSingleCallResult( useRewardPoolContract(), 'pendingTokens', account ? [ account ] : undefined )?.result

    if ( rewards?.amounts && Array.isArray( rewards.amounts ) ) amounts = rewards?.amounts

    if ( rewards?.amounts && Array.isArray( rewards.amounts ) ) tokens = rewards.tokens

    const contractInterface = new Interface( ERC20_ABI )
    const symbolsResult = useMultipleContractSingleData( tokens, contractInterface, 'symbol' )
    const decimalsResult = useMultipleContractSingleData( tokens, contractInterface, 'decimals' )

    const symbols = symbolsResult[ 0 ]?.result
    const decimals = decimalsResult[ 0 ]?.result
    if (
        tokens &&
        amounts &&
        symbols &&
        decimals &&
        symbols.length === decimals.length &&
        decimals.length === tokens.length &&
        tokens.length === amounts.length
    ) {
        tokens.map( ( tokenAddress, index ) => {
            const token = new Token( chainId, tokenAddress, decimals[ index ], symbols[ index ], symbols[ index ] )
            const amount = CurrencyAmount.fromRawAmount( token, amounts[ index ].toString() )

            resp.tokens[ index ] = token
            resp.amounts[ index ] = amount
            resp.total = resp.total.plus( amount.toExact() )
        } )
    }

    return resp
}

//Get all balance relating to staking
export function useStakingBalance (): {
    earnedBalances: { earningsData?: any[], total?: any, indexes?: number[] } //vesting rewards
    withdrawableBalance: { amount?: any, penaltyAmount?: any, amountWithoutPenalty?: any } //staked
    totalBalance: any
} {
    const { account } = useActiveWeb3React()
    const defaultResp = {
        earnedBalances: undefined, //vesting rewards
        withdrawableBalance: undefined, //staked
        totalBalance: undefined,
    }

    if ( !account ) {
        return defaultResp
    }

    const contract = useMultiFeeDistributionContract()
    const callsData = useMemo(
        () => [
            { methodName: 'earnedBalances', callInputs: [ account ] },
            { methodName: 'withdrawableBalance', callInputs: [ account ] },
            { methodName: 'totalBalance', callInputs: [ account ] },
        ],
        [ account ]
    )

    const results = useSingleContractMultipleMethods( contract, callsData )

    if ( results && Array.isArray( results ) && results.length === callsData.length ) {
        const [ { result: earnedBalances }, { result: withdrawableBalance }, { result: totalBalance } ] = results
        return {
            earnedBalances: { earningsData: earnedBalances?.earningsData, total: earnedBalances?.total, indexes: earnedBalances?.index },
            withdrawableBalance: {
                amount: withdrawableBalance?.amount,
                penaltyAmount: withdrawableBalance?.penaltyAmount,
                amountWithoutPenalty: withdrawableBalance?.amountWithoutPenalty
            },
            totalBalance: totalBalance?.[ 0 ]
        }
    }

    return defaultResp
}

//get all farm pool yield yet to be harvested.
export const useFarmsReward = () => {
    const { chainId, account } = useActiveWeb3React()
    const masterChef = useMasterChefContract()

    const [ totalRewards, setTotalRewards ] = useState( ZERO_BN )
    const farmingPools = Object.keys( FARMS[ chainId ] ).map( ( key ) => {
        return { ...FARMS[ chainId ][ key ], lpToken: key }
    } )

    // Array Pids and user
    const poolPidsUser = useMemo( () => {
        return farmingPools.map( ( pool: any ) => {
            return [ pool.pid, account ]
        } )
    }, [ account ] )

    const rewards = useSingleContractMultipleData( masterChef, 'pendingTokens', poolPidsUser )
    const fetchAllFarmsReward = useCallback( async () => {
        // Reset pools list
        let total = ZERO_BN

        rewards.map( ( reward: any ) => {
            if ( reward.result ) {
                total = total.add( reward.result.amounts[ 0 ] )
            }
        } )

        setTotalRewards( total )
    }, [ rewards ] )

    useEffect( () => {
        fetchAllFarmsReward()
    }, [ fetchAllFarmsReward ] )

    return totalRewards
}


//get locker reward balance
export const useLockerExtraRewards = (): CurrencyAmount<Token | Currency> => {

    const contract = useFeeDistributorContract();
    const { account } = useActiveWeb3React();
    const [ rewards, setRewards ] = useState( "0" )

    const lockerExtraRewards = useCallback( async (): Promise<string> => {

        let resp = "0"
        if ( !contract?.callStatic ) return resp;
        try {
            const result = await contract.callStatic[ 'claim()' ]();
            console.log( result )
            resp = String( result )
        } catch ( e ) {
            console.log( e.message )
        }
        return resp;
    }, [ contract, account ] )


    useEffect( () => {
        let active = true;

        ( async () => {
            let rewards = await lockerExtraRewards();
            if ( active )
                setRewards( rewards );
        } )()

        return () => {
            active = false;
        }
    }, [ lockerExtraRewards ] )
    return CurrencyAmount.fromRawAmount( EMOSPlaceholder, rewards )
}