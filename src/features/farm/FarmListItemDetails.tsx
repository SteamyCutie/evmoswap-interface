import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import ToggleButtonGroup from 'app/components/ToggleButton'

import { classNames } from 'app/functions'
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { OnsenModalView, PairType } from './enum'
// import { PairState } from 'app/hooks/useV2Pairs'
// import { LiquidityHeader } from '../liquidity'
// import { Field } from 'app/state/mint/actions'
// import CurrencyInputPanel from 'app/components/CurrencyInputPanel'
// import QuestionHelper from 'app/components/QuestionHelper'
// import { selectOnsen, setOnsenModalView } from 'app/features/onsen/onsenSlice'
// import InformationDisclosure from './InformationDisclosure'

import InvestmentDetails from './InvestmentDetails'
import ManageBar from './ManageBar'
import ManageSwapPair from './ManageSwapPair'

const COLUMN_CONTAINER = 'flex flex-col flex-grow gap-4'

interface FarmListItemDetailsModal {
  content: ReactNode
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
}

const Context = createContext<FarmListItemDetailsModal | undefined>(undefined)

// @ts-ignore TYPE NEEDS FIXING
const FarmListItemDetails = ({ farm, onDismiss, handleDismiss }) => {
  const { i18n } = useLingui()
  const [view, setView] = useState(OnsenModalView.Liquidity)
  const [content, setContent] = useState<ReactNode>()
  // console.log('farm: ', farm)

  return (
    <Context.Provider value={useMemo(() => ({ content, setContent }), [content, setContent])}>
      <div className={classNames('')}>
        <div className={classNames(COLUMN_CONTAINER, content ? 'p-4' : 'hidden')}>{content}</div>
        <div className={classNames(COLUMN_CONTAINER, content ? 'hidden' : '')}>
          <HeadlessUiModal.Header
            header={
              <div className="flex gap-0.5 items-center">
                {view === OnsenModalView.Liquidity
                  ? i18n._(t`Manage liquidity`)
                  : view === OnsenModalView.Position
                  ? i18n._(t`Your position and rewards`)
                  : i18n._(t`Stake or unstake your liquidity`)}
                {/* <QuestionHelper text={<InformationDisclosure farm={farm} />} /> */}
              </div>
            }
            onClose={onDismiss}
          />
          <ToggleButtonGroup size="sm" value={view} onChange={(view: OnsenModalView) => setView(view)} variant="filled">
            <ToggleButtonGroup.Button value={OnsenModalView.Liquidity}>{i18n._(t`Liquidity`)}</ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value={OnsenModalView.Staking}>{i18n._(t`Staking`)}</ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value={OnsenModalView.Position}>{i18n._(t`Rewards`)}</ToggleButtonGroup.Button>
          </ToggleButtonGroup>

          {/*Dont unmount following components to make modal more react faster*/}
          <div className={classNames(COLUMN_CONTAINER, view === OnsenModalView.Position ? 'block' : 'hidden')}>
            <InvestmentDetails farm={farm} handleDismiss={handleDismiss} />
          </div>
          <div className={classNames(COLUMN_CONTAINER, view === OnsenModalView.Liquidity ? 'block' : 'hidden')}>
            <ManageSwapPair farm={farm} handleDismiss={handleDismiss} />
          </div>
          <div className={classNames(COLUMN_CONTAINER, view === OnsenModalView.Staking ? 'block' : 'hidden')}>
            <ManageBar farm={farm} handleDismiss={handleDismiss} />
          </div>
        </div>
      </div>
    </Context.Provider>
  )
}

export const useFarmListItemDetailsModal = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Farm List Item Details Context')
  }

  return context
}

export default FarmListItemDetails
