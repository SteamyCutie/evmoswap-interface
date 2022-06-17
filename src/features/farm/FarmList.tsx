import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import Typography from 'app/components/Typography'
import FarmListItemDetails from './FarmListItemDetails'
import { classNames } from 'app/functions'
import { useInfiniteScroll } from './hooks'
import useSortableData from 'app/hooks/useSortableData'
import { useActiveWeb3React } from 'app/services/web3'
import React, { FC, useCallback, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import FarmListItem from './FarmListItem'
import { FarmType } from 'app/constants/farms'
import FarmListItemDetailsStable from './FarmListItemDetailsStable'
import { Divider } from 'app/components/Divider/Divider'

export const TABLE_WRAPPER_DIV_CLASSNAME =
    'overflow-hidden border border-light-stroke dark:border-dark-stroke rounded-xl bg-light dark:bg-dark p-2'
export const TABLE_TR_TH_CLASSNAME = ( i, length ) =>
    classNames(
        'text-secondary text-base py-3',
        i === length - 1 ? 'w-auto' : 'md:w-[13%]',
        i === 0 ? 'md:!w-[24%]' : '',
        i === 1 ? 'md:!w-[18%]' : '',

    )

const SortIcon: FC<{ id?: string; direction?: 'ascending' | 'descending'; active: boolean }> = ( {
    id,
    active,
    direction,
} ) => {
    if ( !id || !direction || !active ) return <></>
    if ( direction === 'ascending' ) return <ChevronUpIcon width={ 12 } height={ 12 } />
    if ( direction === 'descending' ) return <ChevronDownIcon width={ 12 } height={ 12 } />
    return <></>
}

// @ts-ignore TYPE NEEDS FIXING
const FarmList = ( { farms } ) => {
    const { items, requestSort, sortConfig } = useSortableData( farms, { key: 'roiPerYear', direction: 'descending' } )
    const { chainId } = useActiveWeb3React()
    const { i18n } = useLingui()
    const [ numDisplayed, setNumDisplayed ] = useInfiniteScroll( items )
    const [ selectedFarm, setSelectedFarm ] = useState<any>()
    const [ open, setOpen ] = useState( false )

    const handleOpen = useCallback( ( farm ) => {
        setSelectedFarm( farm )
        setOpen( true )
    }, [] )

    const handleDismiss = useCallback( () => {
        setOpen( false )
    }, [] )

    return (
        <>
            <div className={ classNames( TABLE_WRAPPER_DIV_CLASSNAME ) }>
                <div className="hidden md:flex md:w-full bg-light-secondary dark:bg-dark-secondary rounded-md font-medium md:px-6">
                    <div
                        className={ classNames( 'flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 0, 6 ) ) }
                        onClick={ () => requestSort( 'pair.token0.symbol' ) }
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`Pool` ) }
                        </Typography>
                        <SortIcon id={ sortConfig.key } direction={ sortConfig.direction } active={ sortConfig.key === 'symbol' } />
                    </div>
                    <div
                        className={ classNames( 'flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 1, 6 ) ) }
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`Rewards` ) }
                        </Typography>
                    </div>
                    <div
                        className={ classNames( 'flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 2, 6 ) ) }
                        onClick={ () => requestSort( 'tvl' ) }
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`TVL` ) }
                        </Typography>
                        <SortIcon id={ sortConfig.key } direction={ sortConfig.direction } active={ sortConfig.key === 'tvl' } />
                    </div>
                    <div
                        className={ classNames( 'flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 3, 6 ) ) }
                    // onClick={() => requestSort('tvl')}
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`Deposits` ) }
                        </Typography>
                        {/* <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'tvl'} /> */ }
                    </div>
                    <div
                        className={ classNames( 'flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 4, 6 ) ) }
                        onClick={ () => requestSort( 'multiplier' ) }
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`Multiplier` ) }
                        </Typography>
                        <SortIcon id={ sortConfig.key } direction={ sortConfig.direction } active={ sortConfig.key === 'multiplier' } />
                    </div>
                    <div
                        className={ classNames( 'flex gap-1 items-center justify-center cursor-pointer', TABLE_TR_TH_CLASSNAME( 5, 6 ) ) }
                        onClick={ () => requestSort( 'roiPerYear' ) }
                    >
                        <Typography weight={ 500 }>
                            { i18n._( t`APR -> Boost APR` ) }
                        </Typography>
                        {/*<SortIcon id={ sortConfig.key } direction={ sortConfig.direction } active={ sortConfig.key === 'roiPerYear' } />*/ }
                    </div>
                </div>
                <div className="md:min-w-[768px] md:px-6">
                    <InfiniteScroll
                        dataLength={ numDisplayed }
                        next={ () => setNumDisplayed( numDisplayed + 5 ) }
                        hasMore={ true }
                        loader={ null }
                    >
                        { items.slice( 0, numDisplayed ).map( ( farm, index ) => (
                            <>
                                <FarmListItem
                                    key={ index }
                                    farm={ farm }
                                    onClick={ () => handleOpen( farm ) }
                                />
                                { index + 1 !== items.length &&
                                    <div className='block md:hidden'>
                                        <Divider />
                                    </div>
                                }
                            </>
                        ) ) }
                    </InfiniteScroll>
                    { !farms.length && <div className='text-center w-full'>{ i18n._( t`No data found` ) }</div> }
                </div>
            </div>
            <HeadlessUiModal.Controlled isOpen={ open } onDismiss={ handleDismiss } afterLeave={ handleDismiss }>
                { selectedFarm && (
                    selectedFarm.farmType === FarmType.STABLE ?
                        <FarmListItemDetailsStable farm={ selectedFarm } onDismiss={ handleDismiss } handleDismiss={ handleDismiss } />
                        :
                        <FarmListItemDetails farm={ selectedFarm } onDismiss={ handleDismiss } handleDismiss={ handleDismiss } />
                ) }
            </HeadlessUiModal.Controlled>
        </>
    )
}

export default FarmList
