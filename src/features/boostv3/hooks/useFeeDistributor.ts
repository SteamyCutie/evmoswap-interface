import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useCallback } from 'react'
import { useFeeDistributorContract } from './useContract'

export function useFeeDistributor () {
    const { account, chainId } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const contract = useFeeDistributorContract()

    // harvest
    const claimLockerExtraRewards = useCallback(
        async ( summary: string ) => {
            try {
                console.log( contract )
                contract.on( 'Claimed', ( addr, toDistribute, userEpoch, maxUserEpoch ) => {
                    console.log( { addr, toDistribute, userEpoch, maxUserEpoch } )
                    console.log( "aramics" )
                } )
                const tx = await contract[ 'claim()' ]()
                const rc = await tx.wait();
                console.log( tx, rc )
                return addTransaction( tx, { summary } )
            } catch ( e ) {
                console.log( e.message )
                return e
            }
        },
        [ addTransaction, contract, account ]
    )

    const lockerExtraRewards = useCallback( async (): Promise<string> => {

        let resp = "0"
        if ( !contract?.callStatic ) return resp;
        try {
            const result = await contract.callStatic[ 'claim(address)' ]( account );
            const result1 = await contract.callStatic[ 'claim()' ]();
            const result2 = await contract.callStatic[ 'tokenLastBalance' ]();
            console.log( String( result ), String( result1 ), String( result2 ) )
            resp = String( result )
        } catch ( e ) {
            console.log( e.message )
        }
        return resp;
    }, [ contract, account ] )

    return {
        claimLockerExtraRewards,
        lockerExtraRewards
    }
}
