import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import QuestionHelper from 'app/components/QuestionHelper'
import { RowBetween, RowFixed } from 'app/components/Row'
import React from 'react'

export enum TRADING_MODE {
  STANDARD = 0,
  STABLE = 1,
}
export default function TradingMode({ mode }: { mode: TRADING_MODE }) {
  const isStandard = mode === TRADING_MODE.STANDARD
  const isStable = mode === TRADING_MODE.STABLE

  return (
    <RowBetween>
      <RowFixed>
        <div className="flex items-center justify-center text-sm transition-all text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80">
          {i18n._(t`Trading with`)}
        </div>
        <QuestionHelper
          text={i18n._(
            t`Your total output is optimized automatically by selecting between Standard and Stable AMM routes.`
          )}
        />
      </RowFixed>
      <RowFixed>
        {isStandard && (
          <div className="text-sm font-medium cursor-help rounded-lg px-2.5 py-0.5 bg-light-bg dark:bg-dark-bg transition-all flex items-center flex-inline space-x-2">
            <QuestionHelper text={i18n._(t`Standard AMM, most efficient for trading assets with uncorrelated values`)}>
              <div className="flex items-center justify-center space-x-2 outline-none">
                <span className="w-3 h-3 rounded-full bg-pink"></span>
                <span className="text-xs transition-all text-dark-primary dark:text-light-primary">
                  {i18n._(t`Standard AMM`)}
                </span>
              </div>
            </QuestionHelper>
          </div>
        )}
        {isStable && (
          <div className="text-sm font-medium cursor-help rounded-lg px-2.5 py-0.5 bg-dark-700 flex items-center flex-inline space-x-2">
            <QuestionHelper text={i18n._(t`Stable AMM, best for trading assets with correlated values`)}>
              <div className="flex items-center justify-center space-x-2 outline-none">
                <span className="w-3 h-3 rounded-full bg-yellow"></span>
                <span className="text-gray-300 mt-0.5">{i18n._(t`Stable AMM`)}</span>
              </div>
            </QuestionHelper>
          </div>
        )}
      </RowFixed>
    </RowBetween>
  )
}
