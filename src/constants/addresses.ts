import { ChainId } from '@evmoswap/core-sdk'

type AddressMap = { [ chainId: number ]: string }

// masterChef
export const MASTERCHEF_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xA0892A8072Be204a07C753439b1E0975D8Ba3788',
    [ ChainId.EVMOS_TESTNET ]: '0x6fb5d26b6f9882de153b148b31A2540B63941AE4',

    [ ChainId.BSC_TESTNET ]: '0xD3930575cf356f5cba89DD7Cdb06668e6C00F4a9',
}

// boost
export const VOTING_ESCROW_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xf1EB231b036c17E7E04e8FECF67561e0e5f927c4',
    [ ChainId.EVMOS_TESTNET ]: '0xAcd14EACA93311cDc7F40e3de8E9DcC9b2F93c6F',

    [ ChainId.BSC_TESTNET ]: '0x371F03EfC2c8EcC94e4B230425719e330879A7BD',
}

export const REWARD_POOL_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xdeeDEeeD1127A36D684514BA421Cc54d19e52608',
    [ ChainId.EVMOS_TESTNET ]: '0x7C2d588532f106B97a248961dC617ec6F0861419',

    [ ChainId.BSC_TESTNET ]: '0xC5fC6cC99f0Ca15c2E4778BF2b070baBe3327868',
}

// multistaking
export const MULTI_FEE_DISTRIBUTION_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0x48b143bDA816Be2CE79aBa88F2A9fCCd539065E5',
    [ ChainId.EVMOS_TESTNET ]: '0x5E8EaBaC43d5B04fbBdc8Fa8c23EE6119f4176a2',

    [ ChainId.BSC_TESTNET ]: '0xAd959ccc60e84df3F5A7Bd03Cad7868f57C8aE02',
}

export const FEE_DISTRIBUTOR_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0x4F5631Cb03Ed66096346f273A9a2014A5A882162',
    [ ChainId.EVMOS_TESTNET ]: '0xB14452a1B326CcDe4dd843963E553af0d74903Fe',

    [ ChainId.BSC_TESTNET ]: '0xAc9127d883a03CB0B082D9753c1441210f59b89D',
}

export const GEMO_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x1B07efe61701770440d395e2666B91392e6B4A04',
    [ ChainId.EVMOS_TESTNET ]: '',
    [ ChainId.BSC_TESTNET ]: '0xA75C39e6e439E489Cc583b9715193a47382C07Ad',
}

export const TREASURY_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x24cd6322F3139E146dAC0eea105EB58b3526A299',
    [ ChainId.EVMOS_TESTNET ]: '',
    [ ChainId.BSC_TESTNET ]: '0x0829D857Ec0c07fD9F7EbE7503b0bdbfE0e3d66F',
}

export const DASHBOARD_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xFCB6C22F7EDCAB6c049881b8F3a7ce928Cf94B41',
    [ ChainId.EVMOS_TESTNET ]: '0xC205dfE6eCa100eb65020739B22CBD119fCFff6C',

    [ ChainId.BSC_TESTNET ]: '0x790E5EE47ff3AEF2B906155e39CE5C16390e1E0B',
}

export const PRIVATE_SALE_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x2F76Fbf8db43A7Ec93d7315b94F847ddB09137f0',
    [ ChainId.EVMOS_TESTNET ]: '0x64108b11bcBC8342517343e992F7b3177d995804',
    [ ChainId.BSC_TESTNET ]: '0xed067E8C04FdED383075830c744BEA4a4EF65e30',
}

export const FAUCET_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '',
    [ ChainId.EVMOS_TESTNET ]: '0xAb463BE738e3a5DBc8D8986747459f17e22202c1',

    [ ChainId.BSC_TESTNET ]: '0x6693c3381ab0F11B7a6F878720B466A64a2d1d32',
}

// unused contracts /////////////////// will be removed
export const EMOSVAULT_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xDf3EBc46F283eF9bdD149Bb24c9b201a70d59389',
    [ ChainId.EVMOS_TESTNET ]: '0xEC2c9b42d56588654d2626F13D8F4FFd30fdf199',

    [ ChainId.BSC_TESTNET ]: '0x88Ec8078E4468adE096BD097A352FEc90079ad1B',
}

// Seed / Private / Public Sale
export const SEED_SALE_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x94f3Dfc9E8AE00892984d8fA003BF09a46987DFd',
    [ ChainId.EVMOS_TESTNET ]: '',
}

export const PUBLIC_SALE_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x941a3703E106707668f38E779c7984383638173e',
    [ ChainId.EVMOS_TESTNET ]: '',
}

export const VOTE_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x2Cb151D71D5EE6FD5a805a8614803e0e48e67c3B',
    [ ChainId.BSC_TESTNET ]: '0x6a8c1ba309136D78245f1F0a14790239b71a9577',
}

export const ZAP_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xe7CD641c86B6F2Ccf63b95B9b2951beb5fe567e9',
    [ ChainId.EVMOS_TESTNET ]: '',
    [ ChainId.BSC_TESTNET ]: '0xF4E667173f6983A81fABFAf8d71e6078F261E596',
}

export const PRIVATESALE_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0xf3CAb862A2f696fa493db85749736411635fA273',
}

export const EVMOROLL_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E',
}

export const MIGRATE_DASHBOARD_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0xB8819bA56c81b81181e5F662309b7bf4a9bDCD12',
}
export const EVMOSWAP_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0x6493F1BfE563A09485A3888617EDAf62f8A43dF0',
}

export const EVMOMETASWAP_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0x7f7d0E9c89f81849929EB024757F28f0b30f8628',
}

export const EVMOMETASWAP_DEPOSIT_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0xC2273621F3750dB0E6b4D8F66AF8B270E07Aa034',
}
