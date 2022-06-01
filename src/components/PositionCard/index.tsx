import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline'
import { Currency, CurrencyAmount, JSBI, Pair, Percent, Token } from '@evmoswap/core-sdk'
import React, { useEffect, useState } from 'react'
import { currencyId, unwrappedToken } from '../../functions/currency'
import { AutoColumn } from '../Column'
import { BIG_INT_ZERO } from '../../constants'
import Button from '../Button'
import { CurrencyLogo, CurrencyLogoArray } from '../CurrencyLogo'
import Dots from '../Dots'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Transition } from '@headlessui/react'
import { classNames, formatBalance } from '../../functions'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useColor } from '../../hooks/useColor'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTotalSupply } from '../../hooks/useTotalSupply'
import { useCurrency } from 'app/hooks/Tokens'
import { usePendingReward } from 'app/features/farm/hooks'
import { EvmoSwap } from 'config/tokens'
import { useUserInfo } from '../../features/farm/hooks'
import { getAddress } from '@ethersproject/address'

interface PositionCardProps {
    pair: Pair
    farm?: any
    showUnwrapped?: boolean
    border?: string
    stakedBalance?: CurrencyAmount<Token> // optional balance to indicate that liquidity is deposited in mining pool
}

export function MinimalPositionCard ( { pair, showUnwrapped = false, border }: PositionCardProps ) {
    const { i18n } = useLingui()
    const { account } = useActiveWeb3React()

    const currency0 = showUnwrapped ? pair.token0 : unwrappedToken( pair.token0 )
    const currency1 = showUnwrapped ? pair.token1 : unwrappedToken( pair.token1 )

    const [ showMore, setShowMore ] = useState( false )

    const userPoolBalance = useTokenBalance( account ?? undefined, pair.liquidityToken )
    const totalPoolTokens = useTotalSupply( pair.liquidityToken )

    const poolTokenPercentage =
        !!userPoolBalance &&
            !!totalPoolTokens &&
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? new Percent( userPoolBalance.quotient, totalPoolTokens.quotient )
            : undefined

    const [ token0Deposited, token1Deposited ] =
        !!pair &&
            !!totalPoolTokens &&
            !!userPoolBalance &&
            // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? [
                pair.getLiquidityValue( pair.token0, totalPoolTokens, userPoolBalance, false ),
                pair.getLiquidityValue( pair.token1, totalPoolTokens, userPoolBalance, false ),
            ]
            : [ undefined, undefined ]

    return (
        <>
            { userPoolBalance && JSBI.greaterThan( userPoolBalance.quotient, JSBI.BigInt( 0 ) ) ? (
                <div className="text-dark-primary dark:text-light-primary transition-all mt-6">
                    <AutoColumn gap={ 'md' }>
                        <div className="text-base font-bold">Your Position</div>
                        <div className="px-6 py-5 rounded-2xl bg-light-primary dark:bg-dark-primary transition-all">
                            <div className="flex flex-col pb-3 border-b-2 border-light-secondary dark:border-dark-secondary md:flex-row md:justify-between transition-all">
                                <div className="flex items-center w-auto space-x-4">
                                    <DoubleCurrencyLogo
                                        currency0={ pair.token0 }
                                        currency1={ pair.token1 }
                                        size={ 40 }
                                        className="-space-x-2"
                                    />
                                    <div className="text-lg font-extrabold">
                                        { currency0.symbol }/{ currency1.symbol }
                                    </div>
                                </div>
                                <div className="flex items-center mt-3 space-x-1 text-base md:mt-0">
                                    <div className="font-extrabold">{ userPoolBalance ? userPoolBalance.toSignificant( 4 ) : '-' } </div>
                                    <div className="text-sm">Pool Tokens</div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full mt-3 space-y-1 text-sm rounded">
                                <div className="flex justify-between">
                                    <div>{ i18n._( t`Your pool share` ) }</div>
                                    { poolTokenPercentage ? (
                                        <div className="flex space-x-1">
                                            <div className="font-bold">{ poolTokenPercentage.toFixed( 6 ) }</div>
                                            <div>%</div>
                                        </div>
                                    ) : (
                                        <div>-</div>
                                    ) }
                                </div>
                                <div className="flex justify-between">
                                    <div>{ currency0.symbol }:</div>
                                    { token0Deposited ? (
                                        <div className="flex space-x-1">
                                            <div className="font-bold"> { token0Deposited?.toSignificant( 6 ) }</div>
                                            <div>{ currency0.symbol }</div>
                                        </div>
                                    ) : (
                                        '-'
                                    ) }
                                </div>
                                <div className="flex justify-between">
                                    <div>{ currency1.symbol }:</div>
                                    { token1Deposited ? (
                                        <div className="flex space-x-1">
                                            <div className="font-bold">{ token1Deposited?.toSignificant( 6 ) }</div>
                                            <div>{ currency1.symbol }</div>
                                        </div>
                                    ) : (
                                        '-'
                                    ) }
                                </div>
                            </div>
                        </div>
                    </AutoColumn>
                </div>
            ) : null }
        </>
    )
}

