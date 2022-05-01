import { useFeeDistributorContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useCallback } from 'react'

export function useFeeDistributor () {
    const { account } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const contract = useFeeDistributorContract()

    // harvest
    const claimLockerExtraRewards = useCallback(
        async ( summary: string ) => {
            try {

                const tx = await contract[ 'claim()' ]()
                return addTransaction( tx, { summary } )
            } catch ( e ) {
                console.log( e.message )
                return e
            }
        },
        [ addTransaction, contract, account ]
    )

    return {
        claimLockerExtraRewards
    }
}
