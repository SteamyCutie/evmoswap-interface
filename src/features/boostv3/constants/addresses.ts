import { ChainId } from '@evmoswap/core-sdk'

//@TODO: export from parent constant and import here.
type AddressMap = { [chainId: number]: string }

// multistaking
export const MULTI_FEE_DISTRIBUTION_ADDRESSES: AddressMap = {
  [ChainId.EVMOS]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
  [ChainId.EVMOS_TESTNET]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
  [ChainId.BSC_TESTNET]: '0xD2539Fd39205e4F1e4BaAc3899B0Bd06db8965Dc',
}

export const FEE_DISTRIBUTOR_ADDRESSES: AddressMap = {
  [ChainId.EVMOS]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
  [ChainId.EVMOS_TESTNET]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
  [ChainId.BSC_TESTNET]: '0xD2539Fd39205e4F1e4BaAc3899B0Bd06db8965Dc',
}
