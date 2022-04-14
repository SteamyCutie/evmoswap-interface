import { ChainId, SUSHI_ADDRESS, Token, WETH9 } from '@evmoswap/core-sdk'

export const ETHEREUM: { [key: string]: Token } = {
  DAI: new Token(ChainId.EVMOS, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
  USDC: new Token(ChainId.EVMOS, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
  USDT: new Token(ChainId.EVMOS, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
  WBTC: new Token(ChainId.EVMOS, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped Bitcoin'),
}

export const EVMOS: { [key: string]: Token } = {
  DAI: new Token(ChainId.EVMOS, '0xF2001B145b43032AAF5Ee2884e456CCd805F677D', 18, 'DAI', 'Dai Stablecoin'),
  USDC: new Token(ChainId.EVMOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', 6, 'USDC', 'USD Coin'),
  USDT: new Token(ChainId.EVMOS, '0x66e428c3f67a68878562e79A0234c1F83c208770', 6, 'USDT', 'Tether USD'),
  WBTC: new Token(ChainId.EVMOS, '0x062E66477Faf219F25D27dCED647BF57C3107d52', 8, 'WBTC', 'Wrapped Bitcoin'),
  WETH: new Token(ChainId.EVMOS, '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', 18, 'WETH', 'Wrapped Ether'),
}

export const DAI: ChainTokenMap = {
  [ChainId.ETHEREUM]: new Token(
    ChainId.ETHEREUM,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  [ChainId.EVMOS_TESTNET]: new Token(
    ChainId.EVMOS_TESTNET,
    '0x7c4a1D38A755a7Ce5521260e874C009ad9e4Bf9c',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
}

export const USDC: ChainTokenMap = {
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
  [ChainId.EVMOS]: new Token(ChainId.EVMOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', 6, 'USDC', 'USD Coin'),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, '0xae95d4890bf4471501E0066b6c6244E1CAaEe791', 6, 'USDC', 'USDC USD'),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0xFCBdf3F929e049F2F062cd7e4084fd6f2E5b9c73',
    6,
    'USDC',
    'USD Coin'
  ),
}
export const USDT: ChainTokenMap = {
  [ChainId.ETHEREUM]: new Token(
    ChainId.ETHEREUM,
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    6,
    'USDT',
    'Tether USD'
  ),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c', 6, 'USDT', 'Tether USD'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, '0xb75fdC39459DAfA30Bc4ec9ca15B40C14084FB4e', 6, 'USDT', 'Tether USD'),
}

export const XEMO: ChainTokenMap = {
  [ChainId.EVMOS]: new Token(ChainId.EVMOS, '0x25f0965F285F03d6F6B3B21c8EC3367412Fd0ef6', 18, 'xEMO', 'EmoBar'),
  [ChainId.EVMOS_TESTNET]: new Token(
    ChainId.EVMOS_TESTNET,
    '0x369Fe974508fdca2FbdE32375Ea72D4B525f6566',
    18,
    'xEMO',
    'EmoBar'
  ),
}

export type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

// EvmoSwap
export const EvmoSwap: ChainTokenMap = {
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, SUSHI_ADDRESS[ChainId.ETHEREUM], 18, 'SUSHI', 'SushiToken'),
  [ChainId.EVMOS]: new Token(ChainId.EVMOS, SUSHI_ADDRESS[ChainId.EVMOS], 18, 'EMO', 'EvmoSwap'),
  [ChainId.EVMOS_TESTNET]: new Token(
    ChainId.EVMOS_TESTNET,
    SUSHI_ADDRESS[ChainId.EVMOS_TESTNET],
    18,
    'EMO',
    'EvmoSwap'
  ),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, SUSHI_ADDRESS[ChainId.BSC_TESTNET], 18, 'EMO', 'EvmoSwap'),
}

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
  // [ChainId.ARBITRUM_TESTNET]: new Token(
  //   ChainId.ARBITRUM_TESTNET,
  //   '0x4A5e4A42dC430f669086b417AADf2B128beFEfac',
  //   18,
  //   'WETH9',
  //   'Wrapped Ether'
  // ),
  // [ChainId.ARBITRUM]: new Token(
  //   ChainId.ARBITRUM,
  //   '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  //   18,
  //   'WETH',
  //   'Wrapped Ether'
  // ),
  // [ChainId.FANTOM]: new Token(
  //   ChainId.FANTOM,
  //   '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  //   18,
  //   'WFTM',
  //   'Wrapped Fantom'
  // ),
}

// ifo tokens list
export const BETA: ChainTokenMap = {
  [ChainId.EVMOS]: new Token(ChainId.EVMOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', 6, 'USDC', 'USD Coin'),
  [ChainId.EVMOS_TESTNET]: new Token(
    ChainId.EVMOS_TESTNET,
    '0xd63EAab556d1177F5C1a149E4aB0aD78fF627E1B',
    18,
    'BETA',
    'IFO BETA MOCK'
  ),
}
