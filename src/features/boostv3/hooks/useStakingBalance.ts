import { useSingleContractMultipleMethods } from 'app/state/multicall/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useMemo } from 'react'
import { useMultistakingContract } from './useContract'

//Get all balance relating to staking
export function useStakingBalance() {
  const { account } = useActiveWeb3React()
  const defaultResp = {
    earnedBalances: undefined, //vesting rewards
    withdrawableBalance: undefined, //staked
    totalBalance: undefined,
  }

  if (!account) {
    return defaultResp
  }

  const contract = useMultistakingContract()
  const callsData = useMemo(
    () => [
      { methodName: 'earnedBalances', callInputs: [account] },
      { methodName: 'withdrawableBalance', callInputs: [account] },
      { methodName: 'totalBalance', callInputs: [account] },
    ],
    []
  )

  const results = useSingleContractMultipleMethods(contract, callsData)

  if (results && Array.isArray(results) && results.length === callsData.length) {
    const [{ result: earnedBalances }, { result: withdrawableBalance }, { result: totalBalance }] = results
    return {
      earnedBalances: { earningsData: earnedBalances?.earningsData, total: earnedBalances?.total },
      withdrawableBalance: withdrawableBalance,
      totalBalance: totalBalance?.[0],
    }
  }

  return defaultResp
}
