import { ChainId } from '@evmoswap/core-sdk'

export type TokenInfo = {
  id: string
  name: string
  symbol: string
  decimals?: number
}

export type PairInfo = {
  id: number
  pid: number
  token0: TokenInfo
  token1?: TokenInfo
  name?: string
  symbol?: string
  pair?: string
  isCommunity?: boolean
  migrate?: boolean
  isVote?: boolean
  isZap?: boolean
  farmType?: string
}

export type FarmPairInfo = {
  id: number
  pid: number
  token0: TokenInfo
  token1?: TokenInfo
  name?: string
  symbol?: string
  pair?: string
  isCommunity?: boolean
  migrate?: boolean
  isVote?: boolean
  isZap?: boolean
  lpToken?: string
  chef?: number
  type?: string
  tokenPrice?: number
  totalTvlInUSD?: number
  flpBalance?: number
  tvl?: number
  apr?: number
  lpPrice?: number
  boostApr?: number
  multiplier?: number
}

export type AddressMap = {
  [chainId: number]: {
    [address: string]: PairInfo
  }
}

export const FARMS: AddressMap = {
  [ChainId.EVMOS]: {},

  [ChainId.EVMOS_TESTNET]: {
    '0x9B28773f2B6c81Eb1818Ae4475C1A61cAaAD73EE': {
      id: 0,
      pid: 1,
      symbol: 'ELP',
      name: 'EMO-EVMOS',
      token0: { id: '0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
      token1: { id: '0x3d486E0fBa11f6F929E99a47037A5cd615636E17', name: 'WEVMOS Token', symbol: 'EVMOS', decimals: 18 },
      isVote: true,
      isZap: false,
    },

    '0x1B7E27cf4984D69745cB9C65030c0e123Ee57054': {
      id: 1,
      pid: 2,
      symbol: 'ELP',
      name: 'EMO-USDC',
      token0: { id: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      token1: { id: '0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
      isVote: true,
      isZap: false,
    },

    '0x34ae15A977761BB07aCd7E09354802F26a5F7C1D': {
      id: 2,
      pid: 3,
      symbol: 'ELP',
      name: 'USDC-USDT',
      isVote: true,
      isZap: true,
      token0: { id: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      token1: { id: '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    },

    // '0x87ce4e5bBCE1Ee646Fa28B61CbC7EFac4722680e': {
    //   id: 3,
    //   pid: 4,
    //   symbol: 'ELP',
    //   name: 'USDC-BNB',
    //   token0: { id: '0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    //   token1: { id: '0xab0D0540b724D7A1BCF64A651fc245BEDb11C091', name: 'WBNB Token', symbol: 'BNB', decimals: 18 },
    //   isVote: true,
    //   isZap: false,
    // },
  },

  [ChainId.BSC_TESTNET]: {
    '0x33919a080caD90B8E3d7dB7f9f8CAF3C451C1fE2': {
      id: 0,
      pid: 1,
      symbol: 'ELP',
      name: 'EMO-BNB',
      token0: { id: '0xd41223b4Ed7e68275D3C567c237217Fbb2575568', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
      token1: { id: '0xab0D0540b724D7A1BCF64A651fc245BEDb11C091', name: 'WBNB Token', symbol: 'BNB', decimals: 18 },
      isVote: true,
      isZap: false,
    },

    '0xF6210A01E8F271862871a80Dbf3fdCD720F8Ef3C': {
      id: 1,
      pid: 2,
      symbol: 'ELP',
      name: 'EMO-USDC',
      token0: { id: '0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      token1: { id: '0xd41223b4Ed7e68275D3C567c237217Fbb2575568', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
      isVote: true,
      isZap: false,
    },

    '0x1658E34386Cc5Ec3B703a34567790d95F1C94cCb': {
      id: 2,
      pid: 3,
      symbol: 'ELP',
      name: 'USDC-USDT',
      isVote: true,
      isZap: true,
      token0: { id: '0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      token1: { id: '0x648D3d969760FDabc71ea9d59c020AD899237b32', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
      farmType: 'double',
    },

    '0x87ce4e5bBCE1Ee646Fa28B61CbC7EFac4722680e': {
      id: 3,
      pid: 4,
      symbol: 'ELP',
      name: 'USDC-BNB',
      token0: { id: '0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      token1: { id: '0xab0D0540b724D7A1BCF64A651fc245BEDb11C091', name: 'WBNB Token', symbol: 'BNB', decimals: 18 },
      isVote: true,
      isZap: false,
      farmType: 'stable',
    },
  },
}
