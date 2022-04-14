import { useActiveWeb3React } from '../../services/web3'
import { NEVER_RELOAD, useSingleCallResult, useSingleContractMultipleMethods } from '../../state/multicall/hooks'
import { useRewardPoolContract, useVotingEscrowContract } from '../../hooks/useContract'
import { useMemo } from 'react'

export function useLockedBalance() {
  const { account } = useActiveWeb3React()

  if (!account) {
    return {
      emoSupply: undefined,
      veEmoSupply: undefined,
      veEmo: undefined,
      lockEnd: undefined,
      lockAmount: undefined,
      rewards: undefined,
      harvestRewards: undefined,
    }
  }

  const harvestRewards = useSingleCallResult(useRewardPoolContract(), 'calculateHarvestEmoRewards', undefined)?.result
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

  // lockAmount, lockEnd, veEmo, emoSupply, veEmoSupply
  if (results && Array.isArray(results) && results.length === callsData.length) {
    const [{ result: emoSupply }, { result: veEmoSupply }, { result: veEmo }, { result: lockInfo }] = results
    return {
      emoSupply: emoSupply?.[0],
      veEmoSupply: veEmoSupply?.[0],
      veEmo: veEmo?.[0],
      lockEnd: lockInfo?.end,
      lockAmount: lockInfo?.amount,
      rewards: rewards?.[0],
      harvestRewards: harvestRewards?.[0],
    }
  }

  return {
    emoSupply: undefined,
    veEmoSupply: undefined,
    veEmo: undefined,
    lockEnd: undefined,
    lockAmount: undefined,
    rewards: undefined,
    harvestRewards: undefined,
  }
}
