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

export const TABLE_WRAPPER_DIV_CLASSNAME =
  'overflow-x-auto border border-dark-900 rounded shadow-md bg-[rgba(0,0,0,0.12)]'
export const TABLE_TR_TH_CLASSNAME = (i, length) =>
  classNames('text-secondary text-sm py-3', i === 0 ? 'pl-4 text-left' : 'text-right', i === length - 1 ? 'pr-4' : '')

const SortIcon: FC<{ id?: string; direction?: 'ascending' | 'descending'; active: boolean }> = ({
  id,
  active,
  direction,
}) => {
  if (!id || !direction || !active) return <></>
  if (direction === 'ascending') return <ChevronUpIcon width={12} height={12} />
  if (direction === 'descending') return <ChevronDownIcon width={12} height={12} />
  return <></>
}

// @ts-ignore TYPE NEEDS FIXING
const FarmList = ({ farms }) => {
  const { items, requestSort, sortConfig } = useSortableData(farms, { key: 'roiPerYear', direction: 'descending' })
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const [numDisplayed, setNumDisplayed] = useInfiniteScroll(items)
  const [selectedFarm, setSelectedFarm] = useState<any>()
  const [open, setOpen] = useState(false)

  const handleDismiss = useCallback(() => {
    setOpen(false)
    // setSelectedFarm(undefined)
  }, [])

  return (
    <>
      <div className={classNames(TABLE_WRAPPER_DIV_CLASSNAME)}>
        <div className="grid grid-cols-6 min-w-[768px]">
          <div
            className={classNames('flex gap-1 items-center cursor-pointer', TABLE_TR_TH_CLASSNAME(0, 6))}
            onClick={() => requestSort('pair.token0.symbol')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`Pool`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'symbol'} />
          </div>
          <div
            className={classNames('flex gap-1 items-center cursor-pointer justify-end', TABLE_TR_TH_CLASSNAME(1, 6))}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`Rewards`)}
            </Typography>
          </div>
          <div
            className={classNames('flex gap-1 items-center cursor-pointer justify-end', TABLE_TR_TH_CLASSNAME(2, 6))}
            onClick={() => requestSort('tvl')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`TVL`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'tvl'} />
          </div>
          <div
            className={classNames('flex gap-1 items-center cursor-pointer justify-end', TABLE_TR_TH_CLASSNAME(3, 6))}
            // onClick={() => requestSort('tvl')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`MyLPs`)}
            </Typography>
            {/* <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'tvl'} /> */}
          </div>
          <div
            className={classNames('flex gap-1 items-center cursor-pointer justify-end', TABLE_TR_TH_CLASSNAME(4, 6))}
            onClick={() => requestSort('multiplier')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`Multiplier`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'multiplier'} />
          </div>
          <div
            className={classNames('flex gap-1 items-center cursor-pointer justify-end', TABLE_TR_TH_CLASSNAME(5, 6))}
            onClick={() => requestSort('roiPerYear')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`APR -> Boost APR`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'roiPerYear'} />
          </div>
        </div>
        <div className="divide-y divide-dark-900  min-w-[768px]">
          <InfiniteScroll
            dataLength={numDisplayed}
            next={() => setNumDisplayed(numDisplayed + 5)}
            hasMore={true}
            loader={null}
          >
            {items.slice(0, numDisplayed).map((farm, index) => (
              <FarmListItem
                key={index}
                farm={farm}
                onClick={() => {
                  setSelectedFarm(farm)
                  setOpen(true)
                }}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>
      <HeadlessUiModal.Controlled isOpen={open} onDismiss={() => setOpen(false)} afterLeave={handleDismiss}>
        {selectedFarm && (
          <FarmListItemDetails farm={selectedFarm} onDismiss={() => setOpen(false)} handleDismiss={handleDismiss} />
        )}
      </HeadlessUiModal.Controlled>
    </>
  )
}

export default FarmList
