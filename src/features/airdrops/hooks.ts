import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { Token, CurrencyAmount, JSBI, Currency } from '@evmoswap/core-sdk'
import { EvmoSwap } from 'app/config/tokens'
import { Airdrop, AirdropType } from 'app/constants/airdrops'
import { calculateGasMargin } from 'app/functions'
import { useAirdropContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import {
    useSingleCallResult,
    useSingleContractMultipleMethods,
} from 'app/state/multicall/hooks'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useEffect, useMemo, useState } from 'react'

interface UserClaimData {
    index: number
    amount: string
    proof: string[]
    flags?: {
        isSOCKS: boolean
        isLP: boolean
        isUser: boolean
    }
}

type LastAddress = string
type ClaimAddressMapping = { [ firstAddress: string ]: LastAddress }
let FETCH_CLAIM_MAPPING_PROMISE: { [ key: string ]: Promise<ClaimAddressMapping> } | null = {}
function fetchClaimMapping ( base_path, key: string ): Promise<ClaimAddressMapping> {
    return (
        FETCH_CLAIM_MAPPING_PROMISE[ key ] ??
        ( FETCH_CLAIM_MAPPING_PROMISE[ key ] = fetch( `${base_path}/mapping.json` )
            .then( ( res ) => res.json() )
            .catch( ( error ) => {
                console.error( 'Failed to get claims mapping', error )
                FETCH_CLAIM_MAPPING_PROMISE = null
            } ) )
    )
}

const FETCH_CLAIM_FILE_PROMISES: { [ startingAddress: string ]: Promise<{ [ address: string ]: UserClaimData }> } = {}
function fetchClaimFile ( file_path: string, key: string ): Promise<{ [ address: string ]: UserClaimData }> {
    return (
        FETCH_CLAIM_FILE_PROMISES[ key ] ??
        ( FETCH_CLAIM_FILE_PROMISES[ key ] = fetch( `${file_path}` )
            .then( ( res ) => res.json() )
            .catch( ( error ) => {
                console.error( `Failed to get claim file mapping ${file_path}`, error )
                delete FETCH_CLAIM_FILE_PROMISES[ key ]
            } ) )
    )
}

const FETCH_CLAIM_PROMISES: { [ key: string ]: Promise<UserClaimData> } = {}
// returns the claim for the given address, or null if not valid. contract address is used as key
function fetchClaim ( base_path: string, account: string, address: string ): Promise<UserClaimData> {
    const formatted = getAddress( account )
    if ( !formatted || !address ) return Promise.reject( new Error( 'Invalid address' ) )

    const cacheKey = address.concat( account )

    return (
        FETCH_CLAIM_PROMISES[ cacheKey ] ??
        ( FETCH_CLAIM_PROMISES[ cacheKey ] = fetchClaimMapping( base_path, cacheKey )
            .then( ( mapping ) => {
                //console.log( "aramics", base_path, mapping )
                const sorted = Object.keys( mapping ).sort( ( a, b ) => ( a.toLowerCase() < b.toLowerCase() ? -1 : 1 ) )

                for ( const startingAddress of sorted ) {
                    const lastAddress = mapping[ startingAddress ]
                    if ( startingAddress.toLowerCase() <= formatted.toLowerCase() ) {
                        if ( formatted.toLowerCase() <= lastAddress.toLowerCase() ) {
                            return startingAddress
                        }
                    } else {
                        throw new Error( `Claim for ${formatted} was not found in partial search` )
                    }
                }
                throw new Error( `Claim for ${formatted} was not found after searching all mappings` )
            } )
            .then( ( key ) => fetchClaimFile( `${base_path}/${key}.json`, cacheKey.concat( key ) ) )
            .then( ( result ) => {
                if ( result[ formatted ] ) return result[ formatted ]
                throw new Error( `Claim for ${formatted} was not found in claim file!` )
            } )
            .catch( ( error ) => {
                console.debug( 'Claim fetch failed', error )
                throw error
            } ) )
    )
}

