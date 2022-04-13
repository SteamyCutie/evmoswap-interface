import { useActiveWeb3React } from '../../services/web3'
import { NEVER_RELOAD, useSingleCallResult, useSingleContractMultipleMethods } from '../../state/multicall/hooks'
import { useRewardPoolContract, useVotingEscrowContract } from '../../hooks/useContract'
import { useMemo } from 'react'

export function useLockedBalance() {
  const { account } = useActiveWeb3React()

  if (!account) {
    return {
      emosSupply: undefined,
      veEmosSupply: undefined,
      veEmos: undefined,
      lockEnd: undefined,
      lockAmount: undefined,
      rewards: undefined,
      harvestRewards: undefined,
    }
  }

  const harvestRewards = useSingleCallResult(useRewardPoolContract(), 'calculateHarvestEmosRewards', undefined)?.result
  const rewards = useSingleCallResult(
    useRewardPoolContract(),
    'calculateUserRewards',
    account ? [account] : undefined
  )?.result

  const booster = useVotingEscrowContract()
  const callsData = useMemo(
    () => [
      { methodName: 'supply', callInputs: [] },
      { methodName: 'totalSupply', callInputs: [] },
      { methodName: 'balanceOf', callInputs: [account ? account : undefined] },
      { methodName: 'locked', callInputs: [account ? account : undefined] }, // user locked info
    ],
    []
  )

  const results = useSingleContractMultipleMethods(booster, callsData)

  // lockAmount, lockEnd, veEmos, emosSupply, veEmosSupply
  if (results && Array.isArray(results) && results.length === callsData.length) {
    const [{ result: emosSupply }, { result: veEmosSupply }, { result: veEmos }, { result: lockInfo }] = results
    return {
      emosSupply: emosSupply?.[0],
      veEmosSupply: veEmosSupply?.[0],
      veEmos: veEmos?.[0],
      lockEnd: lockInfo?.end,
      lockAmount: lockInfo?.amount,
      rewards: rewards?.[0],
      harvestRewards: harvestRewards?.[0],
    }
  }

  return {
    emosSupply: undefined,
    veEmosSupply: undefined,
    veEmos: undefined,
    lockEnd: undefined,
    lockAmount: undefined,
    rewards: undefined,
    harvestRewards: undefined,
  }
}
