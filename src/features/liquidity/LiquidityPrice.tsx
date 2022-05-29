import { Currency, Percent, Price } from '@evmoswap/core-sdk'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useStableSwapCallback } from 'app/features/exchange-stable/hooks'
import TradingMode, { TRADING_MODE } from 'app/features/exchange-stable/components/TradingMode'
import TradePrice from '../../features/swap/TradePrice'

import { Field } from '../../state/mint/actions'
import { ONE_BIPS } from '../../constants'
import React, { useCallback, useState } from 'react'
import Typography from '../../components/Typography'
import { classNames } from '../../functions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SwitchHorizontalIcon } from '@heroicons/react/solid'

export default function LiquidityPrice({
  currencies,
  price,
  noLiquidity,
  poolTokenPercentage,
  className,
}: {
  currencies: { [field in Field]?: Currency }
  price?: Price<Currency, Currency>
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  className?: string
}): JSX.Element {
  const { i18n } = useLingui()

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = i18n._(
    t`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert()?.toSignificant(6) ?? '-'} ${
      currencies[Field.CURRENCY_A]?.symbol
    }`
  )
  const textInverted = i18n._(
    t`1  ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(6) ?? '-'} ${
      currencies[Field.CURRENCY_B]?.symbol
    }`
  )

  return (
    <div className={classNames('grid items-center rounded py-4 px-5 space-y-2', className)}>
      <div className="flex w-full font-extrabold text-dark-primary dark:text-light-primary">
        <div
          onClick={flipPrice}
          title={text}
          className={classNames(
            'flex justify-between items-center w-full cursor-pointer rounded-md text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80 transition-all',
            className
          )}
        >
          <Typography variant="sm" className="select-none">
            {i18n._(t`Rate`)}
          </Typography>
          <div className="flex items-center space-x-2 justify-center">
            <Typography variant="sm" className="font-extrabold select-none">
              {showInverted ? text : textInverted}
            </Typography>
            <div>
              <svg
                width="2"
                height="12"
                viewBox="0 0 2 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-0.5"
              >
                <line x1="0.5" x2="0.5" y2="12" stroke="currentColor" />
              </svg>
            </div>
            <SwitchHorizontalIcon width={18} height={18} />
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full font-light text-right text-dark-primary dark:text-light-primary">
        <div className="text-sm">{i18n._(t`Share of Pool`)}</div>
        <div className="text-sm">
          {noLiquidity && price
            ? '100'
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
          %
        </div>
      </div>
    </div>
  )
}