// parse distributorContract blob and detect if user has claim data
// null means we know it does not
export function useUserClaimData (
    airdrop: Airdrop | undefined,
    account: string | null | undefined
): UserClaimData | null {
    const { chainId } = useActiveWeb3React()

    const [ claimInfo, setClaimInfo ] = useState<{ [ account: string ]: UserClaimData | null }>( {} )
    const address = airdrop.address[ chainId ]

    useEffect( () => {
        if ( !account || !airdrop || !address ) return

        fetchClaim( airdrop.mappingSource, account, address )
            .then( ( accountClaimInfo ) =>
                setClaimInfo( ( claimInfo ) => {
                    return {
                        ...claimInfo,
                        [ address ]: accountClaimInfo,
                    }
                } )
            )
            .catch( ( e ) => {
                console.debug( e )
                setClaimInfo( ( claimInfo ) => {
                    return {
                        ...claimInfo,
                        [ address ]: null,
                    }
                } )
            } )
    }, [ airdrop, account, address ] )

    return account ? claimInfo[ address ] : null
}

// check if user is in blob and has not yet claimed EMO
export function useUserHasAvailableClaim ( airdrop: Airdrop | undefined, account: string | null | undefined ): boolean {
    const isLinear = airdrop.type === AirdropType.LINEAR

    const { chainId } = useActiveWeb3React()
    const userClaimData = useUserClaimData( airdrop, account )
    const contract = useAirdropContract( airdrop.address[ chainId ], isLinear )

    const isClaimedResult = useSingleCallResult( contract, isLinear ? 'isCollected' : 'isClaimed', [ userClaimData?.index ] )
    // user is in blob and contract marks as unclaimed
    return Boolean( userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[ 0 ] === false )
}

export function useUserUnclaimedAmount (
    userClaimData: UserClaimData,
    canClaim: boolean,
    strict: boolean = true,
): CurrencyAmount<Token> | undefined {

    const { chainId } = useActiveWeb3React()
    const emo = chainId ? EvmoSwap[ chainId ] : undefined
    if ( !emo ) return undefined
    if ( !userClaimData || ( strict && !canClaim ) ) {
        return CurrencyAmount.fromRawAmount( emo, JSBI.BigInt( 0 ) )
    }
    return CurrencyAmount.fromRawAmount( emo, JSBI.BigInt( userClaimData.amount ) )
}

//return details for vest linear airdrops
export function useUserCollectData ( airdrop: Airdrop ): {
    collectedAmount: CurrencyAmount<Currency> | undefined
    collectedTime: any
    claimedAmount: CurrencyAmount<Currency> | undefined
    releaseDuration: any
    vestClaimable: CurrencyAmount<Currency> | undefined
} {

    const isLinear = airdrop.type === AirdropType.LINEAR
    const { account, chainId } = useActiveWeb3React()
    const contract = useAirdropContract( isLinear ? airdrop.address[ chainId ] : undefined, isLinear )
    const callsData = useMemo(
        () => [
            { methodName: 'collectedAmount', callInputs: [ account ] },
            { methodName: 'collectedTime', callInputs: [ account ] },
            { methodName: 'claimedAmount', callInputs: [ account ] },
            { methodName: 'releaseDuration', callInputs: [] },
            { methodName: 'vestClaimable', callInputs: [ account ] }, // user locked info
        ],
        [ account ]
    )

    let resp = {
        collectedAmount: undefined,
        collectedTime: undefined,
        claimedAmount: undefined,
        releaseDuration: undefined,
        vestClaimable: undefined,
    }

    const results = useSingleContractMultipleMethods( contract, callsData )
    const emo = chainId ? EvmoSwap[ chainId ] : undefined

    if ( !results || !emo ) return resp;

    // lockAmount, lockEnd, veEmos, emosSupply, veEmosSupply
    if ( results && Array.isArray( results ) && results.length === callsData.length ) {
        const [
            { result: collectedAmount },
            { result: collectedTime },
            { result: claimedAmount },
            { result: releaseDuration },
            { result: vestClaimable },
        ] = results

        resp = {
            collectedAmount: CurrencyAmount.fromRawAmount( emo, collectedAmount?.[ 0 ] ?? '0' ),
            collectedTime: collectedTime?.[ 0 ],
            claimedAmount: CurrencyAmount.fromRawAmount( emo, claimedAmount?.[ 0 ] ?? '0' ),
            releaseDuration: releaseDuration?.[ 0 ],
            vestClaimable: CurrencyAmount.fromRawAmount( emo, vestClaimable?.[ 0 ] ?? '0' )
        }
    }

    return resp
}



