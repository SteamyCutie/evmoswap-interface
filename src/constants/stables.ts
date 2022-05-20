
import { ChainId, CurrencyAmount, Token } from "@evmoswap/core-sdk";

export type StableTokenInfo = {
    name: string;
    symbol: string;
    decimals: number;
    address?: string;
    icon?: {
        src: string;
        height: number;
        width: number;
    };
};

export type StablePool = {
    pid: number;
    slug: string;
    name: string;
    title: string;
    pooledTokens: StableTokenInfo[]; //arranged based on token index.
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
    lpToken: Token | undefined
}

type StableAddressMap = {
    [ chainId: number ]: {
        [ poolId: string ]: StablePool;
    };
};

//common stable tokens
export const STABLE_POOLS_TOKENS = {
    "DAI": { name: "DAI Coin", symbol: "DAI", decimals: 18 },
    "USDC": { name: "USD Coin", symbol: "USDC", decimals: 6 },
    "USDT": { name: "Tether", symbol: "USDT", decimals: 6 },
    "UST": { name: "UST", symbol: "UST", decimals: 18 },
}

//common pools to all chains. This is used to reduce entry repetition.
const BASE_STABLE_POOLS = {
    "0": {
        pid: 0,
        slug: "3pool",
        name: "3Pool",
        title: "USDC + DAI + USDT",
        pooledTokens: [ STABLE_POOLS_TOKENS.DAI, STABLE_POOLS_TOKENS.USDC, STABLE_POOLS_TOKENS.USDT ]
    },
    "1": {
        pid: 1,
        slug: "ust-3Pool",
        name: "UST + 3Pool",
        title: "UST + 3Pool",
        pooledTokens: [ STABLE_POOLS_TOKENS.UST, STABLE_POOLS_TOKENS.DAI, STABLE_POOLS_TOKENS.USDC, STABLE_POOLS_TOKENS.USDT ],
        isMeta: true
    }
}


//chains configuration for stable pools. Inherit and extend as neccessary
export const STABLE_POOLS: StableAddressMap = {
    [ ChainId.EVMOS ]: { "0": BASE_STABLE_POOLS[ "0" ] },

    [ ChainId.EVMOS_TESTNET ]: { "0": BASE_STABLE_POOLS[ "0" ] },

    [ ChainId.BSC_TESTNET ]: BASE_STABLE_POOLS
};