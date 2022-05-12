import { useTreasuryContract } from 'app/hooks'
import { useCallback } from 'react'
import BigNumber from 'bignumber.js'

export const buy = async (contract, amount: string) => {
  try {
    return await contract.buy(amount.toBigNumber(18).toString())
  } catch (err) {
    return console.warn(err)
  }
}

export const sell = async (contract, amount: string) => {
  try {
    return await contract.sell(amount.toBigNumber(18).toString())
  } catch (err) {
    return console.warn(err)
  }
}

export const useSellGemEMO = () => {
  const treasuryContract = useTreasuryContract()

  const handleSell = useCallback(
    async (amount: string) => {
      try {
        return await sell(treasuryContract, amount)
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
        return await buy(treasuryContract, amount)
      } catch (e) {
        return false
      }
    },
    [treasuryContract]
  )

  return { handleBuy }
}
