import React, { ReactNode, useState } from 'react'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import { EvmoSwap } from '../../config/tokens'
import Container from '../../components/Container'
import { useActiveWeb3React } from '../../services/web3'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTokenInfo } from 'app/features/farm/hooks'
import { useEmosContract } from 'app/hooks/useContract'
import Card from 'app/components/Card'
import { t } from '@lingui/macro'
import Image from 'next/image'
import ButtonNew from 'app/components/Button/index.new'
import Web3Connect from 'app/components/Web3Connect'
import Button from 'app/components/Button'
import Input from 'app/components/Input'
import { classNames, formatBalance, formatNumber, formatNumberScale, formatPercent, tryParseAmount } from 'app/functions'
import { ZERO } from '@evmoswap/core-sdk'
import { RowBetween } from 'app/components/Row'
import { getAPY } from 'app/features/staking/useStaking'
import { useLockedBalance } from 'app/features/boostv3/hooks/useLockedBalance'
import { getBalanceAmount } from 'app/functions/formatBalance'
import { useRewardPool } from 'app/features/boostv3/hooks/useRewardPool'
import { Zero } from '@ethersproject/constants'

const INPUT_CHAR_LIMIT = 18

const token = {
    name: 'EvmoSwap Token',
    symbol: 'EMO',
    icon: '/icons/icon-72x72.png',
    balance: 30,
};
const tabStyle = 'rounded-lg p-3'
const activeTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-blue`
const inactiveTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-transparent text-secondary`

interface StatButtonProps {
    title: string,
    value: string,
    icon: ReactNode
}

const StatButton = ( props: StatButtonProps ) => {
    const { icon, title, value } = props;

    return <ButtonNew
        endIcon={ icon }
        className="bg-dark-700 hover:bg-darker px-0 py-4 justify-evenly h-auto"
    >
        <div className="flex flex-col space-y-2 text-left">
            <div className="px-1 text-primary text-xs md:truncate">{ title }</div>
            <div className="px-1 text-primary text-xl md:text-lg xl:text-xl md:truncate">{ value }</div>
        </div>
    </ButtonNew>
}

