import { NATIVE } from '@evmoswap/core-sdk'
import React, { useState, useRef } from 'react'
import { EvmoSwap, XEMOS } from '../../../config/tokens'
import BigNumber from 'bignumber.js'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { classNames, formatNumber, formatPercent } from '../../../functions'
import { useEmosVaultContract } from 'hooks/useContract'
import { getBalanceNumber, getBalanceAmount } from 'functions/formatBalance'
import { getAPY, convertSharesToEmos, useWithdrawalFeeTimer, getEMOSPrice } from 'features/staking/useStaking'
import { BIG_ZERO } from 'app/functions/bigNumber'
import { CalculatorIcon, ChevronDownIcon } from '@heroicons/react/solid'
import ROICalculatorModal from 'app/components/ROICalculatorModal'
import AutoPoolCardDetails from './AutoPoolCardDetails'
import { Disclosure } from '@headlessui/react'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'

export default function AutoPoolCard() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const emosPrice = getEMOSPrice()
  const emosBalance = useTokenBalance(account ?? undefined, EvmoSwap[chainId])
  const [xBalanceAuto, setXBalanceAuto] = useState(0)

  const emosvaultContract = useEmosVaultContract()

  const fullShare = useRef(BIG_ZERO)
  const results = useRef([0, 0])

  // for countdown
  const lastDepositedTime = useRef(0)
  const userSharesValue = useRef(BIG_ZERO)

  const getEmosVault = async () => {
    const totalstaked = await emosvaultContract.balanceOf()
    if (!account) return
    const userInfo = await emosvaultContract.userInfo(account)
    const userShares = userInfo.shares
    const pricePerFullShare = await emosvaultContract.getPricePerFullShare()
    lastDepositedTime.current = parseInt(userInfo.lastDepositedTime, 10)
    userSharesValue.current = new BigNumber(userShares._hex)
    fullShare.current = new BigNumber(pricePerFullShare._hex)
    const { emosAsBigNumber, emosAsNumberBalance } = convertSharesToEmos(
      new BigNumber(userShares._hex),
      new BigNumber(pricePerFullShare._hex)
    )
    setXBalanceAuto(emosAsNumberBalance)
    const emosAtLastUserAction = new BigNumber(userInfo.emosAtLastUserAction._hex)
    const autoEmosProfit = emosAsBigNumber.minus(emosAtLastUserAction)
    const recentProfit = autoEmosProfit.gte(0) ? getBalanceNumber(autoEmosProfit, 18) : 0
    const totalStakedValue = getBalanceAmount(totalstaked._hex, 18).toNumber()
    results.current = [totalStakedValue, recentProfit]
  }
  getEmosVault()

  const { secondsRemaining } = useWithdrawalFeeTimer(lastDepositedTime.current, userSharesValue.current, 259200)
  const withdrawalFeeTimer = parseInt(secondsRemaining)
  const d = (withdrawalFeeTimer / 86400) | 0
  const h = ((withdrawalFeeTimer % 86400) / 3600) | 0
  const m = ((withdrawalFeeTimer - 86400 * d - h * 3600) / 60) | 0

  const { manualAPY, autoAPY } = getAPY()
  const [showCalc, setShowCalc] = useState(false)
  const myBalance = Number(emosBalance?.toSignificant(8)) + xBalanceAuto

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
                  <div className="text-xs font-bold md:text-2xl">Auto EMOS</div>
                  <div className="hidden text-xs md:block text-gray">{i18n._(t`Automatic restaking`)}</div>
                </div>
              </div>

              {/* Earned */}
              <div className="flex flex-col justify-center w-2/12 space-y-1">
                <div className="text-xs md:text-[14px] text-secondary">{i18n._(t`Recent EMOS Profit`)}</div>
                <div className="text-xs font-bold md:text-base">
                  {formatNumber(results.current[1]?.toFixed(EvmoSwap[chainId]?.decimals))}
                </div>
              </div>

              {/* Total staked */}
              <div className="flex-col justify-center hidden space-y-1 lg:w-3/12 lg:block">
                <div className="text-xs md:text-[14px] text-secondary">{i18n._(t`Total staked`)}</div>
                <div className="text-xs font-bold md:text-base">
                  {formatNumber(results.current[0]?.toFixed(EvmoSwap[chainId]?.decimals))} {EvmoSwap[chainId]?.symbol}
                </div>
              </div>

              {/* APR */}
              <div className="flex flex-col justify-center w-3/12 space-y-1 lg:w-2/12">
                <div className="text-xs md:text-[14px] text-secondary">APY</div>
                <div className="flex items-center" onClick={() => setShowCalc(true)}>
                  <div className="text-xs font-bold md:text-base">{formatPercent(autoAPY)} </div>
                  <CalculatorIcon className="w-5 h-5" />
                </div>
                <ROICalculatorModal
                  isfarm={false}
                  isOpen={showCalc}
                  onDismiss={() => setShowCalc(false)}
                  showBoost={false}
                  showCompound={false}
                  name={'EMOS'}
                  apr={manualAPY}
                  Lpbalance={myBalance}
                />
              </div>

              <div className="flex flex-col items-center justify-center lg:w-1/12">
                <ChevronDownIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`} />
              </div>
            </div>
          </Disclosure.Button>

          {open && <AutoPoolCardDetails />}
        </div>
      )}
    </Disclosure>
  )
}
