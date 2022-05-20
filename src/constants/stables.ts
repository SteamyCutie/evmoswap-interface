
import { ChainId, CurrencyAmount, Token } from "@evmoswap/core-sdk";

export type StableTokenInfo = {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
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


//chains configuration for stable pools. Inherit and extend as neccessary
export const STABLE_POOLS: StableAddressMap = {
    [ ChainId.EVMOS ]: {
        "0": {
            pid: 0,
            slug: "3pool",
            name: "3Pool",
            title: "USDC + DAI + USDT",
            pooledTokens: [
                { ...STABLE_POOLS_TOKENS.DAI, ...{ address: "" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ address: "" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ address: "" } },
            ]
        }
    },

    [ ChainId.EVMOS_TESTNET ]: {
        "0": {
            pid: 0,
            slug: "3pool",
            name: "3Pool",
            title: "USDC + DAI + USDT",
            pooledTokens: [
                { ...STABLE_POOLS_TOKENS.DAI, ...{ address: "" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ address: "" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ address: "" } },
            ]
        }
    },

    [ ChainId.BSC_TESTNET ]: {
        "0": {
            pid: 0,
            slug: "3pool",
            name: "3Pool",
            title: "USDC + DAI + USDT",
            pooledTokens: [
                { ...STABLE_POOLS_TOKENS.DAI, ...{ address: "0x6456d6f7B224283f8B22F03347B58D8B6d975677" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ address: "0x9b5bb7F5BE680843Bcd3B54D4E5C6eE889c124Df" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ address: "0x648D3d969760FDabc71ea9d59c020AD899237b32" } },
            ]
        }
    }
};