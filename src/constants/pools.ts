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
  [ChainId.EVMOS]: {},

  [ChainId.EVMOS_TESTNET]: {},

  [ChainId.BSC_TESTNET]: {
    '0x18E1C9aB5db2a8E6B5bf433551A290FCD092D715': {
      pid: 0,
      name: 'EMO-USDC',
      tokenPerBlock: '0.17',
      isFinished: false,
      category: PoolCategory.COMMUNITY,
      projectLink: 'https://evmoswap.org',
      stakingToken: {
        id: '0xd41223b4Ed7e68275D3C567c237217Fbb2575568',
        name: 'EvmoSwap Token',
        symbol: 'EMO',
        decimals: 18,
      },
      earningToken: {
        id: '0x63cE1066c7cA0a028Db94031794bFfe40ceE8b0A',
        name: 'USDC Token',
        symbol: 'USDC',
        decimals: 6,
      },
    },
    '0xf660206db9317ba262BabC29f619b545f63734EF': {
      pid: 1,
      name: 'EMO-USDT',
      tokenPerBlock: '0.07',
      isFinished: false,
      category: PoolCategory.COMMUNITY,
      projectLink: 'https://evmoswap.org',
      stakingToken: {
        id: '0xd41223b4Ed7e68275D3C567c237217Fbb2575568',
        name: 'EvmoSwap Token',
        symbol: 'EMO',
        decimals: 18,
      },
      earningToken: {
        id: '0x7c945caa889fe8b0F2F53f29876596A1b0f7a4d9',
        name: 'USDT Token',
        symbol: 'USDT',
        decimals: 6,
      },
    },
  },
}
