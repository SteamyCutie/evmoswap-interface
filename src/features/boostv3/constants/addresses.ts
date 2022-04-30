import { ChainId } from '@evmoswap/core-sdk'

//@TODO: export from parent constant and import here.
type AddressMap = { [ chainId: number ]: string }

// multistaking
export const MULTI_FEE_DISTRIBUTION_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0x7F6A2ece9346DabD227A76Eb23376b07Dc982A64',
    [ ChainId.EVMOS_TESTNET ]: '0x45511d5748fC9C54c833Aa435cfDc1538bf28e35',
    [ ChainId.BSC_TESTNET ]: '0xD2539Fd39205e4F1e4BaAc3899B0Bd06db8965Dc',
}

export const FEE_DISTRIBUTOR_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0x71a6A15b9e8420196075A8a3f308Bc674Bc911FA',
    [ ChainId.EVMOS_TESTNET ]: '0x12E31C52d1036D88f359D73d0317B6F56c9b3e5F',
    [ ChainId.BSC_TESTNET ]: '0x14B08eD3124D9de98aFDFFAED43852360713cAdE',
}
