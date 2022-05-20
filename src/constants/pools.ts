import { ChainId, CurrencyAmount, Token } from "@evmoswap/core-sdk";

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

export type StablePool = {
    pid: number;
    slug: string;
    name: string;
    title: string;
    lpToken: StableLpTokenInfo;
    pooledTokens: StableTokenInfo[]; //arranged based on token index.
    metaPooledTokens?: StableTokenInfo[]; //arranged based on token index.
    isMeta?: boolean;
};

export interface StablePoolInfo extends StablePool {
    swapFee: number
    adminFee: number
    virtualPrice: number
    a: number
    isLoading: boolean
    pooledTokensInfo: {
        balances: CurrencyAmount<Token>[] | undefined //array of token balances
        total: number
        tokens: Token[] | undefined
    },
    lpTokenInstance: Token
}

type StableAddressMap = {
    [ chainId: number ]: {
        [ poolId: string ]: StablePool;
    };
};

//common stable tokens
export const STABLE_POOLS_TOKENS = {
    "DAI": { address: "", name: "DAI Coin", symbol: "DAI", decimals: 18 },
    "USDC": { address: "", name: "USD Coin", symbol: "USDC", decimals: 6 },
    "USDT": { address: "", name: "Tether", symbol: "USDT", decimals: 6 },
    "UST": { address: "", name: "UST", symbol: "UST", decimals: 18 },
}

//stable pools lp tokens 
export const STABLE_POOLS_LP_TOKENS = {
    "3POOL": {
        address: "",
        name: "3EMOS",
        symbol: "3Pool",
        decimals: 18,
    },
    "UST3POOL": {
        address: "",
        name: "UST 3Pool LP",
        symbol: "UST3Pool",
        decimals: 18
    }
}

//common pools to all chains. This is used to reduce entry repetition.
const BASE_STABLE_POOLS = {
    "0": {
        pid: 0,
        slug: "3pool",
        name: "3Pool",
        title: "USDC + DAI + USDT",
        lpToken: STABLE_POOLS_LP_TOKENS[ "3POOL" ],
        pooledTokens: [ STABLE_POOLS_TOKENS.DAI, STABLE_POOLS_TOKENS.USDC, STABLE_POOLS_TOKENS.USDT ]
    },
    "1": {
        pid: 1,
        slug: "ust-3Pool",
        name: "UST + 3Pool",
        title: "UST + 3Pool",
        lpToken: STABLE_POOLS_LP_TOKENS[ "UST3POOL" ],
        pooledTokens: [ STABLE_POOLS_TOKENS.UST, STABLE_POOLS_TOKENS.DAI, STABLE_POOLS_TOKENS.USDC, STABLE_POOLS_TOKENS.USDT ],
        metaPooledTokens: [ STABLE_POOLS_TOKENS.UST, STABLE_POOLS_LP_TOKENS[ "3POOL" ] ],
        isMeta: true
    }
}


//chains configuration for stable pools. Inherit and extend as neccessary
export const STABLE_POOLS: StableAddressMap = {
    [ ChainId.EVMOS ]: { "0": BASE_STABLE_POOLS[ "0" ] },

    [ ChainId.EVMOS_TESTNET ]: { "0": BASE_STABLE_POOLS[ "0" ] },

    [ ChainId.BSC_TESTNET ]: BASE_STABLE_POOLS
};