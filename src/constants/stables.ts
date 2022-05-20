
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
                { ...STABLE_POOLS_TOKENS.DAI, ...{ address: "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ address: "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ address: "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e" } },
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
                { ...STABLE_POOLS_TOKENS.DAI, ...{ address: "0x7c4a1D38A755a7Ce5521260e874C009ad9e4Bf9c" } },
                { ...STABLE_POOLS_TOKENS.USDC, ...{ address: "0xae95d4890bf4471501E0066b6c6244E1CAaEe791" } },
                { ...STABLE_POOLS_TOKENS.USDT, ...{ address: "0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c" } },
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