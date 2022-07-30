import { useEffect, useState, Dispatch, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'app/services/web3'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, JSBI } from '@sushiswap/core-sdk'
import {
  useDashboardContract,
  useMasterChefContract,
  useSimpleIncentiveContract,
  useTokenContract,
} from 'app/hooks/useContract'
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from 'app/state/multicall/hooks'
import { useCurrency, useToken } from 'app/hooks/Tokens'
import { Token } from '@evmoswap/core-sdk'
import ERC20_INTERFACE from 'app/constants/abis/erc20'
import { FARMS_REWARD_RATE_PER_SEC, PairInfo, TokenInfo } from 'app/constants/farms'
import { formatBalance, formatNumber } from 'app/functions'
import { formatBigNumber, formatBigNumberToFixed } from 'app/functions/formatBalance'
import { useWeb3React } from '@web3-react/core'

// @ts-ignore TYPE NEEDS FIXING
export function useUserInfo(farm, token) {
  const { account } = useActiveWeb3React()

  const contract = useMasterChefContract()

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(farm.pid), String(account)]
  }, [farm, account])

  const result = useSingleCallResult(args ? contract : null, 'userInfo', args)?.result

  const value = result?.[0]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return {
    stakedAmount: amount && token ? CurrencyAmount.fromRawAmount(token, amount) : undefined,
  }
}

export function useFarmPendingRewardsAmount(farm) {
  const { account, chainId } = useActiveWeb3React()
  const contract = useMasterChefContract()

  let tokenAddresses = []
  let amountsRaw = []

  //base rewards from masterchef
  const baseRewards = useSingleCallResult(
    contract,
    'pendingTokens',
    account ? [String(farm.pid), String(account)] : [undefined]
  )?.result
  if (baseRewards?.tokens && baseRewards?.amounts)
    baseRewards.tokens.map((token, index) => {
      tokenAddresses.push(token)
      amountsRaw.push(baseRewards?.amounts[index])
    })

  //get tokens info
  const symbolsResult = useMultipleContractSingleData(tokenAddresses, ERC20_INTERFACE, 'symbol')
  const decimalsResult = useMultipleContractSingleData(tokenAddresses, ERC20_INTERFACE, 'decimals')
  const symbols = symbolsResult.map((s) => s?.result?.[0])
  const decimals = decimalsResult.map((d) => d?.result?.[0])

  //create each token instance.
  const tokens = useMemo(() => {
    if (decimals && symbols && symbols.length === decimals.length)
      return decimals.filter(Boolean).map((decimal, i) => new Token(chainId, tokenAddresses[i], decimal, symbols[i]))
  }, [decimals, symbols])

  //make amounts
  const amounts = tokens?.map((token, i) => (token ? CurrencyAmount.fromRawAmount(token, amountsRaw[i] || '0') : null))

  return amounts || []
}

export function useFarmRewardsApr(farm?: PairInfo, rewards?: Token[]) {
  const reward0APR = useFarmRewardApr(rewards?.[0], farm?.pid)
  const reward1APR = useFarmRewardApr(rewards?.[1], farm?.pid)
  return ([reward0APR, reward1APR] || [0, 0]).slice(0, rewards?.length)
}

export function useFarmRewardApr(token: Token, pid?: any) {
  const { chainId } = useWeb3React()
  const dashboardContract = useDashboardContract()
  const masterchef = useMasterChefContract()

  const TOKENLESS_PRODUCTION = useSingleCallResult(masterchef, 'TOKENLESS_PRODUCTION')?.result?.[0]
  const poolInfo = useSingleCallResult(masterchef, 'poolInfo', [pid])?.result
  const emoPerSec = useSingleCallResult(masterchef, 'emoPerSecond')?.result?.[0] //

  const workingSupply = poolInfo?.workingSupply
  const lpAddress = poolInfo?.lpToken

  const rewardAddress = token?.address
  const decimals = token?.decimals
  const tokenPerSec = FARMS_REWARD_RATE_PER_SEC[chainId][rewardAddress]
  const rate = tokenPerSec > 0 ? String(tokenPerSec).toBigNumber(decimals) : emoPerSec

  const rewardPriceInETH = useSingleCallResult(
    dashboardContract,
    'valueOfAsset',
    rewardAddress ? [rewardAddress, '1'.toBigNumber(decimals)] : [undefined]
  )?.result?.[0]
  const emoRewardPerYearOfPool = useSingleCallResult(dashboardContract, 'rewardPerYearOfPool', [pid])?.result?.[0]
  const rewardPerYearOfPool =
    emoRewardPerYearOfPool && emoPerSec ? emoRewardPerYearOfPool.div(emoPerSec).mul(rate) : '0'

  const valueInETH = useSingleCallResult(dashboardContract, 'valueOfAsset', [lpAddress, workingSupply])?.result?.[0]

  if (!rewardPriceInETH || !valueInETH || !TOKENLESS_PRODUCTION || !rewardPerYearOfPool) {
    return '0'
  }

  return formatBigNumber(TOKENLESS_PRODUCTION.mul(rewardPriceInETH).mul(rewardPerYearOfPool).div(valueInETH))
}

export const useEmoUsdcPrice = (): BigNumber | undefined => {
  const dashboard = useDashboardContract()
  return useSingleCallResult(dashboard, 'rewardPriceInUSD')?.result?.[0]
}

export function useTokenInfo(tokenContract?: Contract | null) {
  const _totalSupply = useSingleCallResult(tokenContract ? tokenContract : null, 'totalSupply', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const _burnt = useSingleCallResult(
    tokenContract ? tokenContract : null,
    'balanceOf',
    ['0x000000000000000000000000000000000000dEaD'],
    NEVER_RELOAD
  )?.result?.[0]

  const totalSupply = _totalSupply ? JSBI.BigInt(_totalSupply.toString()) : JSBI.BigInt(0)
  const burnt = _burnt ? JSBI.BigInt(_burnt.toString()) : JSBI.BigInt(0)

  const circulatingSupply = JSBI.subtract(totalSupply, burnt)

  const token = useToken(tokenContract?.address)

  return useMemo(() => {
    if (!token) {
      return {
        totalSupply: '0',
        burnt: '0',
        circulatingSupply: '0',
      }
    }

    return {
      totalSupply: CurrencyAmount.fromRawAmount(token, totalSupply).toFixed(0),
      burnt: CurrencyAmount.fromRawAmount(token, burnt).toFixed(0),
      circulatingSupply: CurrencyAmount.fromRawAmount(token, circulatingSupply).toFixed(0),
    }
  }, [totalSupply, burnt, circulatingSupply, token])
}

export function useInfiniteScroll(items): [number, Dispatch<number>] {
  const [itemsDisplayed, setItemsDisplayed] = useState(10)
  useEffect(() => setItemsDisplayed(10), [items.length])
  return [itemsDisplayed, setItemsDisplayed]
}
