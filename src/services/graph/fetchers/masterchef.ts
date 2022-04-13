import {
  masterChefV1PairAddressesQuery,
  masterChefV1SushiPerBlockQuery,
  masterChefV1TotalAllocPointQuery,
  masterChefV2PairAddressesQuery,
  miniChefPairAddressesQuery,
  miniChefPoolsQuery,
  poolsQuery,
  poolsV2Query,
} from '../queries'

import { ChainId } from '@evmoswap/core-sdk'
import { GRAPH_HOST } from '../constants'
import { getTokenSubset } from './exchange'
import { request } from 'graphql-request'

export const MINICHEF = {
  [ChainId.EVMOS]: 'sushiswap/matic-minichef',
}

export const miniChef = async (query, chainId = ChainId.ETHEREUM, variables = undefined) =>
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MINICHEF[chainId]}`, query, variables)

export const MASTERCHEF_V2 = {
  [ChainId.ETHEREUM]: 'sushiswap/master-chefv2',
}

export const masterChefV2 = async (query, chainId = ChainId.ETHEREUM, variables = undefined) =>
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MASTERCHEF_V2[chainId]}`, query, variables)

export const MASTERCHEF_V1 = {
  [ChainId.ETHEREUM]: 'sushiswap/master-chef',
}

export const masterChefV1 = async (query, chainId = ChainId.ETHEREUM, variables = undefined) =>
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MASTERCHEF_V1[chainId]}`, query, variables)

export const getMasterChefV1TotalAllocPoint = async () => {
  const {
    masterChef: { totalAllocPoint },
  } = await masterChefV1(masterChefV1TotalAllocPointQuery)
  return totalAllocPoint
}

export const getMasterChefV1SushiPerBlock = async () => {
  const {
    masterChef: { sushiPerBlock },
  } = await masterChefV1(masterChefV1SushiPerBlockQuery)
  return sushiPerBlock / 1e18
}

export const getMasterChefV1Farms = async (variables = undefined) => {
  const { pools } = await masterChefV1(poolsQuery, undefined, variables)
  return pools
}

export const getMasterChefV1PairAddreses = async () => {
  const { pools } = await masterChefV1(masterChefV1PairAddressesQuery)
  return pools
}

export const getMasterChefV2Farms = async (variables = undefined) => {
  const { pools } = await masterChefV2(poolsV2Query, undefined, variables)

  const tokens = await getTokenSubset(ChainId.ETHEREUM, {
    tokenAddresses: Array.from(pools.map((pool) => pool.rewarder.rewardToken)),
  })

  return pools.map((pool) => ({
    ...pool,
    rewardToken: {
      ...tokens.find((token) => token.id === pool.rewarder.rewardToken),
    },
  }))
}

export const getMasterChefV2PairAddreses = async () => {
  const { pools } = await masterChefV2(masterChefV2PairAddressesQuery)
  return pools
}

export const getMiniChefFarms = async (chainId = ChainId.ETHEREUM, variables = undefined) => {
  const { pools } = await miniChef(miniChefPoolsQuery, chainId, variables)
  return pools
}

export const getMiniChefPairAddreses = async (chainId = ChainId.ETHEREUM) => {
  console.debug('getMiniChefPairAddreses')
  const { pools } = await miniChef(miniChefPairAddressesQuery, chainId)
  return pools
}
