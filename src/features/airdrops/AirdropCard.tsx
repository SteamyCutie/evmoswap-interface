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

export default function AirdropCard ( { airdrop, evmoPrice, className = '' }: { airdrop: Airdrop, evmoPrice: number, className?: string } ): JSX.Element {

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

    const usdPrice = ( amount ) => formatBalanceNumber( isNaN( amount ) ? 0 : Number( amount ) * evmoPrice, 2, 4 ).concat( ' USD' );

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

        <div className={ classNames( 'flex flex-col  bg-light dark:bg-dark rounded-2xl border-2 border-light-stroke dark:border-dark-stroke', className ) }>
            <div className="flex flex-row items-center justify-between w-full p-6 bg-light-secondary dark:bg-dark-secondary text-lg rounded-t-2xl text-dark dark:text-light font-bold">
                { i18n._( t`${airdrop.title}` ) }
            </div>
            <div className="p-6 text-dark dark:text-light h-full font-medium text-base">
                <Typography>{ i18n._( t`Airdrop amount` ) }: { formatNumber( airdrop.amount, false, false ) }</Typography>
                <Typography>{ i18n._( t`Airdrop rules` ) }: { airdrop.description }</Typography>

                { !isLinear &&
                    <RowBetween className="my-4 mt-8">
                        <Typography>{ i18n._( t`Your claimable` ) }</Typography>
                        <Typography weight={ 600 }>{ claimableAmount?.toFixed( 4 ) } ({ `~ ${usdPrice( claimableAmount?.toExact() )}` })</Typography>
                    </RowBetween>
                }

                { isLinear &&
                    <ol className="m-4 mt-8 list-decimal">
                        <li>
                            <RowBetween>
                                <Typography>{ i18n._( t`Collect your EMOs` ) }</Typography>
                                <Typography weight={ 600 }>{ claimableAmount?.toFixed( 4 ) } ({ `~ ${usdPrice( claimableAmount?.toExact() )}` })</Typography>
                                {/*<Typography weight={ 600 }>{ collectData.collectedAmount?.toFixed( 4 ) } ({ `~ ${usdPrice( collectData.collectedAmount?.toExact() )}` })</Typography>*/ }
                            </RowBetween>
                        </li>
                        <li>
                            <RowBetween>
                                <Typography>{ i18n._( t`Your claimable EMOs` ) }</Typography>
                                <Typography weight={ 600 }>{ collectData.vestClaimable?.toFixed( 4 ) } ({ `~ ${usdPrice( collectData.vestClaimable?.toExact() )}` })</Typography>
                            </RowBetween>
                        </li>
                    </ol>
                }
            </div>
            <div className='footer p-6'>

                {
                    error && <Alert type='error' title='' message={ error } className='my-4 py-3 md:py-3 md:pl-4 md:pr-4' />
                }

                {
                    !airdrop.startStatus && <Alert type='information' title='' message={ i18n._( t`Not yet started` ) } className='my-2 py-3 md:py-3 md:pl-4 md:pr-4 flex justify-center' dismissable={ false } />
                }


                {/** Action button */
                    airdrop.startStatus === true &&
                    <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0">

                        {
                            /** Not elegible button */
                            !claimableAmount?.greaterThan( ZERO ) &&
                            <Button
                                className='disabled:cursor-not-allowed'
                                color={ 'gray' }
                                disabled={ true }>
                                { i18n._( t`You are not elegible` ) }
                            </Button>
                        }


                        { /** linear action buttons */
                            claimableAmount?.greaterThan( ZERO ) && isLinear && <>
                                { canCollect &&
                                    <Button
                                        loading={ pendingCollect }
                                        onClick={ handleCollect }
                                        className={ classNames( 'disabled:cursor-not-allowed', canCollect ? 'bg-blue-600' : '' ) }
                                        color={ !canCollect ? 'gray' : 'gradient' }
                                        disabled={ !canCollect || pendingCollect }>
                                        { i18n._( t`Collect` ) }
                                    </Button>
                                }

                                <Button
                                    onClick={ handleClaim }
                                    loading={ pending }
                                    className={ classNames( 'disabled:cursor-not-allowed', canClaim ? 'bg-blue-600' : '' ) }
                                    color={ !canClaim ? 'gray' : 'gradient' }
                                    disabled={ !canClaim || pending }>
                                    {
                                        i18n._( t`${canClaim ? 'Claim' : 'Claimed!'}` )
                                    }
                                </Button>
                            </>
                        }

                        {
                            /** once action buttons */
                            claimableAmount?.greaterThan( ZERO ) && !isLinear &&
                            <Button
                                onClick={ handleClaim }
                                loading={ pending }
                                className={ classNames( 'disabled:cursor-not-allowed', canClaim ? 'bg-blue-600' : '' ) }
                                color={ !canClaim ? 'gray' : 'gradient' }
                                disabled={ !canClaim || pending }>
                                {
                                    i18n._( t`${canClaim ? 'Claim' : 'Claimed!'}` )
                                }
                            </Button>
                        }

                    </div>
                }
            </div>
        </div>
    )
}
