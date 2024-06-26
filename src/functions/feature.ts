import { ChainId } from '@evmoswap/core-sdk'

export enum Feature {
  AMM = 'AMM',
  YIELD = 'Yield',
  GEMO = 'Gemo',
  LENDING = 'Lending',
  ANALYTICS = 'Analytics',
  MIGRATE = 'Migrate',
  STAKING = 'Staking',
  LAUNCH = 'Launch',
  BOOST = 'Boost',
  BRIDGE = 'Bridge',
  ZAP = 'Zap',
  IFO = 'Ifo',
  GAMEFI = 'GameFi',
  AIRDROP = 'AirDrop',
  FAUCET = 'faucet',
  PRISALE = 'prisale',
}

const features = {
  [ChainId.ETHEREUM]: [Feature.AMM],

  [ChainId.EVMOS]: [
    Feature.AMM,
    Feature.YIELD,
    // Feature.GEMO,
    // Feature.ZAP,
    // // Feature.MIGRATE,
    // // Feature.ANALYTICS,
    Feature.IFO,
    // Feature.STAKING,
    Feature.BRIDGE,
    Feature.BOOST,
    Feature.AIRDROP,
    Feature.PRISALE,
  ],

  [ChainId.EVMOS_TESTNET]: [
    Feature.AMM,
    Feature.YIELD,
    // Feature.GEMO,
    // Feature.ZAP,
    // Feature.LENDING,
    Feature.IFO,
    // Feature.STAKING,
    Feature.BOOST,
    // Feature.FAUCET,
    Feature.PRISALE,
  ],

  [ChainId.BSC_TESTNET]: [
    Feature.AMM,
    Feature.YIELD,
    Feature.GEMO,
    // Feature.ZAP,
    // Feature.LENDING,
    Feature.IFO,
    Feature.STAKING,
    Feature.BOOST,
    // Feature.GAMEFI,
    Feature.PRISALE,
  ],
}

export function featureEnabled(feature: Feature, chainId: ChainId): boolean {
  return features?.[chainId]?.includes(feature)
}

export function chainsWithFeature(feature: Feature): ChainId[] {
  return Object.keys(features)
    .filter((chain) => features[chain].includes(feature))
    .map((chain) => ChainId[chain])
}
