import { ChainId } from '@evmoswap/core-sdk'

//@TODO: export from parent constant and import here.
type AddressMap = { [ chainId: number ]: string }

// multistaking
export const MULTISTAKING_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
    [ ChainId.EVMOS_TESTNET ]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
    [ ChainId.BSC_TESTNET ]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
}
