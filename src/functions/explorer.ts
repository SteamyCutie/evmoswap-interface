import { ChainId } from '@evmoswap/core-sdk'

const explorers = {
  etherscan: (link: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    switch (type) {
      case 'transaction':
        return `${link}/tx/${data}`
      default:
        return `${link}/${type}/${data}`
    }
  },

  blockscout: (link: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    switch (type) {
      case 'transaction':
        return `${link}/tx/${data}`
      case 'token':
        return `${link}/tokens/${data}`
      default:
        return `${link}/${type}/${data}`
    }
  },
}

interface ChainObject {
  [chainId: number]: {
    link: string
    builder: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => string
  }
}

const chains: ChainObject = {
  [ChainId.ETHEREUM]: {
    link: 'https://etherscan.io',
    builder: explorers.etherscan,
  },
  [ChainId.BSC_TESTNET]: {
    link: 'https://testnet.bscscan.com',
    builder: explorers.etherscan,
  },

  [ChainId.EVMOS]: {
    link: 'https://evm.evmos.org',
    builder: explorers.blockscout,
  },
  [ChainId.EVMOS_TESTNET]: {
    link: 'https://evm.evmos.dev',
    builder: explorers.blockscout,
  },
}

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const chain = chains[chainId]
  return chain.builder(chain.link, data, type)
}
