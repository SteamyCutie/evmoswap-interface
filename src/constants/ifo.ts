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
      [ChainId.EVMOS_TESTNET]: '0x0cA9e6C79b6D58E77096f7bcDfB293F4f481bBAD', 
      [ChainId.BSC_TESTNET]: '0xf54FCaE9BA52ffd00a3A7A6077Fdfa9BEe802859'
    },
    isActive: true,
    name: 'EMO',
    poolBasic: {
      saleAmount: '4,500,000',
      raiseAmount: '$450,000',
      emoToBurn: '$0.00',
      distributionRatio: 0.99,
      raiseToken: USDC,
    },
    poolUnlimited: {
      saleAmount: '1',
      raiseAmount: '$1.00',
      emoToBurn: '$0.00',
      distributionRatio: 0.01,
      raiseToken: USDC,
    },
    offerToken: {
      [ChainId.EVMOS]: new Token(ChainId.EVMOS, '0x181C262b973B22C307C646a67f64B76410D19b6B', 18, 'EMO', 'EvmoSwap Token'),
      [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, '0xA45Ce92c009248372dFfe9177c705a1F9561Beaf', 18, 'MPAD', 'LaunchPad Mock'),
      [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, '0x3094A01FC000a38c1996fE6c17E92AADa0e585A5', 18, 'MPAD', 'LaunchPad Mock'),
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
