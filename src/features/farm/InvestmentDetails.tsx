import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import { useCurrency } from '../../hooks/Tokens'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import React, { useState } from 'react'
import useMasterChef from './useMasterChef'
import { PositionCard, MultiRewardsCard } from 'app/components/PositionCard'
import { useDerivedMintInfo } from 'app/state/mint/hooks'
import Dots from 'app/components/Dots'
import { useFarmPendingRewardsAmount } from 'app/features/farm/hooks'
import { FarmType } from 'app/constants/farms'
import { sumCurrencyAmounts } from '../exchange-stable/utils'
import Alert from 'app/components/Alert'

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

    const pendingRewards = useFarmPendingRewardsAmount( farm )
    const canHarvest = Number( sumCurrencyAmounts( pendingRewards ) ) > 0

    const isStableFarm = farm.farmType === FarmType.STABLE;

    async function onHarvest () {
        setPendingTx( true )
        try {

            const tokensSummary = pendingRewards?.length > 1 ? 'all rewards' : `${pendingRewards?.[ 0 ].toFixed( 4 )} ${pendingRewards?.[ 0 ]?.currency?.symbol}`;

            const tx = await harvest( farm.pid )
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
            { !isStableFarm && <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-light dark:bg-dark !rounded-xl border-0 mt-4">
                <PositionCard showUnwrapped={ true } pair={ pair } farm={ farm } />
            </HeadlessUiModal.BorderedContent>
            }
            <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-light dark:bg-dark !rounded-xl border-0">
                <MultiRewardsCard rewards={ pendingRewards } />
            </HeadlessUiModal.BorderedContent>
            <Alert
                title={ '' }
                message={ <span className='text-sm'>{ i18n._( t`Harvested EMO rewards will have a 30-day vesting period` ) }</span> }
                type="information"
                className='py-3 md:py-3 md:pl-4 md:pr-4'
            />
            <Button color={ canHarvest ? 'blue' : 'gray' } disabled={ pendingTx || !canHarvest } onClick={ onHarvest }>
                { canHarvest ? pendingTx ? <Dots>{ i18n._( t`Harvesting` ) }</Dots> : i18n._( t`Harvest Rewards` ) : i18n._( t`No rewards yet` ) }
            </Button>
        </>
    )
}

export default InvestmentDetails
