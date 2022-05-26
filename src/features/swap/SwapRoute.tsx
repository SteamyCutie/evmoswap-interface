import { Currency, Trade, TradeType } from '@evmoswap/core-sdk'
import React, { Fragment, memo } from 'react'

import { ChevronRightIcon } from '@heroicons/react/solid'
import { unwrappedToken } from '../../functions/currency/wrappedCurrency'

const SwapRoute = memo(({ trade }: { trade: Trade<Currency, Currency, TradeType> }) => {
  return (
    <div className="flex flex-wrap items-center justify-end">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          <Fragment key={i}>
            <div className="flex space-x-2 flex-end">
              <div className="text-sm font-bold text-dark-primary dark:text-light-primary transition-all">
                {currency.symbol}
              </div>
            </div>
            {isLastItem ? null : <ChevronRightIcon width={18} height={18} />}
          </Fragment>
        )
      })}
    </div>
  )
})

SwapRoute.displayName = 'SwapRoute'

export default SwapRoute
