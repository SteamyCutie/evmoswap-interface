import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import { useCurrency } from '../../hooks/Tokens'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useMasterChef from './useMasterChef'
import { PositionCard, RewardCard } from 'app/components/PositionCard'
import { useDerivedMintInfo } from 'app/state/mint/hooks'
import Dots from 'app/components/Dots'
import { usePendingReward } from 'app/features/farm/hooks'
import { FarmType } from 'app/constants/farms'
import FarmIncentiveAmount from './FarmIncentiveAmount'
import FarmIncentiveRewards from './FarmIncentiveRewards'

// @ts-ignore TYPE NEEDS FIXING
const InvestmentDetails = ( { farm, handleDismiss } ) => {
    const { i18n } = useLingui()
    const { harvest } = useMasterChef( farm.chef )

    const addTransaction = useTransactionAdder()
    // const kashiPair = useKashiPair(farm.pair.id)
    const [ pendingTx, setPendingTx ] = useState( false )
    const token0 = useCurrency( farm.token0.id )
    const token1 = useCurrency( farm.token1.id )

    const { pair } = useDerivedMintInfo( token0 ?? undefined, token1 ?? undefined )

    const pendingReward = usePendingReward( farm )
    const canHarvest = Number( pendingReward?.amounts[ 0 ] ) > 0

    const isStableFarm = farm.farmType === FarmType.STABLE;

    async function onHarvest () {
        setPendingTx( true )
        try {
            const tx = await harvest( farm.pid )
            const tokensSummary = isStableFarm ? farm.name : `${farm.token0.name}/${farm.token1.name}`;
            addTransaction( tx, {
                summary: i18n._( t`Harvest ${tokensSummary}` ),
            } )
        } catch ( error ) {
            console.error( error )
        }
        setTimeout( () => {
            handleDismiss(), setPendingTx( false )
        }, 4000 )
    }

    return (
        <>
            { !isStableFarm && <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
                <PositionCard showUnwrapped={ true } pair={ pair } farm={ farm } />
            </HeadlessUiModal.BorderedContent>
            }
            <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
                <RewardCard reward={ pendingReward } />
                <FarmIncentiveRewards incentives={ farm.incentives } />
            </HeadlessUiModal.BorderedContent>
            <Button color={ canHarvest ? 'blue' : 'gray' } disabled={ pendingTx || !canHarvest } onClick={ onHarvest }>
                { canHarvest ? pendingTx ? <Dots>{ i18n._( t`Harvesting` ) }</Dots> : i18n._( t`Harvest Rewards` ) : i18n._( t`No rewards yet` ) }
            </Button>
        </>
    )
}

export default InvestmentDetails
