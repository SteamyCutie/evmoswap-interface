import { useContract } from 'app/hooks'
import { Contract } from '@ethersproject/contracts'
import { MULTISTAKING_ADDRESS } from '../constants/addresses'
import MULTISTAKING_ABI from '../constants/abis/MultiFeeDistribution.json'
import { useActiveWeb3React } from 'app/services/web3'

export function useMultistakingContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( MULTISTAKING_ADDRESS[ chainId ], MULTISTAKING_ABI, withSignerIfPossible )
}