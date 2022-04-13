// import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
// import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { classNames, formatNumber, formatPercent } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import React, { FC, ReactNode } from 'react'
import { LockClosedIcon } from '@heroicons/react/solid'

interface FarmListItem {
  farm: any
  onClick(x: ReactNode): void
}

export const TABLE_TBODY_TR_CLASSNAME = 'hover:bg-dark-900/40 hover:cursor-pointer'
// @ts-ignore TYPE NEEDS FIXING
export const TABLE_TBODY_TD_CLASSNAME = (i, length) =>
  classNames(
    'py-3 border-t border-dark-900 flex items-center',
    i === 0 ? 'pl-4 justify-start' : 'justify-end',
    i === length - 1 ? 'pr-4' : ''
  )

// @ts-ignore TYPE NEEDS FIXING
const FarmListItem: FC<FarmListItem> = ({ farm, onClick }) => {
  const { i18n } = useLingui()
  const token0 = useCurrency(farm.token0.id) ?? undefined
  const token1 = useCurrency(farm.token1.id) ?? undefined

  console.log('farm: ', farm)
  return (
    <div className={classNames(TABLE_TBODY_TR_CLASSNAME, 'grid grid-cols-4')} onClick={onClick}>
      <div className={classNames('flex gap-2', TABLE_TBODY_TD_CLASSNAME(0, 4))}>
        {token0 && token1 && <CurrencyLogoArray currencies={[token0, token1]} dense size={32} />}
        <div className="flex flex-col items-start">
          <Typography weight={700} className="flex gap-1 text-high-emphesis">
            {farm?.token0?.symbol}
            <span className="text-low-emphesis">/</span>
            {farm?.token1?.symbol}
          </Typography>
        </div>
      </div>
      <div className={TABLE_TBODY_TD_CLASSNAME(1, 4)}>
        <Typography weight={700} className="text-high-emphesis">
          {formatNumber(farm.tvl, true)}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end !justify-center', TABLE_TBODY_TD_CLASSNAME(2, 4))}>
        {/* @ts-ignore TYPE NEEDS FIXING */}
        <Typography weight={700} className="text-high-emphesis">
          {farm.multiplier / 100}x
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(3, 4))}>
        <Typography weight={700} className="text-high-emphesis">
          <div className="flex items-center">
            <LockClosedIcon className="h-4 text-yellow" />
            <div className="text-xs font-bold md:text-base">
              {formatPercent(farm.apr)} → {formatPercent(farm.apr * 2.5)}
            </div>
          </div>
        </Typography>
      </div>
    </div>
  )
}

export default FarmListItem
