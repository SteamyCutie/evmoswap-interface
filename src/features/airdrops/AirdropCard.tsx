import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Typography from 'app/components/Typography'
import React, { useState } from 'react'
import { RowBetween } from 'app/components/Row'
import Button from 'app/components/Button/index.new'
import { useAirdrop } from 'app/features/airdrops/hooks'
import { Airdrop, AirdropType } from 'app/constants/airdrops'
import { classNames, formatNumber } from 'app/functions'
import { formatNumber as formatBalanceNumber } from 'app/functions/formatBalance'
import { ZERO } from '@evmoswap/core-sdk'
import { contractErrorToUserReadableMessage } from '../exchange-stable/utils'
import Alert from 'app/components/Alert'

export default function AirdropCard ( { airdrop, evmoPrice, className }: { airdrop: Airdrop, evmoPrice: number, className?: string } ): JSX.Element {

    const { i18n } = useLingui()
    const isLinear = airdrop.type == AirdropType.LINEAR;

    const {
        claimableAmount,
        canClaim: isNotClaimed,
        callbacks, canCollect,
        collectData
    } = useAirdrop( airdrop );

    const canClaim = isLinear ? collectData.vestClaimable?.greaterThan( ZERO ) : isNotClaimed;

    const [ pending, setPending ] = useState( false );
    const [ pendingCollect, setPendingCollect ] = useState( false );
    const [ error, setError ] = useState( '' );

    const usdPrice = ( amount ) => formatBalanceNumber( Number( amount ) * evmoPrice, 2, 4 ).concat( ' USD' );

    const handleClaim = async () => {

        setPending( true );
        if ( error )
            setError( '' );

        try {
            if ( isLinear )
                await callbacks.vestClaim();
            else
                await callbacks.claimCallback();
        } catch ( error ) {

            console.log( error )
            if ( error?.code !== 4001 )
                setError( contractErrorToUserReadableMessage( error ) )
        }

        setTimeout( () => {
            setPending( false );
        }, 4000 )

    }

    const handleCollect = async () => {

        setPendingCollect( true );

        try {
            await callbacks.collectCallback();
        } catch ( error ) {

        }

        setTimeout( () => {
            setPendingCollect( false );
        }, 4000 )
    }

    return (

        <div className={ `flex flex-col  bg-dark-900 bg-opacity-80 rounded-b${className}` }>
            <div className="flex flex-row items-center justify-between w-full p-6 bg-dark-800 text-lg rounded-t text-high-emphesis font-black">
                { i18n._( t`${airdrop.title}` ) }
            </div>
            <div className="p-6 text-white h-full">
                <Typography>{ i18n._( t`Airdrop amount` ) }: { formatNumber( airdrop.amount, false, false ) }</Typography>
                <Typography>{ i18n._( t`Airdrop rules` ) }: { airdrop.description }</Typography>

                { !isLinear &&
                    <RowBetween className="my-4">
                        <Typography>{ i18n._( t`Your claimable` ) }</Typography>
                        <Typography>{ claimableAmount?.toFixed( 4 ) } ({ `~ ${usdPrice( claimableAmount.toExact() )}` })</Typography>
                    </RowBetween>
                }

                { isLinear &&
                    <ol className="m-4 list-decimal">
                        <li>
                            <RowBetween>
                                <Typography>{ i18n._( t`Collect your EMOs` ) }</Typography>
                                <Typography>{ collectData.collectedAmount?.toFixed( 4 ) } ({ `~ ${usdPrice( collectData.collectedAmount?.toExact() )}` })</Typography>
                            </RowBetween>
                        </li>
                        <li>
                            <RowBetween>
                                <Typography>{ i18n._( t`Your claimable EMOs` ) }</Typography>
                                <Typography>{ collectData.vestClaimable?.toFixed( 4 ) } ({ `~ ${usdPrice( collectData.vestClaimable?.toExact() )}` })</Typography>
                            </RowBetween>
                        </li>
                    </ol>
                }
            </div>
            <div className='footer p-6'>
                {
                    error && <Alert type='error' title='' message={ error } className='my-4 py-3 md:py-3 md:pl-4 md:pr-4' />
                }

                {/** Action button */ }
                <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0">
                    {
                        !claimableAmount.greaterThan( ZERO ) ?
                            <Button
                                className='disabled:cursor-not-allowed'
                                color={ 'gray' }
                                disabled={ true }>
                                { i18n._( t`You are not elegible` ) }
                            </Button>
                            :
                            <>
                                { isLinear &&
                                    <Button
                                        loading={ pendingCollect }
                                        onClick={ handleCollect }
                                        className={ classNames( 'disabled:cursor-not-allowed', canCollect ? 'bg-blue-600' : '' ) }
                                        color={ !canCollect ? 'gray' : 'blue' }
                                        disabled={ !canCollect || pendingCollect }>
                                        { i18n._( t`Collect` ) }
                                    </Button>
                                }

                                <Button
                                    onClick={ handleClaim }
                                    loading={ pending }
                                    className={ classNames( 'disabled:cursor-not-allowed', canClaim ? 'bg-blue-600' : '' ) }
                                    color={ !canClaim ? 'gray' : 'blue' }
                                    disabled={ !canClaim || pending }>
                                    {
                                        i18n._( t`${canClaim ? 'Claim' : 'Claimed!'}` )
                                    }
                                </Button>
                            </>
                    }

                </div>
            </div>
        </div>
    )
}
