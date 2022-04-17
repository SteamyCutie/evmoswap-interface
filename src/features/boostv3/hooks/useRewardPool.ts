import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount, Token } from '@evmoswap/core-sdk'
import { ERC20_ABI } from 'app/constants/abis/erc20'
import { useContract, useRewardPoolContract, useVotingEscrowContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useMultipleContractSingleData, useSingleCallResult } from 'app/state/multicall/hooks'
import BigNumber from 'bignumber.js'

export function useRewardPool() {
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
