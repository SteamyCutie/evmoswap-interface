import { ChainId } from '@evmoswap/core-sdk'
import LPToken from 'app/features/migration/LPToken'

type AddressMap = { [ chainId: number ]: string }

// * this is the new contract addresses
// reusing "VotingEscrow" at 0x6cA9DeE59FF631a9eE434eC16084F4a296f3e1ff
// reusing "FeeDistributor" at 0xEb048e4955e22F78F111143208175D461dfe9731
// reusing "MultiFeeDistribution" at 0xfa77099e581Ae71C838E75f0f19D166157943b99
// reusing "MasterChef" at 0xf77CBdeaF930Bec07A794bCABede5eAF7818DAaA
// reusing "RewardPool" at 0xeA0a0e1aB5Be3679b1C50656DbF0925E7b4DfaA0
// reusing "Dashboard" at 0x48322B7dd8F6E50af6aDDD3cb3001e042bDb8B3B

// masterChef
export const MASTERCHEF_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x96DbaF70d53C5214Bf1981B1671c58D2F5D38d9a',
    [ ChainId.EVMOS_TESTNET ]: '0x32233333229aAd6f58807eAeb34616F0D2C5808F',

    [ ChainId.BSC_TESTNET ]: '0xD3930575cf356f5cba89DD7Cdb06668e6C00F4a9',
}

// boost
export const VOTING_ESCROW_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xADBDFf69C49a794cbe7B26164573FBB0F3d53b16',
    [ ChainId.EVMOS_TESTNET ]: '0xFF8ebFbA27E35c34923784DF0669aB727394A2b7',

    [ ChainId.BSC_TESTNET ]: '0x371F03EfC2c8EcC94e4B230425719e330879A7BD',
}

export const REWARD_POOL_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xD01e70333f6308620C4A4B6CcB85Ff50c63a299c',
    [ ChainId.EVMOS_TESTNET ]: '0xAfE13a77f7e8fA5f932F19fc775E5431815464a5',

    [ ChainId.BSC_TESTNET ]: '0xC5fC6cC99f0Ca15c2E4778BF2b070baBe3327868',
}

// multistaking
export const MULTI_FEE_DISTRIBUTION_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0xb5bD2166F9eB0D164EDCE298F5f86b4c97A55D76',
    [ ChainId.EVMOS_TESTNET ]: '0x184d100d1CbcC3A85A98BA9d17946E38953990B5',

    [ ChainId.BSC_TESTNET ]: '0xAd959ccc60e84df3F5A7Bd03Cad7868f57C8aE02',
}

export const FEE_DISTRIBUTOR_ADDRESSES: AddressMap = {
    [ ChainId.EVMOS ]: '0x9426C4005243a9bAAf5e68f5f8F2A7B76966E940',
    [ ChainId.EVMOS_TESTNET ]: '0x6ceF1AF75fbB1F86240e219b6449193d8C7B5b0A',

    [ ChainId.BSC_TESTNET ]: '0xAc9127d883a03CB0B082D9753c1441210f59b89D',
}

export const GEMO_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x1B07efe61701770440d395e2666B91392e6B4A04',
    [ ChainId.EVMOS_TESTNET ]: '0xa002D878aaf42b2D7370eB7A371091162328D6e5',

    [ ChainId.BSC_TESTNET ]: '0xA75C39e6e439E489Cc583b9715193a47382C07Ad',
}

export const TREASURY_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x24cd6322F3139E146dAC0eea105EB58b3526A299',
    [ ChainId.EVMOS_TESTNET ]: '0x4de1B99a508c3569C47807bb3e6C7fb41D4F2a50',

    [ ChainId.BSC_TESTNET ]: '0x0829D857Ec0c07fD9F7EbE7503b0bdbfE0e3d66F',
}

export const DASHBOARD_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0x7F18D0d34C63b1690f9b11E37F9b1f246ea5A75e',
    [ ChainId.EVMOS_TESTNET ]: '0xe2D1B5C7576A9691aD7c6c1F988557681B04B9Ae',

    [ ChainId.BSC_TESTNET ]: '0x790E5EE47ff3AEF2B906155e39CE5C16390e1E0B',
}

// stable coin pool
export const EVMOSWAP_ADDRESS: AddressMap = {
    [ ChainId.EVMOS ]: '0xf0a5b0fa1531C94754241911A2E6D94506336321',
    [ ChainId.EVMOS_TESTNET ]: '0x4d15569cDB9fD14687d5cf6FcE628f2792CD2Ea7',

    [ ChainId.BSC_TESTNET ]: '0x6493F1BfE563A09485A3888617EDAf62f8A43dF0',
}

// private sale
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

type AddressMapRoll = {

    [ chainId: number ]: {
        [ dexName in LPToken[ 'dex' ] ]?: string
    }
}

export const EVMOROLL_ADDRESS: AddressMapRoll = {
    [ ChainId.BSC_TESTNET ]: {
        diffusion: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E',
        cronus: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E'
    },

    [ ChainId.EVMOS ]: {
        diffusion: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E',
        cronus: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E'
    },

    [ ChainId.EVMOS_TESTNET ]: {
        diffusion: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E',
        cronus: '0x9A87b976Cc1b95465C1FB91D1Fc23ac342B2030E'
    },
}

export const MIGRATE_DASHBOARD_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0xB8819bA56c81b81181e5F662309b7bf4a9bDCD12',
}

export const EVMOMETASWAP_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0x7f7d0E9c89f81849929EB024757F28f0b30f8628',
}

export const EVMOMETASWAP_DEPOSIT_ADDRESS: AddressMap = {
    [ ChainId.BSC_TESTNET ]: '0xC2273621F3750dB0E6b4D8F66AF8B270E07Aa034',
}