//stake lock period
const LOCK_PERIODS = [
    { multiplier: 1.2, week: 13, day: 90, title: 'Lock 90 days', hint: 'Locked 90 days and enjoy {multiplier} rewards.' },
    { multiplier: 1.5, week: 26, day: 180, title: 'Lock 180 days', hint: 'Locked 180 days and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52, day: 360, title: 'Lock 360 days', hint: 'Locked 360 days and enjoy {multiplier} rewards.' },
]

export default function Boostv3 () {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    const balance = useTokenBalance( account ?? undefined, EvmoSwap[ chainId ] )
    const rewards = useRewardPool();
    const emosInfo = useTokenInfo( useEmosContract() )
    const { lockAmount, lockEnd, veEmos, emosSupply, veEmosSupply } = useLockedBalance()
    const [ activeTab, setActiveTab ] = useState( 0 );

    const [ input, setInput ] = useState( '' )
    const [ usingBalance, setUsingBalance ] = useState( false )
    const parsedAmount = usingBalance ? balance : tryParseAmount( input, balance?.currency )
    console.log( { rewards, lockAmount, lockEnd, veEmos, veEmosSupply, emosSupply } )
    const handleInput = ( v: string ) => {
        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setUsingBalance( false )
            setInput( v )
        }
    }

    const insufficientFunds = ( balance && balance.equalTo( ZERO ) ) || parsedAmount?.greaterThan( balance )
    const inputError = insufficientFunds

    const [ lockPeriod, setLockPeriod ] = useState( LOCK_PERIODS[ 0 ] );

    const { manualAPY: APR } = getAPY()

    return (
        <Container id="boostv3-page" className="py-4 md:py-8 lg:py-12" maxWidth="full">
            <Head>
                <title key="title">Boostv3 | EvmoSwap</title>
                <meta key="description" name="description" content="Boost EvmoSwap" />
            </Head>
            <div className="flex flex-col justify-start flex-grow w-full h-full px-4 md:px-16 py-4">
                <div className="flex flex-col md:flex-row w-full gap-8">

                    {/** col 1 */ }
                    <div className="flex flex-col w-full lg:w-3/5 space-y-8">

                        <div className=" grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-8 p-4 xl:p-6 rounded bg-dark-900  bg-opacity-60">

                            <StatButton
                                icon={
                                    <Image
                                        src={ token.icon }
                                        alt={ token.symbol }
                                        width="24px"
                                        height="24px"
                                        objectFit="contain"
                                        className="rounded-md"
                                    />
                                }
                                title={ i18n._( t`Total Locked` ) }
                                value={
                                    `
                                    ${formatNumberScale(
                                        formatNumber(
                                            Number( formatBalance( emosSupply ? emosSupply : 1 ) ) /
                                            Number( emosInfo.circulatingSupply ? emosInfo.circulatingSupply : 1 )
                                        )
                                    )}
                                    ${token.symbol}
                                    `
                                }
                            />

                            <StatButton
                                icon={
                                    <Image
                                        src={ token.icon }
                                        alt={ token.symbol }
                                        width="24px"
                                        height="24px"
                                        objectFit="contain"
                                        className="rounded-md"
                                    />
                                }
                                title={ i18n._( t`Circulating Supply` ) }
                                value={ `${formatNumberScale( emosInfo.circulatingSupply )} ${token.symbol}` }
                            />

                            <StatButton
                                icon={
                                    <Image
                                        src={ token.icon }
                                        alt={ token.symbol }
                                        width="24px"
                                        height="24px"
                                        objectFit="contain"
                                        className="rounded-md"
                                    />
                                }
                                title={ i18n._( t`Monthly Emissions` ) }
                                value={ i18n._( t`${formatNumberScale( emosInfo.burnt )} ${token.symbol}` ) }
                            />
                        </div>

                        <Card
                            header={ <div className="flex items-center space-x-4">
                                <Image
                                    src={ token.icon }
                                    alt={ token.symbol }
                                    width="24px"
                                    height="24px"
                                    objectFit="contain"
                                    className="rounded-md"
                                />
                                <div className="text-lg text-high-emphesis">{ i18n._( t`${token.symbol} Rewards` ) }</div>
                            </div>
                            }
                            className="p-4 rounded bg-dark-900 bg-opacity-60 w-full h-full"
                        >
                            <h3 className="text-lg font-bold">{ i18n._( t`For liquidity provider` ) }:</h3>
                            <ul className="list-disc ml-4 my-4">
                                <li>{ i18n._( t`${token.symbol} rewards are vested for 3 months, but can be claimed early at a 50% penalty or can be claimed all and lock for 90 days/180 days/360 days to boost rewards.` ) }</li>
                                <li>{ i18n._( t`Exiting a vest early always incurs a 50% penalty no matter how early or late you choose to exit.` ) }</li>
                                <li>{ i18n._( t`The 50% penalty paid are distributed continuously to ${token.symbol} lockers.` ) }</li>
                            </ul>


                            <h3 className="text-lg my-4 mt-12 font-bold">{ i18n._( t`For ${token.symbol} lockers` ) }:</h3>
                            <ul className="list-disc ml-4">
                                <li>{ i18n._( t`The lock date are grouped by the week. Any lock between Thursday 00:00 UTC to Wednesday 23:59 UTC are grouped in the same week group` ) }.</li>
                                <li>{ i18n._( t`Locked ${token.symbol} cannot be unlocked before the expiry of the selected locked period.` ) }</li>
                                <li>{ i18n._( t`${token.symbol} reward from locking ${token.symbol} can be claimed anytime with no penalty.` ) }</li>
                            </ul>
                        </Card>
                    </div>

                    {/** col 2 */ }
                    <div className="flex flex-col w-full lg:w-2/5 space-y-8">

                        {/** Claim reward */ }
                        <div className="p-4 space-y-4 rounded bg-dark-900 bg-opacity-80">
                            <div className="flex flex-col divide-y divide-dark-700 w-full">
                                <div className="mb-4 text-lg text-high-emphesis">{ i18n._( t`${token.symbol} Staking and Lock Rewards` ) }</div>
                                <span></span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-0 w-full justify-between p-2 py-4">
                                <div className="col-span-2">
                                    <div className="text-lg mb-4">{ i18n._( t`Rewards` ) }</div>
                                    <div>
                                        {
                                            rewards && rewards.tokens.map( ( rewardToken, i ) => (
                                                <span>{ formatNumber( rewards.amounts[ i ].toSignificant( 18 ) ) } { rewardToken.symbol }</span>
                                            ) )
                                        }
                                    </div>
                                </div>


                                <div className="flex items-center">
                                    {
                                        rewards && rewards.total.lte( 0 ) ? (
                                            <Button color="red" className="truncate opacity-80" disabled>
                                                { i18n._( t`No rewards` ) }
                                            </Button>
                                        ) : !account ? (
                                            <Web3Connect color="blue" className="truncate" />
                                        ) : <Button color="blue" className="bg-blue w-full lg:w-[90%] lg:truncate lg:hover:whitespace-normal" variant="filled">
                                            { i18n._( t`Claim Rewards` ) }
                                        </Button>
                                    }
                                </div>
                            </div>
                        </div>

                        {/** Staking and Locking */ }
                        <div className="p-4 rounded bg-dark-900 h-full bg-opacity-80">

                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="text-lg text-high-emphesis">{ i18n._( t`Staking ${token.symbol}` ) }</div>
                                <div className="grid grid-cols-2 gap-0 p-1 rounded border-[0.5px]">
                                    <button
                                        className={ activeTab === 1 ? activeTabStyle : inactiveTabStyle }
                                        onClick={ () => {
                                            setActiveTab( 1 )
                                        } }
                                    >
                                        { i18n._( t`Lock` ) }
                                    </button>

                                    <button
                                        className={ activeTab === 0 ? activeTabStyle : inactiveTabStyle }
                                        onClick={ () => {
                                            setActiveTab( 0 )
                                        } }
                                    >
                                        { i18n._( t`Stake` ) }
                                    </button>
                                </div>
                            </div>

                            { /** Stake tab content */
                                activeTab === 0 &&
                                <div className="mt-8">
                                    <ul className="text-yellow text-sm text-high-emphesis list-[circle] ml-4">
                                        <li>
                                            { i18n._( t`Stake ${token.symbol} and earn platform fees in USDC without lock-up.` ) }
                                        </li>
                                    </ul>

                                    <RowBetween className="mt-6">
                                        <div>{ i18n._( t`Balance` ) }: { balance?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                        <div>{ i18n._( t`APR` ) }: { formatPercent( APR ) }</div>
                                    </RowBetween>
                                    <div>
                                        <Input.Numeric
                                            value={ input }
                                            onUserInput={ handleInput }
                                            className={ classNames(
                                                'w-full h-14 px-3 md:px-5 my-2 mb-6  rounded bg-dark-700 text-sm md:text-xl font-bold text-dark-900 whitespace-nowrap caret-high-emphesis',
                                                inputError ? ' pl-9 md:pl-12' : ''
                                            ) }
                                            placeholder="0.0"
                                        />
                                        <button
                                            className="absolute rounded p-2 -ml-16 mt-[0.9rem] border border-blue hover:bg-blue hover:bg-opacity-20"
                                            onClick={ () => {
                                                if ( !balance.equalTo( ZERO ) ) {
                                                    setInput( balance?.toSignificant( balance.currency.decimals ) )
                                                }
                                            } }>
                                            { i18n._( t`MAX` ) }
                                        </button>
                                    </div>

                                    <div className="flex items-center">
                                        {
                                            token.balance <= 0 ? (
                                                <Button color="red" className="truncate" disabled>
                                                    { i18n._( t`Insufficient Balance` ) }
                                                </Button>
                                            ) : !account ? (
                                                <Web3Connect color="blue" className="truncate" />
                                            ) : <Button color="blue" className="bg-blue truncate" variant="filled">
                                                { i18n._( t`Stake` ) }
                                            </Button>
                                        }
                                    </div>
                                </div>
                            /** Stake tab content */ }



                            {/** Lock tab content */
                                activeTab === 1 &&
                                <div className="mt-8">
                                    <ul className="text-yellow text-sm text-high-emphesis list-[circle] ml-4 flex flex-col space-y-3">
                                        <li>
                                            { i18n._( t`Lock ${token.symbol} and earn platform fees in USDC and penalty fees in unlocked PBR.` ) }
                                        </li>
                                        <li>
                                            { i18n._( t`Locked ${token.symbol} will continue to earn fees after the locks expire if you do not withdraw.` ) }
                                        </li>
                                    </ul>

                                    <RowBetween className="mt-8">
                                        <div>{ i18n._( t`Balance` ) }: { balance?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                        <div>{ i18n._( t`APR` ) }: { formatPercent( APR ) }</div>
                                    </RowBetween>
                                    <div>
                                        <Input.Numeric
                                            value={ input }
                                            onUserInput={ handleInput }
                                            className={ classNames(
                                                'w-full h-14 px-3 md:px-5 my-2 mb-6  rounded bg-dark-700 text-sm md:text-xl font-bold text-dark-900 whitespace-nowrap caret-high-emphesis',
                                                inputError ? ' pl-9 md:pl-12' : ''
                                            ) }
                                            placeholder="0.0"
                                        />
                                        <button className="absolute rounded p-2 -ml-16 mt-[0.9rem] border border-blue hover:bg-blue hover:bg-opacity-20" onClick={ () => setInput( String( token.balance ) ) }>
                                            { i18n._( t`MAX` ) }
                                        </button>
                                    </div>

                                    {/** lock actions */ }
                                    <div className="my-4">
                                        <div className="flex flex-cols flex-wrap">
                                            {
                                                LOCK_PERIODS.map( ( period, index ) => (
                                                    <Button
                                                        key={ index }
                                                        variant={ lockPeriod.day === period.day ? "filled" : "outlined" }
                                                        color={ "blue" }
                                                        size={ "sm" }
                                                        className={ "w-auto ml-2 mb-2" }
                                                        onClick={ () => setLockPeriod( period ) }
                                                    >
                                                        { period.title }
                                                    </Button>
                                                ) )
                                            }
                                        </div>
                                        <p className="text-red w-full mt-2">* { lockPeriod.hint.replace( '{multiplier}', String( lockPeriod.multiplier + "x" ) ) }</p>
                                    </div>



                                    <div className="flex items-center mb-5">
                                        {
                                            token.balance <= 0 ? (
                                                <Button color="red" className="truncate" disabled>
                                                    { i18n._( t`Insufficient Balance` ) }
                                                </Button>
                                            ) : !account ? (
                                                <Web3Connect color="blue" className="truncate" />
                                            ) : <Button color="blue" className="bg-blue truncate" variant="filled">
                                                { i18n._( t`Lock` ) }
                                            </Button>
                                        }
                                    </div>
                                </div>
                            /** End Lock tab content */ }

                        </div>
                    </div>
                </div>

                {/** Table rows */ }
                <div className="flex flex-col w-full">

                    {/** Vesting table */ }
                    <div className="w-full mt-12">
                        <h2 className="font-bold text-lg">{ i18n._( t`Vesting EVMOS` ) }</h2>
                        <div className="relative overflow-auto">
                            <table className="border-collapse table-auto w-full text-sm mt-4">
                                <thead className="bg-dark-900 bg-opacity-80">
                                    <tr>
                                        <th className="text-center p-4 rounded-tl">{ i18n._( t`Expiry Time` ) }</th>
                                        <th className="text-center p-4">{ i18n._( t`Amount` ) }</th>
                                        <th className="text-center p-4 rounded-tr">{ i18n._( t`Action` ) }</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-800">

                                    {
                                        [ 1, 2 ].map( ( index ) => (
                                            <tr key={ index }>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">18th January 199</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">200 { token.symbol }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">
                                                    <Button variant="outlined" color="blue">{ i18n._( t`Claim` ) }</Button>
                                                </td>
                                            </tr>
                                        ) )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/** Staked table */ }
                    <div className="w-full mt-12">
                        <RowBetween className="md:items-center flex-col md:flex-row">
                            <h2 className="font-bold text-lg">{ i18n._( t`Staked EVMOS` ) }</h2>
                            <div className="flex space-x-2">
                                <Button variant="outlined" color="green" className="border-0" disabled>{ i18n._( t`Withdraw all staked` ) }</Button>
                                <Button variant="outlined" color="red">{ i18n._( t`Withdraw all unlocked` ) }</Button>
                            </div>
                        </RowBetween>
                        <div className="relative overflow-auto">
                            <table className="border-collapse table-auto w-full text-sm mt-3">
                                <thead className="bg-dark-900 bg-opacity-80">
                                    <tr>
                                        <th className="text-center p-4 rounded-tl">{ i18n._( t`Staked Time` ) }</th>
                                        <th className="text-center p-4">{ i18n._( t`Lock State` ) }</th>
                                        <th className="text-center p-4">{ i18n._( t`Amount` ) }</th>
                                        <th className="text-center p-4">{ i18n._( t`Multiplier` ) }</th>
                                        <th className="text-center p-4 rounded-tr">{ i18n._( t`APR` ) }</th>

                                    </tr>
                                </thead>
                                <tbody className="bg-dark-800">

                                    {
                                        [ 1, 2 ].map( ( index ) => (
                                            <tr key={ index }>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">18th January 199</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">Locked</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">200 { token.symbol }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">1.2x</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">
                                                    23.00%
                                                </td>
                                            </tr>
                                        ) )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Container >
    )
}