import { AddressMap } from '@evmoswap/core-sdk'
import { ChainTokenMap } from 'app/config/tokens'

export enum PoolIds {
  poolBasic = 'poolBasic',
  poolUnlimited = 'poolUnlimited',
}

export type IfoStatus = 'idle' | 'coming_soon' | 'live' | 'finished'
interface IfoPoolInfo {
  saleAmount: string
  raiseAmount: string
  emosToBurn: string
  distributionRatio: number // Range [0-1]
  raiseToken: ChainTokenMap
}
export interface Ifo {
  id: string
  isActive: boolean
  address: AddressMap
  name: string
  // raiseToken: ChainTokenMap
  offerToken: ChainTokenMap
  releaseTimestamp: number
  claimDelayTime: number
  veEmosCheckPoint: number
  articleUrl: string
  campaignId: string
  tokenOfferingPrice: number
  description?: string
  twitterUrl?: string
  telegramUrl?: string
  discordUrl?: string
  version: number
  [PoolIds.poolBasic]?: IfoPoolInfo
  [PoolIds.poolUnlimited]: IfoPoolInfo
}
