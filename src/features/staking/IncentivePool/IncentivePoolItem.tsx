import React, { useState } from 'react'
import { useActiveWeb3React } from 'app/services/web3'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useCurrency } from 'app/hooks/Tokens'
import { classNames, formatNumber, formatPercent, formatNumberScale } from 'app/functions'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
import IncentivePoolItemDetail from './IncentivePoolItemDetail'
import { usePendingReward, usePoolsInfo } from './hooks'
import { CalculatorIcon } from '@heroicons/react/solid'
import ROICalculatorModal from 'app/components/ROICalculatorModal'
import { getAddress } from '@ethersproject/address'
import { SUSHI } from '@evmoswap/core-sdk'
import { useTokenBalance } from 'state/wallet/hooks'

const IncentivePoolItem = ( { pool, ...rest } ) => {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    let stakingToken = useCurrency( pool.stakingToken?.id )
    let earningToken = useCurrency( pool.earningToken?.id )

    const { apr, endInBlock, bonusEndBlock, totalStaked, stakingTokenPrice, earningTokenPrice } = usePoolsInfo( pool )

    const pendingReward = usePendingReward( pool, earningToken )
    const emoBalance = useTokenBalance( account ?? undefined, SUSHI[ chainId ] )
    const balance = Number( emoBalance?.toSignificant( 8 ) )
    const [ showCalc, setShowCalc ] = useState( false )

    return (
        <Disclosure>
            { ( { open } ) => (
                <div>
                    <Disclosure.Button
                        className={ classNames(
                            open && 'rounded-b-none',
                            'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-light dark:bg-dark text-primary text-sm md:text-lg'
                        ) }
                    >
                        <div className="flex gap-x-2">
                            {/* Token logo */ }
                            <div className="flex items-center w-1/2 col-span-2 space-x-4 lg:gap-5 lg:w-3/12 lg:col-span-1">
                                {/* <DoubleLogo currency0={token0} currency1={token1} size={window.innerWidth > 768 ? 40 : 24} /> */ }
                                { stakingToken && earningToken && (
                                    <CurrencyLogoArray
                                        currencies={ [ earningToken, stakingToken ] }
                                        dense
                                        size={ window.innerWidth > 968 ? 40 : 28 }
                                    />
                                ) }
                                <div className="flex flex-col justify-center">
                                    <div className="text-sm font-bold md:text-base">Earn { earningToken?.symbol }</div>
                                    { formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) != '0' ? (
                                        <div className="text-sm text-blue">{ i18n._( t`STAKING EMO` ) }</div>
                                    ) : (
                                        <div className="text-sm text-gray">{ i18n._( t`Stake EMO` ) }</div>
                                    ) }
                                </div>
                            </div>

                            {/* Earned */ }
                            <div className="flex flex-col justify-center w-2/12 space-y-1">
                                <div className="text-sm md:text-[14px] text-secondary">{ i18n._( t`Earned` ) }</div>
                                <div className="text-sm font-bold md:text-base">
                                    { formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) }
                                </div>
                            </div>

                            {/* Total staked */ }
                            <div className="flex-col justify-center hidden space-y-1 lg:w-2/12 lg:block">
                                <div className="text-sm md:text-[14px] text-secondary">{ i18n._( t`Total staked` ) }</div>
                                <div className="text-sm font-bold md:text-base">
                                    { formatNumber( totalStaked?.toFixed( stakingToken?.decimals ) ) } { stakingToken?.symbol }
                                </div>
                            </div>

                            {/* APR */ }
                            <div className="flex flex-col justify-center w-3/12 space-y-1 lg:w-2/12">
                                <div className="text-sm md:text-[14px] text-secondary">APR</div>
                                <div className="flex items-center" onClick={ () => setShowCalc( true ) }>
                                    <div className="text-sm font-bold md:text-base">{ formatPercent( apr ) } </div>
                                    <CalculatorIcon className="w-5 h-5" />
                                </div>
                                <ROICalculatorModal
                                    isfarm={ false }
                                    isOpen={ showCalc }
                                    onDismiss={ () => setShowCalc( false ) }
                                    showBoost={ false }
                                    showCompound={ false }
                                    name={ 'EMO' }
                                    apr={ apr }
                                    Lpbalance={ balance }
                                    earningTokenPrice={ Number( earningTokenPrice?.toFixed( 18 ) ) }
                                    earningTokenName={ earningToken?.symbol }
                                />
                            </div>

                            {/* Ends in */ }
                            <div className="flex-col justify-center hidden space-y-1 lg:w-2/12 lg:block">
                                <div className="flex items-center text-sm md:text-[14px] text-secondary">{ i18n._( t`Ends in` ) }</div>
                                <div className="text-sm font-bold md:text-base">{ formatNumber( endInBlock ) } blocks</div>
                            </div>

                            <div className="flex flex-col items-center justify-center lg:w-1/12">
                                <ChevronDownIcon className={ `${open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500` } />
                            </div>
                        </div>
                    </Disclosure.Button>

                    { open && (
                        <IncentivePoolItemDetail
                            pool={ pool }
                            pendingReward={ pendingReward }
                            stakingTokenPrice={ stakingTokenPrice }
                            earningTokenPrice={ earningTokenPrice }
                            endInBlock={ endInBlock }
                            bonusEndBlock={ bonusEndBlock }
                        />
                    ) }
                </div>
            ) }
        </Disclosure>
    )
}

export default IncentivePoolItem
