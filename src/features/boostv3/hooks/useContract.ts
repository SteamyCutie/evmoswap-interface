import { useContract } from 'app/hooks'
import { Contract } from '@ethersproject/contracts'
import { MULTI_FEE_DISTRIBUTION_ADDRESSES } from '../constants/addresses'
import { FEE_DISTRIBUTOR_ADDRESSES } from '../constants/addresses'
import MULTI_FEE_DISTRIBUTION_ABI from '../constants/abis/MultiFeeDistribution.json'
import FEE_DISTRIBUTOR_ABI from '../constants/abis/FeeDistributor.json'
import { useActiveWeb3React } from 'app/services/web3'

export function useFeeDistributorContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(FEE_DISTRIBUTOR_ADDRESSES[chainId], FEE_DISTRIBUTOR_ABI, withSignerIfPossible)
}

export function useMultiFeeDistributionContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(MULTI_FEE_DISTRIBUTION_ADDRESSES[chainId], MULTI_FEE_DISTRIBUTION_ABI, withSignerIfPossible)
}
