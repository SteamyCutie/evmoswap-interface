import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { NATIVE } from '@evmoswap/core-sdk'
import React, { useState, useRef } from 'react'
import { EvmoSwap, XEMO } from '../../../config/tokens'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { classNames, formatNumber, formatPercent } from '../../../functions'
import { useEmosVaultContract, useDashboardContract, useMasterChefContract } from 'hooks/useContract'
import { getBalanceAmount } from 'functions/formatBalance'
import { GetAPY, GetEMOPrice } from 'features/staking/useStaking'
import { CalculatorIcon, ChevronDownIcon } from '@heroicons/react/solid'
import ROICalculatorModal from 'app/components/ROICalculatorModal'
import ManualPoolCardDetails from './ManualPoolCardDetails'
import { Disclosure } from '@headlessui/react'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'

export default function ManualPoolCard() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const emoPrice = GetEMOPrice()
  const emoBalance = useTokenBalance(account ?? undefined, EvmoSwap[chainId])
  const XEMOBalance = useTokenBalance(account ?? undefined, XEMO[chainId])

  const dashboardContract = useDashboardContract()
  const emovaultContract = useEmosVaultContract()

  const results = useRef(0)
  const getEmoVault = async () => {
    const totalstaked = await emovaultContract.balanceOf()
    const tvlOfManual = await dashboardContract.tvlOfPool(0)
    const totalStakedValue = getBalanceAmount(totalstaked._hex, 18).toNumber()
    const tvlOfManualValue = getBalanceAmount(tvlOfManual.tvl._hex, 18).toNumber() - totalStakedValue
    results.current = tvlOfManualValue
  }
  getEmoVault()

  const { manualAPY } = GetAPY()

  const masterChefContract = useMasterChefContract()
  const harvestAmount = useRef(0)
  const getHarvestAmount = async () => {
    if (account) {
      harvestAmount.current = await masterChefContract.pendingTokens(0, account)
    }
  }
  getHarvestAmount()
  const [showCalc, setShowCalc] = useState(false)
  const balance = Number(emoBalance?.toSignificant(8))
  const stakedAmount = Number(XEMOBalance?.toSignificant(8))
  const myBalance = !stakedAmount ? balance : balance + stakedAmount

  return (
    <Disclosure>
      {({ open }) => (
        <div>
          <Disclosure.Button
            className={classNames(
              open && 'rounded-b-none',
              'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-900 text-primary text-sm md:text-lg'
            )}
          >
            <div className="flex gap-x-2">
              {/* Token logo */}
              <div className="flex items-center w-1/2 col-span-2 space-x-4 lg:gap-5 lg:w-4/12 lg:col-span-1">
                <CurrencyLogoArray
                  currencies={[EvmoSwap[chainId], NATIVE[chainId]]}
                  dense
                  size={window.innerWidth > 968 ? 40 : 28}
                />
                <div className="flex flex-col justify-center">
                  <div className="text-xs font-bold md:text-2xl">Manual EMO</div>
                  <div className="hidden text-xs md:block text-gray">{i18n._(t`Earn EMO, Stake EMO`)}</div>
                </div>
              </div>

              {/* Earned */}
              <div className="flex flex-col justify-center w-2/12 space-y-1">
                <div className="text-xs md:text-[14px] text-secondary">{i18n._(t`EMO Earned`)}</div>
                <div className="text-xs font-bold md:text-base">
                  {formatNumber(harvestAmount.current?.toFixed(EvmoSwap[chainId]?.decimals))}
                </div>
              </div>

              {/* Total staked */}
              <div className="flex-col justify-center hidden space-y-1 lg:w-3/12 lg:block">
                <div className="text-xs md:text-[14px] text-secondary">{i18n._(t`Total staked`)}</div>
                <div className="text-xs font-bold md:text-base">
                  {formatNumber(results.current?.toFixed(EvmoSwap[chainId]?.decimals))} {EvmoSwap[chainId]?.symbol}
                </div>
              </div>

              {/* APR */}
              <div className="flex flex-col justify-center w-3/12 space-y-1 lg:w-2/12">
                <div className="text-xs md:text-[14px] text-secondary">APR</div>
                <div className="flex items-center" onClick={() => setShowCalc(true)}>
                  <div className="text-xs font-bold md:text-base">{formatPercent(manualAPY)} </div>
                  <CalculatorIcon className="w-5 h-5" />
                </div>
                <ROICalculatorModal
                  isfarm={false}
                  isOpen={showCalc}
                  onDismiss={() => setShowCalc(false)}
                  showBoost={false}
                  showCompound={false}
                  name={'EMO'}
                  apr={manualAPY}
                  Lpbalance={myBalance}
                />
              </div>

              <div className="flex flex-col items-center justify-center lg:w-1/12">
                <ChevronDownIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`} />
              </div>
            </div>
          </Disclosure.Button>

          {open && <ManualPoolCardDetails />}
        </div>
      )}
    </Disclosure>
  )
}
