import { Currency, Price } from '@evmoswap/core-sdk'
import React, { useCallback } from 'react'

import Typography from '../../components/Typography'
import { classNames } from '../../functions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SwitchHorizontalIcon } from '@heroicons/react/outline'

interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  className?: string
}

export default function TradePrice({ price, showInverted, setShowInverted, className }: TradePriceProps) {
  const { i18n } = useLingui()

  let formattedPrice: string

  try {
    formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price?.quoteCurrency?.symbol}` : `${price?.baseCurrency?.symbol} `

  const labelInverted = showInverted ? `${price?.baseCurrency?.symbol} ` : `${price?.quoteCurrency?.symbol}`

  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
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
          {text}
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
  )
}
