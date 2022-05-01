import { ChainId } from '@evmoswap/core-sdk'

export enum Feature {
  AMM = 'AMM',
  YIELD = 'Yield',
  FARMV2 = 'Farm V2',
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
  FAUCET = 'faucet',
  PRISALE = 'prisale',
}

const features = {
  [ChainId.ETHEREUM]: [Feature.AMM],

  [ChainId.EVMOS]: [
    Feature.AMM,
    // Feature.YIELD,
    // Feature.FARMV2,
    // Feature.ZAP,
    // // Feature.MIGRATE,
    // // Feature.ANALYTICS,
    // Feature.IFO,
    // Feature.STAKING,
    Feature.BRIDGE,
    // Feature.BOOST,
    // Feature.GAMEFI,
    // Feature.PRISALE,
  ],

  [ChainId.EVMOS_TESTNET]: [
    Feature.AMM,
    Feature.YIELD,
    // Feature.FARMV2,
    // Feature.ZAP,
    // Feature.LENDING,
    // Feature.IFO,
    // Feature.STAKING,
    // Feature.BOOST,
    // Feature.FAUCET,
    Feature.PRISALE,
  ],

  [ChainId.BSC_TESTNET]: [
    Feature.AMM,
    Feature.YIELD,
    // Feature.FARMV2,
    // Feature.ZAP,
    // // Feature.LENDING,
    // Feature.IFO,
    // Feature.STAKING,
    // Feature.BOOST,
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
