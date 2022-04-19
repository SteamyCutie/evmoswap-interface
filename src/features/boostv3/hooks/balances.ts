import { Interface } from '@ethersproject/abi'
import { CurrencyAmount, Currency, Token } from '@evmoswap/core-sdk'
import { ERC20_ABI } from 'app/constants/abis/erc20'
import { useRewardPoolContract, useVotingEscrowContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleMethods,
} from 'app/state/multicall/hooks'
import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useMultistakingContract } from './useContract'

export function useLockedBalance() {
  const { account } = useActiveWeb3React()

  const defaultResp = {
    emosSupply: undefined,
    veEmosSupply: undefined,
    veEmos: undefined,
    lockEnd: undefined,
    lockAmount: undefined,
  }

  if (!account) {
    return defaultResp
  }

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
    }
  }

  return defaultResp
}

/**
 * Rewards pool pending balances
 * @returns object
 */
export function useRewardsBalance() {
  const { account, chainId } = useActiveWeb3React()

  const resp: { amounts: CurrencyAmount<Currency>[]; tokens: Token[]; total: BigNumber } = {
    amounts: [],
    tokens: [],
    total: new BigNumber(0),
  }

  let tokens = []
  let amounts = []

  if (!account) {
    return resp
  }

  const rewards = useSingleCallResult(useRewardPoolContract(), 'pendingTokens', account ? [account] : undefined)?.result

  if (rewards?.amounts && Array.isArray(rewards.amounts)) amounts = rewards?.amounts

  if (rewards?.amounts && Array.isArray(rewards.amounts)) tokens = rewards.tokens

  const contractInterface = new Interface(ERC20_ABI)
  const symbolsResult = useMultipleContractSingleData(tokens, contractInterface, 'symbol')
  const decimalsResult = useMultipleContractSingleData(tokens, contractInterface, 'decimals')

  const symbols = symbolsResult[0]?.result
  const decimals = decimalsResult[0]?.result
  if (
    tokens &&
    amounts &&
    symbols &&
    decimals &&
    symbols.length === decimals.length &&
    decimals.length === tokens.length &&
    tokens.length === amounts.length
  ) {
    tokens.map((tokenAddress, index) => {
      const token = new Token(chainId, tokenAddress, decimals[index], symbols[index], symbols[index])
      const amount = CurrencyAmount.fromRawAmount(token, amounts[index].toString())

      resp.tokens[index] = token
      resp.amounts[index] = amount
      resp.total.plus(amount.toExact())
    })
  }

  return resp
}

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
    [account]
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
