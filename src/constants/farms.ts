import { ChainId } from '@evmoswap/core-sdk'
import { STABLE_POOLS_TOKENS } from './stables'

export type TokenInfo = {
    id: string
    name: string
    symbol: string
    decimals?: number
}

export enum FarmType {
    STABLE = "stable",
    DOUBLE = "double"
}

export type PairInfo = {
    id: number
    pid: number
    token0: TokenInfo
    token1?: TokenInfo
    tokens?: TokenInfo[]
    name?: string
    symbol?: string
    pair?: string
    isCommunity?: boolean
    migrate?: boolean
    isVote?: boolean
    isZap?: boolean
    farmType?: FarmType,
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
    [ chainId: number ]: {
        [ address: string ]: PairInfo
    }
}

export const FARMS: AddressMap = {
    [ ChainId.EVMOS ]: {
        '0x8a1Db0bdFa113Ba93F0Ef917e0CdA76875924E7d': {
            id: 0,
            pid: 1,
            symbol: 'ELP',
            name: 'EMO-EVMOS',
            token0: { id: '0x181C262b973B22C307C646a67f64B76410D19b6B', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
            token1: { id: '0xD4949664cD82660AaE99bEdc034a0deA8A0bd517', name: 'WEVMOS Token', symbol: 'EVMOS', decimals: 18 },
            isVote: false,
            isZap: false,
        },

        '0x6d3be967f352f5509a3a5ac63ccd5ecb959c5631': {
            id: 1,
            pid: 2,
            symbol: 'ELP',
            name: 'EMO-USDC',
            token0: { id: '0x181C262b973B22C307C646a67f64B76410D19b6B', name: 'EvmoSwap', symbol: 'EMO', decimals: 18 },
            token1: { id: '0x51e44FfaD5C2B122C8b635671FCC8139dc636E82', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
            isVote: false,
            isZap: false,
        },

        '0x6946d31978e0249950e4ae67e8a38aa5d3d4de13': {
            id: 2,
            pid: 3,
            symbol: 'ELP',
            name: 'USDC-EVMOS',
            token0: { id: '0x51e44FfaD5C2B122C8b635671FCC8139dc636E82', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
            token1: { id: '0xD4949664cD82660AaE99bEdc034a0deA8A0bd517', name: 'WEVMOS Token', symbol: 'EVMOS', decimals: 18 },
            isVote: false,
            isZap: false,
        },

        '0x898563F02DB0e60Aff2A6d45DA1b9fAEedFFc4F1': {
            id: 3,
            pid: 4,
            symbol: '3POOL',
            name: '3EMO LP',
            token0: { ...STABLE_POOLS_TOKENS.DAI, ...{ id: "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA" } },
            token1: { ...STABLE_POOLS_TOKENS.USDC, ...{ id: "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82" } },
            tokens: [
                { ...STABLE_POOLS_TOKENS.DAI, ...{ id: "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ id: "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ id: "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e" } },
            ],
            isVote: true,
            isZap: false,
            farmType: FarmType.STABLE,
        },
    },

    [ ChainId.EVMOS_TESTNET ]: {
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

        '0x6320CFBEBbE1f18160DA60eA06ACc87F82dBCf36': {
            id: 2,
            pid: 3,
            symbol: 'ELP',
            name: 'USDC-EVMOS',
            token0: { id: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
            token1: { id: '0x3d486E0fBa11f6F929E99a47037A5cd615636E17', name: 'WEVMOS Token', symbol: 'EVMOS', decimals: 18 },
            isVote: true,
            isZap: false,
        },

        '0x34ae15A977761BB07aCd7E09354802F26a5F7C1D': {
            id: 3,
            pid: 4,
            symbol: 'ELP',
            name: 'USDC-USDT',
            isVote: true,
            isZap: true,
            token0: { id: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
            token1: { id: '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
        },
    },

    [ ChainId.BSC_TESTNET ]: {
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
            farmType: FarmType.DOUBLE,
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
        },

        '0x6a6047cC45261FeaC3baEF19FD2b3f9a7B3b7463': {
            id: 4,
            pid: 5,
            symbol: '3POOL',
            name: '3EMO LP',
            token0: { ...STABLE_POOLS_TOKENS.DAI, ...{ id: "0x6456d6f7B224283f8B22F03347B58D8B6d975677" } },
            token1: { ...STABLE_POOLS_TOKENS.USDC, ...{ id: "0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df" } },
            tokens: [
                { ...STABLE_POOLS_TOKENS.DAI, ...{ id: "0x6456d6f7B224283f8B22F03347B58D8B6d975677" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ id: "0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ id: "0x648D3d969760FDabc71ea9d59c020AD899237b32" } },
            ],
            isVote: true,
            isZap: false,
            farmType: FarmType.STABLE,
        },
    },
}