export default function FullPositionCard ( { pair, border, stakedBalance }: PositionCardProps ) {
    const { i18n } = useLingui()
    const router = useRouter()
    const { account, chainId } = useActiveWeb3React()

    const currency0 = unwrappedToken( pair.token0 )
    const currency1 = unwrappedToken( pair.token1 )

    const [ showMore, setShowMore ] = useState( false )

    const userDefaultPoolBalance = useTokenBalance( account ?? undefined, pair.liquidityToken )

    const totalPoolTokens = useTotalSupply( pair.liquidityToken )

    // if staked balance balance provided, add to standard liquidity amount
    const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add( stakedBalance ) : userDefaultPoolBalance

    const poolTokenPercentage =
        !!userPoolBalance &&
            !!totalPoolTokens &&
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? new Percent( userPoolBalance.quotient, totalPoolTokens.quotient )
            : undefined

    const [ token0Deposited, token1Deposited ] =
        !!pair &&
            !!totalPoolTokens &&
            !!userPoolBalance &&
            // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? [
                pair.getLiquidityValue( pair.token0, totalPoolTokens, userPoolBalance, false ),
                pair.getLiquidityValue( pair.token1, totalPoolTokens, userPoolBalance, false ),
            ]
            : [ undefined, undefined ]

    const backgroundColor = useColor( pair?.token0 )

    return (
        <div>
            <Button
                variant="empty"
                className={ classNames(
                    'flex items-center justify-between w-full p-4 cursor-pointer transition-all rounded-none'
                ) }
                onClick={ () => setShowMore( !showMore ) }
            >
                <div className="flex items-center space-x-4">
                    {/* <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={40} /> */ }
                    <CurrencyLogoArray currencies={ [ currency0, currency1 ] } size={ 36 } />

                    <div className="text-base font-semibold text-dark-primary dark:text-light-primary transition-all">
                        { !currency0 || !currency1 ? <Dots>{ i18n._( t`Loading` ) }</Dots> : `${currency0.symbol} / ${currency1.symbol}` }
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-sm transition-all text-dark-primary dark:text-light-primary ">
                    <p>{ i18n._( t`Manage` ) }</p>
                    <ChevronDownIcon
                        width={ 16 }
                        height={ 16 }
                        className="transition-all"
                        style={ { transform: `rotate(${showMore ? 180 : 0}deg)` } }
                    />
                </div>
            </Button>

            <Transition
                show={ showMore }
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className={ classNames(
                        `mx-4 py-4 space-y-4 border-t transition-all`,
                        showMore ? 'border-light-stroke dark:border-dark-stroke' : 'border-opacity-0'
                    ) }
                >
                    <div className="transition-all space-y-2 text-sm">
                        <div className="flex items-center justify-between text-dark-primary dark:text-light-primary transition-all">
                            <div>{ i18n._( t`Your total pool tokens` ) }</div>
                            <div className="font-semibold">{ userPoolBalance ? userPoolBalance.toSignificant( 4 ) : '-' }</div>
                        </div>
                        {/* {stakedBalance && (
              <div className="flex items-center justify-between">
                <div>{i18n._(t`Pool tokens in rewards pool`)}:</div>
                <div className="font-semibold">{stakedBalance.toSignificant(4)}</div>
              </div>
            )} */}
                        <div className="flex items-center justify-between text-dark-primary dark:text-light-primary transition-all">
                            <div>{ i18n._( t`Pooled ${currency0?.symbol}` ) }</div>
                            { token0Deposited ? (
                                <div className="flex items-center space-x-2">
                                    <CurrencyLogo size={ 18 } currency={ currency0 } />
                                    <div className="font-semibold">{ token0Deposited?.toSignificant( 6 ) }</div>
                                </div>
                            ) : (
                                '-'
                            ) }
                        </div>

                        <div className="flex items-center justify-between text-dark-primary dark:text-light-primary transition-all">
                            <div>{ i18n._( t`Pooled ${currency1?.symbol}` ) }</div>
                            { token1Deposited ? (
                                <div className="flex items-center space-x-2">
                                    <CurrencyLogo size={ 18 } currency={ currency1 } />
                                    <div className="font-semibold ">{ token1Deposited?.toSignificant( 6 ) }</div>
                                </div>
                            ) : (
                                '-'
                            ) }
                        </div>

                        <div className="flex items-center justify-between text-dark-primary dark:text-light-primary transition-all">
                            <div>{ i18n._( t`Your pool share` ) }</div>
                            <div className="font-semibold">
                                { poolTokenPercentage
                                    ? ( poolTokenPercentage.toFixed( 2 ) === '0.00' ? '< 0.01' : poolTokenPercentage.toFixed( 2 ) ) + ' %'
                                    : '-' }
                            </div>
                        </div>
                    </div>
                    { userDefaultPoolBalance && JSBI.greaterThan( userDefaultPoolBalance.quotient, BIG_INT_ZERO ) && (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outlined"
                                color="red"
                                size="lg"
                                onClick={ () => {
                                    router.push( `/remove/${currencyId( currency0 )}/${currencyId( currency1 )}` )
                                } }
                                className="font-extrabold text-sm"
                            >
                                { i18n._( t`Remove` ) }
                            </Button>
                            <Button
                                color="gradient"
                                size="lg"
                                onClick={ () => {
                                    router.push( `/add/${currencyId( currency0 )}/${currencyId( currency1 )}` )
                                } }
                                className="font-extrabold text-sm"
                            >
                                { i18n._( t`Add` ) }
                            </Button>
                        </div>
                    ) }
                </div>
            </Transition>
        </div>
    )
}

