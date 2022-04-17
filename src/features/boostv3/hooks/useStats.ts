import { BigNumber } from '@ethersproject/bignumber'
import { useVotingEscrowContract } from 'app/hooks'
import { useSingleCallResult } from 'app/state/multicall/hooks'
import { useMultistakingContract } from './useContract'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTokenTotalLocked (): string {
    const contract = useVotingEscrowContract();

    const totalSupply: BigNumber = useSingleCallResult( contract, 'supply' )?.result?.[ 0 ]

    return totalSupply ? totalSupply.toString() : "0"
}

export function useTokenMonthyEmission (): string {

    const contract = useMultistakingContract();

    const monthlyEmission: BigNumber = useSingleCallResult( contract, 'monthlyEmissions' )?.result?.[ 0 ]

    return monthlyEmission ? monthlyEmission.toString() : "0"
}
