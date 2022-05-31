import { ChainId, CurrencyAmount, Token } from "@evmoswap/core-sdk";

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
    title?: string
    category?: string
    tokenPerBlock?: string
    stakingToken: TokenInfo
    earningToken?: TokenInfo
    projectLink?: string
    isFinished: boolean
}

type AddressMap = {
    [ chainId: number ]: {
        [ address: string ]: PoolInfo
    }
}

export const POOLS: AddressMap = {
    [ ChainId.EVMOS ]: {},

    [ ChainId.EVMOS_TESTNET ]: {
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

        [ ChainId.BSC_TESTNET ]: {
            "0x18E1C9aB5db2a8E6B5bf433551A290FCD092D715": {
                pid: 0,
                name: "EMO-USDC",
                tokenPerBlock: "0.17",
                isFinished: false,
                category: PoolCategory.COMMUNITY,
                projectLink: "https://evmoswap.org",
                stakingToken: {
                    id: "0xd41223b4Ed7e68275D3C567c237217Fbb2575568",
                    name: "EvmoSwap Token",
                    symbol: "EMO",
                    decimals: 18
                },
                earningToken: {
                    id: "0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df",
                    name: "USDC Coin",
                    symbol: "USDC",
                    decimals: 6
                }
            },
            "0xf660206db9317ba262BabC29f619b545f63734EF": {
                pid: 1,
                name: "EMO-USDT",
                tokenPerBlock: "0.07",
                isFinished: false,
                category: PoolCategory.COMMUNITY,
                projectLink: "https://evmoswap.org",
                stakingToken: {
                    id: "0xd41223b4Ed7e68275D3C567c237217Fbb2575568",
                    name: "EvmoSwap Token",
                    symbol: "EMO",
                    decimals: 18
                },
                earningToken: {
                    id: "0x648D3d969760FDabc71ea9d59c020AD899237b32",
                    name: "Tether USD",
                    symbol: "USDT",
                    decimals: 6
                }
            }
        }
    };
