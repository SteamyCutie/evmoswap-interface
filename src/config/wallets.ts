import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId } from '@evmoswap/core-sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '../entities/connectors/NetworkConnector'

export const RPC = {
  [ChainId.EVMOS]: 'https://eth.bd.evmos.org:8545',
  // [ChainId.EVMOS]: 'https://evmos-mainnet.gateway.pokt.network/v1/lb/62c4395e578dfa0039949cfa',
  [ChainId.EVMOS_TESTNET]: 'https://eth.bd.evmos.dev:8545',
  [ChainId.ETHEREUM]: 'https://mainnet.infura.io/v3/6120c21d46cb482d9cdabe463da74dd5',
  [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
  [ChainId.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545',
}

export const network = new NetworkConnector({
  defaultChainId: 9001,
  urls: RPC,
})

// const supportedChainIds = Object.values(ChainId) as number[]

export const injected = new InjectedConnector({
  supportedChainIds: [
    // 1, // mainnet
    // 3, // ropsten
    97, // bsc testnet
    9000, // evmos
    9001, // evmos testnet
  ],
})

export const bridgeInjected = new InjectedConnector({
  supportedChainIds: [
    1, // mainnet
    56, // binance smart chain
  ],
})

export interface WalletInfo {
  connector?: (() => Promise<AbstractConnector>) | AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'injected.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },

  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },

  // WALLET_CONNECT: {
  //   connector: async () => {
  //     const WalletConnectConnector = (await import('@web3-react/walletconnect-connector')).WalletConnectConnector
  //     return new WalletConnectConnector({
  //       rpc: RPC,
  //       bridge: 'https://bridge.walletconnect.org',
  //       qrcode: true,
  //       supportedChainIds,
  //       // pollingInterval: 15000,
  //     })
  //   },
  //   name: 'WalletConnect',
  //   iconName: 'wallet-connect.svg',
  //   description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
  //   href: null,
  //   color: '#4196FC',
  //   mobile: true,
  // },

  // KEYSTONE: {
  //   connector: async () => {
  //     const KeystoneConnector = (await import('@keystonehq/keystone-connector')).KeystoneConnector
  //     return new KeystoneConnector({
  //       chainId: 1,
  //       url: RPC[ChainId.ETHEREUM],
  //     })
  //   },
  //   name: 'Keystone',
  //   iconName: 'keystone.png',
  //   description: 'Connect to Keystone hardware wallet.',
  //   href: null,
  //   color: '#4196FC',
  //   mobile: true,
  // },
  // LATTICE: {
  //   connector: async () => {
  //     const LatticeConnector = (await import('@web3-react/lattice-connector')).LatticeConnector
  //     return new LatticeConnector({
  //       chainId: 1,
  //       url: RPC[ChainId.ETHEREUM],
  //       appName: 'EvmoSwap',
  //     })
  //   },
  //   name: 'Lattice',
  //   iconName: 'lattice.png',
  //   description: 'Connect to GridPlus Wallet.',
  //   href: null,
  //   color: '#40a9ff',
  //   mobile: true,
  // },
  // WALLET_LINK: {
  //   connector: async () => {
  //     const WalletLinkConnector = (await import('@web3-react/walletlink-connector')).WalletLinkConnector
  //     return new WalletLinkConnector({
  //       url: RPC[ChainId.ETHEREUM],
  //       appName: 'EvmoSwap',
  //       appLogoUrl: 'https://raw.githubusercontent.com/sushiswap/art/master/sushi/logo-256x256.png',
  //     })
  //   },
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbase.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5',
  // },
  // COINBASE_LINK: {
  //   name: 'Open in Coinbase Wallet',
  //   iconName: 'coinbase.svg',
  //   description: 'Open in Coinbase Wallet app.',
  //   href: 'https://go.cb-w.com',
  //   color: '#315CF5',
  //   mobile: true,
  //   mobileOnly: true,
  // },
  // FORTMATIC: {
  //   connector: async () => {
  //     const FortmaticConnector = (await import('@web3-react/fortmatic-connector')).FortmaticConnector
  //     return new FortmaticConnector({
  //       apiKey: process.env.NEXT_PUBLIC_FORTMATIC_API_KEY ?? '',
  //       chainId: 1,
  //     })
  //   },
  //   name: 'Fortmatic',
  //   iconName: 'fortmatic.png',
  //   description: 'Login using Fortmatic hosted wallet',
  //   href: null,
  //   color: '#6748FF',
  //   mobile: true,
  // },
  // Portis: {
  //   connector: async () => {
  //     const PortisConnector = (await import('@web3-react/portis-connector')).PortisConnector
  //     return new PortisConnector({
  //       dAppId: process.env.NEXT_PUBLIC_PORTIS_ID ?? '',
  //       networks: [1],
  //     })
  //   },
  //   name: 'Portis',
  //   iconName: 'portis.png',
  //   description: 'Login using Portis hosted wallet',
  //   href: null,
  //   color: '#4A6C9B',
  //   mobile: true,
  // },
  // Torus: {
  //   connector: async () => {
  //     const TorusConnector = (await import('@web3-react/torus-connector')).TorusConnector
  //     return new TorusConnector({
  //       chainId: 1,
  //     })
  //   },
  //   name: 'Torus',
  //   iconName: 'torus.png',
  //   description: 'Login using Torus hosted wallet',
  //   href: null,
  //   color: '#315CF5',
  //   mobile: true,
  // },
  // Binance: {
  //   connector: async () => {
  //     const BscConnector = (await import('@binance-chain/bsc-connector')).BscConnector
  //     return new BscConnector({
  //       supportedChainIds: [56],
  //     })
  //   },
  //   name: 'Binance',
  //   iconName: 'bsc.jpg',
  //   description: 'Login using Binance hosted wallet',
  //   href: null,
  //   color: '#F0B90B',
  //   mobile: true,
  // },
  // Clover: {
  //   connector: async () => {
  //     const CloverConnector = (await import('@clover-network/clover-connector')).CloverConnector
  //     return new CloverConnector({
  //       supportedChainIds: [1],
  //     })
  //   },
  //   name: 'Clover',
  //   iconName: 'clover.svg',
  //   description: 'Login using Clover hosted wallet',
  //   href: null,
  //   color: '#269964',
  // },
}
