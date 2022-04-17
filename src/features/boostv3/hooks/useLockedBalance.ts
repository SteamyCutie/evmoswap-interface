import { useRewardPoolContract, useVotingEscrowContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useSingleCallResult, useSingleContractMultipleMethods } from 'app/state/multicall/hooks'
import { useMemo } from 'react'

export function useLockedBalance() {
  const { account } = useActiveWeb3React()

  const defaultResp = {
    emosSupply: undefined,
    veEmosSupply: undefined,
    veEmos: undefined,
    lockEnd: undefined,
    lockAmount: undefined,
    rewards: undefined,
  }

  if (!account) {
    return defaultResp
  }

  const rewards = useSingleCallResult(useRewardPoolContract(), 'userInfo', account ? [account] : undefined)?.result

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
  console.log(rewards)
  // lockAmount, lockEnd, veEmos, emosSupply, veEmosSupply
  if (results && Array.isArray(results) && results.length === callsData.length) {
    const [{ result: emosSupply }, { result: veEmosSupply }, { result: veEmos }, { result: lockInfo }] = results
    return {
      emosSupply: emosSupply?.[0],
      veEmosSupply: veEmosSupply?.[0],
      veEmos: veEmos?.[0],
      lockEnd: lockInfo?.end,
      lockAmount: lockInfo?.amount,
      rewards: rewards?.rewardDebt, //rewards.amount
    }
  }

  return {
    emosSupply: undefined,
    veEmosSupply: undefined,
    veEmos: undefined,
    lockEnd: undefined,
    lockAmount: undefined,
    rewards: undefined,
  }
}
