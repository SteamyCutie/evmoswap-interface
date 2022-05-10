import { ChainId, Token } from "@evmoswap/core-sdk";

export enum PoolCategory {
    "CORE" = "Core",
    "AUTO" = "Auto",
    "COMMUNITY" = "Community"
}

// migrate from sushiswap
export type TokenInfo = {
    id: string;
    name: string;
    symbol: string;
    decimals?: number;
};

export type PoolInfo = {
    pid: number;
    name?: string;
    title?: string;
    category?: string;
    tokenPerBlock?: string;
    stakingToken: TokenInfo;
    earningToken?: TokenInfo;
    projectLink?: string;
    isFinished: boolean;
};

type AddressMap = {
    [ chainId: number ]: {
        [ address: string ]: PoolInfo;
    };
};

export const POOLS: AddressMap = {
    [ ChainId.EVMOS ]: {},

    [ ChainId.EVMOS_TESTNET ]: {
        "0xf1E2E2E706266f5BD68f802377A2C901DF444E23": {
            pid: 0,
            name: "EMO-USDC",
            tokenPerBlock: "0.17",
            isFinished: false,
            category: PoolCategory.COMMUNITY,
            projectLink: "https://evmoswap.org",
            stakingToken: {
                id: "0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002",
                name: "EvmoSwap Token",
                symbol: "EMO",
                decimals: 18
            },
            earningToken: {
                id: "0xae95d4890bf4471501E0066b6c6244E1CAaEe791",
                name: "USDC Coin",
                symbol: "USDC",
                decimals: 6
            }
        },
        "0x738fb57aBD5481d359e82bE338C774F1A21e5441": {
            pid: 0,
            name: "EMO-USDT",
            tokenPerBlock: "0.07",
            isFinished: false,
            category: PoolCategory.COMMUNITY,
            projectLink: "https://evmoswap.org",
            stakingToken: {
                id: "0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002",
                name: "EvmoSwap Token",
                symbol: "EMO",
                decimals: 18
            },
            earningToken: {
                id: "0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c",
                name: "Tether USD",
                symbol: "USDT",
                decimals: 6
            }
        }
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

/**
 * Stable swap config
 */

export type StableTokenInfo = {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    icon?: {
        src: string;
        height: number;
        width: number;
    };
};
export interface StableLpTokenInfo extends StableTokenInfo { }

export type StablePoolInfo = {
    pid: number;
    slug: string;
    name: string;
    title: string;
    lpToken: StableLpTokenInfo;
    pooledTokens: StableTokenInfo[]; //arranged based on token index.
    metaPooledTokens?: StableTokenInfo[]; //arranged based on token index.
    isMeta?: boolean;
};

type StableAddressMap = {
    [ chainId: number ]: {
        [ poolId: string ]: StablePoolInfo;
    };
};

export const STABLE_POOLS_TOKENS = {
    "DAI": {
        address: "0x6456d6f7B224283f8B22F03347B58D8B6d975677",
        name: "DAI Coin",
        symbol: "DAI",
        decimals: 18
    },
    "USDC": {
        address: "0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6
    },
    "USDT": {
        address: "0x648D3d969760FDabc71ea9d59c020AD899237b32",
        name: "Tether",
        symbol: "USDT",
        decimals: 6
    },
    "UST": {
        address: "0xf8e00573a7e669e42F4bF022497bAfca527c403F",
        name: "UST",
        symbol: "UST",
        decimals: 6
    },
}

export const STABLE_POOLS_META_TOKENS = {
    "3POOL": {
        address: "0x6a6047cC45261FeaC3baEF19FD2b3f9a7B3b7463",
        name: "3EMOS",
        symbol: "3Pool",
        decimals: 18,
        icon: {
            src: "https://raw.githubusercontent.com/sushiswap/icons/master/token/usdt.jpg",
            height: 48,
            width: 100
        }
    },
    "UST3POOL": {
        address: "0x4Fc1C86b459d3899dcBe569F95A2CA91F4B006a1",
        name: "UST 3Pool LP",
        symbol: "UST3Pool",
        decimals: 18,
        icon: {
            src: "https://raw.githubusercontent.com/sushiswap/icons/master/token/usdt.jpg",
            height: 48,
            width: 100
        }
    }
}

export const STABLE_POOLS: StableAddressMap = {
    [ ChainId.EVMOS ]: {},

    [ ChainId.EVMOS_TESTNET ]: {},

    [ ChainId.BSC_TESTNET ]: {
        "0": {
            pid: 0,
            slug: "3pool",
            name: "3Pool",
            title: "USDC + DAI + USDT",
            lpToken: STABLE_POOLS_META_TOKENS[ "3POOL" ],
            pooledTokens: [
                STABLE_POOLS_TOKENS.DAI,
                STABLE_POOLS_TOKENS.USDC,
                STABLE_POOLS_TOKENS.UST
            ]
        },
        "1": {
            pid: 1,
            slug: "ust-3Pool",
            name: "UST + 3Pool",
            title: "UST + 3Pool",
            lpToken: STABLE_POOLS_META_TOKENS[ "UST3POOL" ],
            pooledTokens: [
                STABLE_POOLS_TOKENS.UST,
                STABLE_POOLS_TOKENS.DAI,
                STABLE_POOLS_TOKENS.USDC,
                STABLE_POOLS_TOKENS.UST
            ],
            metaPooledTokens: [
                STABLE_POOLS_TOKENS.UST,
                STABLE_POOLS_META_TOKENS[ "3POOL" ]
            ],
            isMeta: true
        }
    }
};