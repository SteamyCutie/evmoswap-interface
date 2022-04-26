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

  [ChainId.EVMOS_TESTNET]: {
    '0xf1E2E2E706266f5BD68f802377A2C901DF444E23': {
      pid: 0,
      name: 'EMO-USDC',
      tokenPerBlock: '0.17',
      isFinished: false,
      category: PoolCategory.COMMUNITY,
      projectLink: 'https://evmoswap.org',
      stakingToken: {
        id: '0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002',
        name: 'EvmoSwap Token',
        symbol: 'EMO',
        decimals: 18,
      },
      earningToken: {
        id: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791',
        name: 'USDC Coin',
        symbol: 'USDC',
        decimals: 6,
      },
    },
    '0x738fb57aBD5481d359e82bE338C774F1A21e5441': {
      pid: 0,
      name: 'EMO-USDT',
      tokenPerBlock: '0.07',
      isFinished: false,
      category: PoolCategory.COMMUNITY,
      projectLink: 'https://evmoswap.org',
      stakingToken: {
        id: '0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002',
        name: 'EvmoSwap Token',
        symbol: 'EMO',
        decimals: 18,
      },
      earningToken: {
        id: '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      },
    },
  },

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
        id: '0xFCBdf3F929e049F2F062cd7e4084fd6f2E5b9c73',
        name: 'USDC Coin',
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
        id: '0xb75fdC39459DAfA30Bc4ec9ca15B40C14084FB4e',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      },
    },
  },
}
