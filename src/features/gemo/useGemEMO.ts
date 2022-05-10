import { useTreasuryContract } from 'app/hooks'
import { useCallback } from 'react'
import BigNumber from 'bignumber.js'

export const buy = async (contract, amount) => {
  try {
    return contract.buy(new BigNumber(amount).toString()).then((tx) => {})
  } catch (err) {
    return console.warn(err)
  }
}

export const sell = async (contract, amount) => {
  try {
    return contract.sell(amount.toString()).then((tx) => {
      return tx.hash
    })
  } catch (err) {
    return console.warn(err)
  }
}

export const useSellGemEMO = () => {
  const treasuryContract = useTreasuryContract()

  const handleSell = useCallback(
    async (amount: string) => {
      try {
        const txHash = await sell(treasuryContract, amount)
        return txHash
      } catch (e) {
        return false
      }
    },
    [treasuryContract]
  )

  return { handleSell }
}

export const useBuyGemEMO = () => {
  const treasuryContract = useTreasuryContract()

  const handleBuy = useCallback(
    async (amount: string) => {
      try {
        const txHash = await buy(treasuryContract, amount)
        return txHash
      } catch (e) {
        return false
      }
    },
    [treasuryContract]
  )

  return { handleBuy }
}
