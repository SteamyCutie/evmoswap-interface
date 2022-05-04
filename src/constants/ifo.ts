import { ChainId, SUSHI, Token } from '@evmoswap/core-sdk'
import { Ifo } from './types'
import { USDC } from './../config/tokens'

// UPCOMING - 0xD1e0Da69F2Ee9B7d3602DB9F41F37beE2d99F176
// LIVE - 0x37B9227d8154870481171C4C910884e82903992f
// FINISH -
const ifos: Ifo[] = [
  {
    id: 'mpad',
    address: {
      [ChainId.EVMOS]: '0xA5F673915F10276999Ab24266bF5E0846344962b',
      [ChainId.EVMOS_TESTNET]: '0xBad35c158a3955f7aFF8c36960e24E6Bf44E3cFc', 
      [ChainId.BSC_TESTNET]: '0xE84021fDC03FA9AF863B657F451c86FbA04118b3'
    },
    isActive: true,
    name: 'EMO',
    poolBasic: {
      saleAmount: '4,500,000',
      raiseAmount: '$450,000',
      emoToBurn: '$0.00',
      distributionRatio: 1,
      raiseToken: USDC,
    },
    poolUnlimited: {
      saleAmount: '1',
      raiseAmount: '$1.00',
      emoToBurn: '$0.00',
      distributionRatio: 0,
      raiseToken: USDC,
    },
    offerToken: {
      [ChainId.EVMOS]: new Token(ChainId.EVMOS, '0x181C262b973B22C307C646a67f64B76410D19b6B', 18, 'EMO', 'EvmoSwap Token'),
      [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, '0x15a2E30D2Dfd13a5DEeBdF31d19d73B7494E45e8', 18, 'MPAD', 'LaunchPad Mock'),
      [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, '0x2fe5d73edC7BA958CaF7eA1bDb700Ac9821e136d', 18, 'MPAD', 'LaunchPad Mock'),
    },
    releaseTimestamp: 1646922000,
    claimDelayTime: 10800, //delay 3 hours
    veEmoCheckPoint: 1646813700, //start time
    campaignId: '511160000',
    twitterUrl: 'https://twitter.com/evmoswap',
    telegramUrl: 'https://t.me/evmoswap',
    discordUrl: 'https://discord.gg/cEp53UXPw3',
    articleUrl: 'https://docs.evmoswap.org',
    description:
      'EvmoSwap is a Decentralized Autonomous Organization (DAO) that offers a full suite of tools to explore and engage with decentralized finance opportunities.',
    tokenOfferingPrice: 0.1,
    version: 2,
  },
]

export default ifos
