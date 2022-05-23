import { BigNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { useEvmoRollContract } from 'app/hooks/useContract'
import { useActiveWeb3React } from 'app/services/web3'
import { signERC2612Permit } from 'eth-permit'
import React, { useCallback } from 'react'
import ReactGA from 'react-ga'

import LPToken from './LPToken'

const useEvmoRoll = ( dex: LPToken[ 'dex' ] ) => {
    const { chainId, library, account } = useActiveWeb3React()
    const emoRoll = useEvmoRollContract( dex )
    const ttl = 60 * 20

    let from = dex

    const migrate = useCallback(
        async ( lpToken: LPToken, amount: BigNumber ) => {
            if ( emoRoll ) {
                const deadline = Math.floor( new Date().getTime() / 1000 ) + ttl
                const args = [ lpToken.tokenA.address, lpToken.tokenB.address, amount, Zero, Zero, deadline ]
                console.log( args )
                const gasLimit = await emoRoll.estimateGas.migrate( ...args )
                const tx = emoRoll.migrate( ...args, {
                    gasLimit: gasLimit.mul( 120 ).div( 100 ),
                } )

                ReactGA.event( {
                    category: 'Migrate',
                    label: 'migrate',
                    action: `${from}->Evmoswap`,
                } )

                return tx
            }
        },
        [ emoRoll, ttl, from ]
    )

    const migrateWithPermit = useCallback(
        async ( lpToken: LPToken, amount: BigNumber ) => {
            if ( account && emoRoll ) {
                const deadline = Math.floor( new Date().getTime() / 1000 ) + ttl
                const permit = await signERC2612Permit(
                    library,
                    lpToken.address,
                    account,
                    emoRoll.address,
                    amount.toString(),
                    deadline
                )
                const args = [
                    lpToken.tokenA.address,
                    lpToken.tokenB.address,
                    amount,
                    Zero,
                    Zero,
                    deadline,
                    permit.v,
                    permit.r,
                    permit.s,
                ]

                const gasLimit = await emoRoll.estimateGas.migrateWithPermit( ...args )
                const tx = await emoRoll.migrateWithPermit( ...args, {
                    gasLimit: gasLimit.mul( 120 ).div( 100 ),
                } )

                ReactGA.event( {
                    category: 'Migrate',
                    label: 'migrateWithPermit',
                    action: `${from}->Evmoswap`,
                } )

                return tx
            }
        },
        [ account, library, emoRoll, ttl, from ]
    )

    return {
        migrate,
        migrateWithPermit,
    }
}

export default useEvmoRoll