export function useAirdrop (
    airdrop: Airdrop | undefined,
): {
    callbacks: { claimCallback: () => Promise<any>; collectCallback: () => Promise<any>; vestClaim: () => Promise<any> };
    canClaim: boolean;
    canCollect: boolean;
    claimData: UserClaimData;
    collectData: { collectedAmount: CurrencyAmount<Currency>; collectedTime: any; claimedAmount: CurrencyAmount<Currency>; releaseDuration: any; vestClaimable: CurrencyAmount<Currency> };
    claimableAmount: CurrencyAmount<Token>
} {

    // get claim data for this airdrop and account
    const { library, chainId, account } = useActiveWeb3React()
    const canClaim = useUserHasAvailableClaim( airdrop, account )
    const claimData = useUserClaimData( airdrop, account )
    const collectData = useUserCollectData( airdrop ); //free run for on linear airdrops

    // used for popup summary
    const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount( claimData, canClaim, false )
    const addTransaction = useTransactionAdder()
    const contract = useAirdropContract( airdrop.address[ chainId ], airdrop.type === AirdropType.LINEAR )

    const claimCallback = async function () {
        if ( !claimData || !account || !library || !chainId || !contract ) return

        const args = [ claimData.index, account, claimData.amount, claimData.proof ]

        return contract.estimateGas[ 'claim' ]( ...args, {} ).then( ( estimatedGasLimit ) => {
            return contract
                .claim( ...args, { value: null, gasLimit: calculateGasMargin( estimatedGasLimit ) } )
                .then( ( response: TransactionResponse ) => {
                    addTransaction( response, {
                        summary: `Claimed ${unclaimedAmount?.toSignificant( 4 )} EMO`,
                        claim: { recipient: account },
                    } )
                    return response.hash
                } )
        } )
    }

    const collectCallback = async function () {
        if ( !claimData || !account || !library || !chainId || !contract ) return

        const args = [ claimData.index, account, claimData.amount, claimData.proof ]

        return contract.estimateGas[ 'collect' ]( ...args, {} ).then( ( estimatedGasLimit ) => {
            return contract
                .collect( ...args, { value: null, gasLimit: calculateGasMargin( estimatedGasLimit ) } )
                .then( ( response: TransactionResponse ) => {
                    addTransaction( response, {
                        summary: `Collected ${unclaimedAmount?.toSignificant( 4 )} EMO`,
                        claim: { recipient: account },
                    } )
                    return response.hash
                } )
        } )
    }

    const vestClaim = async function () {
        if ( !claimData || !account || !library || !chainId || !contract ) return

        const args = []

        return contract.estimateGas[ 'vestClaim' ]( ...args, {} ).then( ( estimatedGasLimit ) => {
            return contract
                .vestClaim( ...args, { value: null, gasLimit: calculateGasMargin( estimatedGasLimit ) } )
                .then( ( response: TransactionResponse ) => {
                    addTransaction( response, {
                        summary: `Vest Claim ${collectData.vestClaimable?.toSignificant( 4 )} EMO`,
                        claim: { recipient: account },
                    } )
                    return response.hash
                } )
        } )
    }

    const callbacks = { claimCallback, collectCallback, vestClaim };

    return { callbacks, claimData, canClaim, collectData, canCollect: canClaim, claimableAmount: unclaimedAmount }
}
