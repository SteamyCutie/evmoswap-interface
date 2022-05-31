import { ChainId } from "@evmoswap/core-sdk"

export enum AirdropType {
    ONCE,
    LINEAR
}

export type Airdrop = {
    title: string
    amount: string
    description: string
    address: { [ chainId: number ]: string }
    type: AirdropType
    mappingSource: string
    startStatus?: boolean
}

export const airdrops: Airdrop[] = [
    {
        title: 'IEO Participants Airdrop 20%',
        amount: '30000',
        description: 'Incentivize IEO Participants',
        address: {
            [ ChainId.EVMOS ]: '0x3ef94B7094d52ec6F9aacf60E470Cd9c0540d0F8',
            [ ChainId.BSC_TESTNET ]: '0x1dB5ba6Ae741EE9b93CD4686A0716AB049aAE961',
        },
        type: AirdropType.ONCE,
        startStatus: true,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/IEOParticipants20perc'
    },
    {
        title: 'IEO Participants Airdrop 80%',
        amount: '120000',
        description: 'Incentivize IEO Participants (Linear release in 30 Day)',
        address: {
            [ ChainId.EVMOS ]: '0xD42D7bA1256f41F868D866347D92aD218633DA7e',
            [ ChainId.BSC_TESTNET ]: '0x174a470dC6c27E97a1653d48C20539f0dF07445B',
        },
        type: AirdropType.LINEAR,
        startStatus: true,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/IEOParticipants80perc'
    },
    {
        title: 'Early Supporter Airdrop Phase 1',
        amount: '300000',
        description: 'Incentivize early supporters and community OG',
        address: {
            [ ChainId.EVMOS ]: '0x07b24b8424fCfB767fB100779cD2b44DC7Dc6190',
            [ ChainId.BSC_TESTNET ]: '0x061963714CAb43Cc848DA10aC3e9b7dB176db31d',
        },
        type: AirdropType.ONCE,
        startStatus: true,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/EarlySupporterPhase1'
    },
    {
        title: 'Testnet Winner Airdrop Phase 1',
        amount: '150000',
        description: 'Incentivize Testnet Winner',
        address: {
            [ ChainId.EVMOS ]: '0x38Fc97b864Ce599f4096B1C0DD811597a3d38C62',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/TestnetWinnerPhase1'
    },
    {
        title: 'Early Supporter Airdrop Phase 2',
        amount: '300000',
        description: 'Incentivize early supporters and community OG',
        address: {
            [ ChainId.EVMOS ]: '0xEc4f2B5408C964D6dC234255B67d5a0796F969c6',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/EarlySupporterPhase2'
    },
    {
        title: 'Testnet Winner Airdrop Phase 2',
        amount: '150000',
        description: 'Incentivize Testnet Winner',
        address: {
            [ ChainId.EVMOS ]: '0x8D2E9C105aC9eA49c092512039c7ACD2c6f43Dcf',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/TestnetWinnerPhase2'
    },
    {
        title: 'Early Supporter Airdrop Phase 3',
        amount: '400000',
        description: 'Incentivize early supporters and community OG',
        address: {
            [ ChainId.EVMOS ]: '0xb6B48151d41B23BA3BC14E72b09b79485476bae9',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/EarlySupporterPhase3'
    },
    {
        title: 'Testnet Winner Airdrop Phase 3',
        amount: '200000',
        description: 'Incentivize Testnet Winner',
        address: {
            [ ChainId.EVMOS ]: '0x4134aDd0B3BF56023F2F1A69dF5F53E104b5aB11',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/TestnetWinnerPhase3'
    },
]