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
}

export const airdrops: Airdrop[] = [
    {
        title: 'Test',
        amount: '30000000000',
        description: 'Demo',
        address: {
            [ ChainId.BSC_TESTNET ]: '0x3b98d9C3De2D00575deF7a138040f99c13E5064C',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/test-chunks'
    },
    {
        title: 'Early Supporter Airdrop Phase 1',
        amount: '30000000000',
        description: 'Incentivize early supporters and community OG',
        address: {
            [ ChainId.BSC_TESTNET ]: '0x061963714CAb43Cc848DA10aC3e9b7dB176db31d',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/EarlySupporterPhase1'
    },
    {
        title: 'Early Supporter Airdrop Phase 2',
        amount: '30000000000',
        description: 'Incentivize early supporters and community OG',
        address: {
            [ ChainId.BSC_TESTNET ]: '0x1dB5ba6Ae741EE9b93CD4686A0716AB049aAE961',
        },
        type: AirdropType.ONCE,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/EarlySupporterPhase2'
    },
    {
        title: 'IEO Participants Airdrop 80% (Linear release in 30 Day)',
        amount: '30000000000',
        description: 'Incentivize IEO Participants',
        address: {
            [ ChainId.BSC_TESTNET ]: '0x174a470dC6c27E97a1653d48C20539f0dF07445B',
        },
        type: AirdropType.LINEAR,
        mappingSource: 'https://raw.githubusercontent.com/evmoswap/mrkl-drop-data-chunks/main/chunks/IEOParticipants80perc'
    },
]