export function PositionCard ( { pair, farm, showUnwrapped = false, border }: PositionCardProps ) {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    const liquidityToken = new Token(
        // @ts-ignore TYPE NEEDS FIXING
        chainId,
        getAddress( farm.lpToken ),
        farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18,
        'SLP'
    )
    const { stakedAmount: userPoolBalance } = useUserInfo( farm, liquidityToken )
    const totalPoolTokens = useTotalSupply( pair?.liquidityToken )

    if ( !pair ) return <></>

    const currency0 = showUnwrapped ? pair?.token0 : unwrappedToken( pair?.token0 )
    const currency1 = showUnwrapped ? pair?.token1 : unwrappedToken( pair?.token1 )

    const poolTokenPercentage =
        !!userPoolBalance &&
            !!totalPoolTokens &&
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? new Percent( userPoolBalance.quotient, totalPoolTokens.quotient )
            : undefined

    const [ token0Deposited, token1Deposited ] =
        !!pair &&
            !!totalPoolTokens &&
            !!userPoolBalance &&
            // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
            JSBI.greaterThanOrEqual( totalPoolTokens.quotient, userPoolBalance.quotient )
            ? [
                pair.getLiquidityValue( pair.token0, totalPoolTokens, userPoolBalance, false ),
                pair.getLiquidityValue( pair.token1, totalPoolTokens, userPoolBalance, false ),
            ]
            : [ undefined, undefined ]

    return (
        <>
            { userPoolBalance && JSBI.greaterThan( userPoolBalance.quotient, JSBI.BigInt( 0 ) ) ? (
                <div className="w-full p-0 text-sm rounded">
                    <AutoColumn gap={ 'md' }>
                        <div className="flex justify-between">
                            <div>Your Deposits</div>
                            <div className="flex gap-1">
                                <div>{ userPoolBalance ? userPoolBalance.toSignificant( 4 ) : '-' } </div>
                                <div>
                                    { currency0.symbol }/{ currency1.symbol }
                                </div>
                                <div className="text-white">${ ( Number( userPoolBalance.toExact() ) * farm?.lpPrice ).toFixed( 2 ) }</div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={ pair.token0 } size={ 20 } />
                                <div>
                                    { token0Deposited?.toSignificant( 6 ) } { currency0.symbol }
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={ pair.token1 } size={ 20 } />
                                <div>
                                    { token1Deposited?.toSignificant( 6 ) } { currency1.symbol }
                                </div>
                            </div>
                        </div>
                    </AutoColumn>
                </div>
            ) : (
                <div className="w-full p-0 text-sm rounded">
                    <AutoColumn gap={ 'md' }>
                        <div className="flex justify-between">
                            <div>Your Deposits</div>
                            <div className="flex gap-1">
                                <div>0</div>
                                <div>
                                    { currency0.symbol }/{ currency1.symbol }
                                </div>
                                <div className="text-white">$0.0</div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={ pair.token0 } size={ 20 } />
                                <div>0 { currency0.symbol }</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={ pair.token1 } size={ 20 } />
                                <div>0 { currency1.symbol }</div>
                            </div>
                        </div>
                    </AutoColumn>
                </div>
            ) }
        </>
    )
}

export function RewardCard ( { reward } ) {
    const { chainId } = useActiveWeb3React()
    const NATIVE = useCurrency( EvmoSwap[ chainId ].address )
    const rewardToken = useCurrency( reward?.tokens[ 0 ] )
    const rewardAmounts = formatBalance( reward?.amounts[ 0 ] ? reward?.amounts[ 0 ] : 0 )

    return (
        <>
            <div className="w-full p-0 text-sm rounded">
                <AutoColumn gap={ 'md' }>
                    <div className="flex justify-between">
                        <div>Your Rewards</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <CurrencyLogo currency={ NATIVE } size={ 20 } />
                        <div>{ `${Number( rewardAmounts ).toString()} ${rewardToken?.symbol}` }</div>
                    </div>
                </AutoColumn>
            </div>
        </>
    )
}
export function MultiRewardsCard ( { rewards }: { rewards: CurrencyAmount<Token | Currency>[] } ) {
    return (
        <>
            <div className="w-full p-0 text-sm rounded">
                <AutoColumn gap={ 'md' }>
                    <div className="flex justify-between">
                        <div>Your Rewards</div>
                    </div>
                    { rewards.map( ( reward, index ) => (
                        <div className="flex items-center gap-2" key={ index }>
                            <CurrencyLogo currency={ reward.currency } size={ 20 } />
                            <div>{ `${reward?.toExact()} ${reward?.currency?.symbol}` }</div>
                        </div>
                    ) ) }
                </AutoColumn>
            </div>
        </>
    )
}
