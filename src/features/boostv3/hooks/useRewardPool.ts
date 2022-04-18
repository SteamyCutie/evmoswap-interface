import { BigNumber } from '@ethersproject/bignumber'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useRewardPoolContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useCallback } from 'react'
import { useMultistakingContract } from './useContract'

export function useRewardPool() {
  const { account, chainId } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const contract = useRewardPoolContract()
  const multistaking = useMultistakingContract()

  // harvest
  const harvestRewards = useCallback(async () => {
    try {
      const tx = await contract?.harvest(account)
      return addTransaction(tx, { summary: i18n._(t`Harvest rewards`) })
    } catch (e) {
      console.log(e.message)
      return e
    }
  }, [addTransaction, contract, account])

  const withdrawEarnings = useCallback(
    async (amount: BigNumber) => {
      try {
        const tx = await multistaking?.withdraw(amount)
        return addTransaction(tx, { summary: i18n._(t`Withdraw earnings ${amount.toFixed(4)}`) })
      } catch (e) {
        console.log(e.message, amount.toString())
        return e
      }
    },
    [addTransaction, contract, account]
  )
  return {
    harvestRewards,
    withdrawEarnings,
  }
}
