import { ChainId } from '@evmoswap/core-sdk'

export enum PoolCategory {
  'CORE' = 'Core',
  'AUTO' = 'Auto',
  'COMMUNITY' = 'Community',
}

// migrate from sushiswap
export type TokenInfo = {
  id: string
  name: string
  symbol: string
  decimals?: number
}

export type PoolInfo = {
  pid: number
  name?: string
  category?: string
  tokenPerBlock?: string
  stakingToken: TokenInfo
  earningToken?: TokenInfo
  projectLink?: string
  isFinished: boolean
}

type AddressMap = {
  [chainId: number]: {
    [address: string]: PoolInfo
  }
}

export const POOLS: AddressMap = {
  [ChainId.EVMOS]: {
  },

  [ChainId.EVMOS_TESTNET]: {
  },

  [ChainId.BSC_TESTNET]: {
  },
}
