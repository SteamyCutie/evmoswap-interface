import { ChainId } from '@evmoswap/core-sdk'

const Mainnet = 'https://raw.githubusercontent.com/sushiswap/icons/master/network/mainnet.jpg'
const Evmos = 'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/icons/network/evmos.png'
const Binance = 'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/icons/network/bsc.svg'
const EvmosTestnet =
  'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/icons/network/evmos-testnet.png'

export const NETWORK_ICON = {
  [ChainId.ETHEREUM]: Mainnet,
  [ChainId.BSC]: Binance,
  [ChainId.BSC_TESTNET]: Binance,
  [ChainId.EVMOS]: Evmos,
  [ChainId.EVMOS_TESTNET]: EvmosTestnet,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.BSC]: 'Binance',
  [ChainId.BSC_TESTNET]: 'BSC Testnet',
  [ChainId.EVMOS]: 'Evmos',
  [ChainId.EVMOS_TESTNET]: 'Evmos Testnet',
}
