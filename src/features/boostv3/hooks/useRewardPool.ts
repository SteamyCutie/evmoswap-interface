import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, Token, Currency } from '@evmoswap/core-sdk'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useRewardPoolContract } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { TransactionResponseLight, useTransactionAdder } from 'app/state/transactions/hooks'
import { useCallback } from 'react'
import { useMultiFeeDistributionContract } from './useContract'

export function useRewardPool () {
    const { account, chainId } = useActiveWeb3React()
    const addTransaction = useTransactionAdder()
    const contract = useRewardPoolContract()
    const multistaking = useMultiFeeDistributionContract()

    // harvest
    const harvestRewards = useCallback( async () => {
        try {
            const tx = await contract?.harvest( account )
            return addTransaction( tx, { summary: i18n._( t`Harvest rewards` ) } )
        } catch ( e ) {
            console.log( e.message )
            return e
        }
    }, [ addTransaction, contract, account ] )

    const withdrawEarnings = useCallback(
        async ( amount: CurrencyAmount<Token | Currency>, withPenalty?: boolean, index?: number ) => {

            try {

                const denom = withPenalty ? 2 : 1;

                let tx: TransactionResponseLight;

                if ( index >= 0 ) {

                    //withdraw by index
                    tx = await multistaking.withdrawByIndex( index )
                } else {

                    //withdraw by amount with or without penalty.
                    const amountBN = amount.divide( denom ).toExact().toBigNumber( amount.currency.decimals )
                    tx = await multistaking.withdraw( amountBN )
                }

                return addTransaction( tx, { summary: i18n._( t`Withdraw earnings ${amount.divide( denom ).toFixed( 4 )}` ) } )
            } catch ( e ) {
                console.log( e.message, amount.toString() )
                return e
            }
        },
        [ addTransaction, contract, account ]
    )
    return {
        harvestRewards,
        withdrawEarnings,
    }
}
