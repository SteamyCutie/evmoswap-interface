import React, { ReactNode, useMemo, useState } from 'react'
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
import { Currency, CurrencyAmount, ZERO } from '@evmoswap/core-sdk'
import { RowBetween } from 'app/components/Row'
import { getAPY } from 'app/features/staking/useStaking'
import { useLockedBalance, useRewardsBalance, useStakingBalance } from 'app/features/boostv3/hooks/balances'
import { useRewardPool } from 'app/features/boostv3/hooks/useRewardPool'
import Dots from 'app/components/Dots'
import { timestampToDate } from 'app/features/boostv3/functions/app'
import { BigNumber } from '@ethersproject/bignumber'
import { VOTING_ESCROW_ADDRESS } from 'app/constants/addresses'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import useVotingEscrow from 'app/features/boost/useVotingEscrow'
import { addDays, getUnixTime } from 'date-fns'

interface StatButtonProps {
    title: string,
    value: string,
    icon: ReactNode
}
type VestingRow = {
    unlockTime: string, amount: CurrencyAmount<Currency>, expired: boolean;
}

const INPUT_CHAR_LIMIT = 18
const MAX_WEEK = 52 * 4
const SECS_IN_WEEK = 7 * 86400

const emosIcon = "/icons/icon-72x72.png";
const tabStyle = 'rounded-lg p-3'
const activeTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-blue`
const inactiveTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-transparent text-secondary`
const actionBtnColor = "gradient";

//stake lock period
const LOCK_PERIODS = [
    { multiplier: 1.2, week: 1, day: 7, title: '7 days', hint: 'Locked 7 days and enjoy {multiplier} rewards.' },
    //{ multiplier: 1.2, week: 2, day: 14, title: '2 weeks', hint: 'Locked 14 days and enjoy {multiplier} rewards.' },
    { multiplier: 1.2, week: 13, day: 90, title: '3 months', hint: 'Locked 3 months and enjoy {multiplier} rewards.' },
    //{ multiplier: 1.5, week: 26, day: 180, title: '6 months', hint: 'Locked 180 days and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52, day: 360, title: '1 year', hint: 'Locked 2 years and enjoy {multiplier} rewards.' },
    //{ multiplier: 2.5, week: 52 * 2, day: 360 * 2, title: '2 year', hint: 'Locked 2 years and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52 * 4, day: 360 * 4, title: '4 years', hint: 'Locked 4 years and enjoy {multiplier} rewards.' },
]

export default function Boostv3 () {

    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const balance = useTokenBalance( account ?? undefined, EvmoSwap[ chainId ] )
    const token = balance?.currency || { symbol: '' };

    const { createLockWithMc, increaseAmountWithMc, increaseUnlockTimeWithMc, withdrawWithMc } = useVotingEscrow()
    const { harvestRewards, withdrawEarnings } = useRewardPool();
    const { manualAPY: APR } = getAPY()

    const [ pendingTx, setPendingTx ] = useState( false )
    const [ pendingLock, setPendingLock ] = useState( false )
    const [ withdrawing, setWithdrawing ] = useState( false )

    const emosInfo = useTokenInfo( useEmosContract() )
    const { lockEnd, lockAmount, emosSupply } = useLockedBalance()
    const { earnedBalances, withdrawableBalance } = useStakingBalance();
    const rewards = useRewardsBalance();
    const showVesting = withdrawableBalance ? BigNumber.from( withdrawableBalance.penaltyAmount ).gt( 0 ) : false

    const [ activeTab, setActiveTab ] = useState( 0 );

    const [ input, setInput ] = useState( '' )
    const [ usingBalance, setUsingBalance ] = useState( false )
    const parsedAmount = useMemo( () => {
        return usingBalance ? balance : tryParseAmount( input, balance?.currency );
    }, [ input, balance ] );

    const [ approvalState, approve ] = useApproveCallback( parsedAmount, VOTING_ESCROW_ADDRESS[ chainId ] )

    const insufficientFunds = !balance?.greaterThan( ZERO ) || ( parsedAmount?.greaterThan( ZERO ) && parsedAmount?.greaterThan( balance ) )
    const inputError = insufficientFunds

    const [ week, setWeek ] = useState( '' )
    const [ lockPeriod, setLockPeriod ] = useState( LOCK_PERIODS[ 0 ] );
    const lockDays = Number( week ? week : lockPeriod.week ) * 7
    const newLockTime = Math.floor( getUnixTime( addDays( Date.now(), lockDays ) ) / SECS_IN_WEEK ) * SECS_IN_WEEK;
    const lockTimeBtnDisabled = pendingLock || newLockTime <= lockEnd;
    const lockExpired = lockEnd && getUnixTime( Date.now() ) >= lockEnd;
    const amountBtnDisabled = pendingLock || !input || insufficientFunds;
    const lockBtnDisabled = pendingLock || !input;

    const vestingRows = useMemo( () => {
        const rows = [];

        if ( withdrawableBalance ) {
            rows.push( {
                unlockTime: "-",
                amount: CurrencyAmount.fromRawAmount( balance?.currency, withdrawableBalance?.amount?.toString() || "0" ),
                expired: true,
            } )
        }

        if ( earnedBalances && earnedBalances?.earningsData?.length )
            earnedBalances.earningsData.map( ( earning: { unlockTime: number; amount: number } ) => {
                rows.push( {
                    unlockTime: timestampToDate( earning?.unlockTime?.toString() ),
                    amount: CurrencyAmount.fromRawAmount( balance?.currency, earning?.amount?.toString() || "0" ),
                    expired: false,
                } )
            } )
        return rows;
    }, [ earnedBalances, withdrawableBalance, balance?.currency ] )


    const handleInput = ( v: string ) => {

        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setUsingBalance( false )
            setInput( v )
        }
    }

    const handleWeek = ( v: string ) => {

        const vN = parseInt( v );
        if ( vN === 0 || v === '' ) {

            setWeek( '' );
            return;
        }

        if ( vN > 0 && vN < MAX_WEEK )
            setWeek( String( vN ) )
    }

    const handleLockPeriod = ( period ) => {

        if ( week ) setWeek( '' );
        setLockPeriod( period )
    }


    const handleLock = async () => {

        //console.log( new Date( newLockTime * 1000 ), newLockTime, lockDays )
        if ( !input ) return;

        setPendingLock( true )

        if ( approvalState === ApprovalState.NOT_APPROVED ) {
            const success = await sendTx( () => approve() )
            if ( !success ) {
                setPendingLock( false )
                return
            }
        }

        const success = await sendTx( () => createLockWithMc( parsedAmount, newLockTime ) )
        if ( !success ) {
            setPendingLock( false )
            return
        }

        handleInput( '' )
        setPendingLock( false )
    }

    const handleIncreaseAmount = async () => {

        //console.log( new Date( newLockTime * 1000 ), newLockTime, lockDays )
        if ( !input ) return;

        setPendingLock( true )

        const success = await sendTx( () => increaseAmountWithMc( parsedAmount ) )
        if ( !success ) {
            setPendingLock( false )
            return
        }

        handleInput( '' )
        setPendingLock( false )
    }

    const handleIncreaseLock = async () => {

        if ( lockTimeBtnDisabled ) return

        setPendingLock( true )

        const success = await sendTx( () => increaseUnlockTimeWithMc( newLockTime ) )
        if ( !success ) {
            setPendingLock( false )
            return
        }

        handleInput( '' )
        setPendingLock( false )
    }

    const handleClaimRewards = async () => {

        setPendingTx( true )
        const success = await sendTx( () => ( harvestRewards() ) )
        console.log( success )
        if ( !success ) {
            setPendingTx( false )
            return
        }

        setPendingTx( false )
    }

    const handleWithdrawWithPenalty = async () => {

        if ( !withdrawableBalance ) return;

        setWithdrawing( true )

        const amount = BigNumber.from( withdrawableBalance.penaltyAmount );
        const success = await sendTx( () => ( withdrawEarnings( amount ) ) )

        console.log( success, amount.toFixed( 4 ) )

        if ( !success ) {
            setWithdrawing( false )
            return
        }

        setWithdrawing( false )
    }

    const handleWithdrawWith = async () => {

        if ( !lockExpired ) return

        setPendingLock( true )

        const success = await sendTx( () => withdrawWithMc() )

        if ( !success ) {
            setPendingLock( false )
            return
        }

        handleInput( '' )
        setPendingLock( false )
    }

    return (
        <Container id="boostv3-page" className="py-4 md:py-8 lg:py-12" maxWidth="7xl">
            <Head>
                <title key="title">Boostv3 | EvmoSwap</title>
                <meta key="description" name="description" content="Boost EvmoSwap" />
            </Head>
            <div className="flex flex-col justify-start flex-grow w-full h-full px-4 md:px-6 py-4">
                <div className="flex flex-col md:flex-row w-full gap-8">

                    {/** col 1 */ }
                    <div className="flex flex-col w-full lg:w-3/5 space-y-8">

                        <div className=" grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-8 p-4 xl:p-6 rounded bg-dark-900  bg-opacity-60">

                            <StatButton
                                icon={
                                    <Image
                                        src={ emosIcon }
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
                                        src={ emosIcon }
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
                                        src={ emosIcon }
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
                                    src={ emosIcon }
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
                                <div className="mb-4 text-lg text-high-emphesis">{ i18n._( t`${token.symbol} Lock Rewards` ) }</div>
                                <span></span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-0 w-full justify-between p-2 py-4">
                                <div className="col-span-2">
                                    <div className="text-lg mb-4">{ i18n._( t`Rewards` ) }</div>
                                    <div>
                                        {
                                            rewards && rewards.tokens.map( ( rewardToken, i ) => (
                                                <span key={ i }>{ rewards.amounts[ i ].toFixed( 4 ) } { rewardToken.symbol }</span>
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
                                        ) : <Button onClick={ handleClaimRewards } disabled={ pendingTx } color="blue" className="w-full disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal" variant="filled">
                                            { pendingTx ? <Dots>{ i18n._( t`Harvesting` ) } </Dots> : i18n._( t`Claim Rewards` ) }
                                        </Button>
                                    }
                                </div>
                            </div>
                        </div>

                        {/** Staking and Locking */ }
                        <div className="p-4 rounded bg-dark-900 h-full bg-opacity-80">

                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="text-lg text-high-emphesis">{ i18n._( t`Lock ${token.symbol}` ) }</div>
                            </div>


                            {/** Lock tab content */

                                <div className="mt-8">
                                    <ul className="text-yellow text-sm text-high-emphesis list-[circle] ml-4 flex flex-col space-y-3">
                                        <li>
                                            { i18n._( t`Locked ${token.symbol} will continue to earn fees after the locks expire if you do not withdraw.` ) }
                                        </li>
                                    </ul>

                                    { lockAmount.greaterThan( ZERO ) && <RowBetween className="mt-8">
                                        <div>{ i18n._( t`Locked` ) }: { lockAmount?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                        <div>{ lockExpired ? <span>{ i18n._( t`Expired` ) }!</span> : <span>{ i18n._( t`Ends` ) }: { timestampToDate( lockEnd ) }</span> }</div>
                                    </RowBetween>
                                    }

                                    { !lockExpired && <React.Fragment>

                                        {/** Lock update tab toggle */ }
                                        { lockAmount.greaterThan( ZERO ) && <div className="grid grid-cols-2 gap-0 p-1 rounded border-[0.5px] mt-4 mb-8">
                                            <button
                                                className={ activeTab === 0 ? activeTabStyle : inactiveTabStyle }
                                                onClick={ () => {
                                                    setActiveTab( 0 )
                                                } }
                                            >
                                                { i18n._( t`Update Amount` ) }
                                            </button>

                                            { <button
                                                className={ activeTab === 1 ? activeTabStyle : inactiveTabStyle }
                                                onClick={ () => {
                                                    setActiveTab( 1 )
                                                } }
                                            >
                                                { i18n._( t`Update Period` ) }
                                            </button> }
                                        </div>
                                        }

                                        {/** input */ }
                                        { ( activeTab === 0 || !lockAmount.greaterThan( ZERO ) ) &&
                                            <RowBetween className="mt-8">
                                                <div>{ i18n._( t`Balance` ) }: { balance?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                                <div>{ i18n._( t`APR` ) }: { formatPercent( APR ) }</div>
                                            </RowBetween>
                                        }
                                        { ( activeTab === 0 || !lockAmount.greaterThan( ZERO ) ) &&
                                            <div>
                                                <Input.Numeric
                                                    value={ input }
                                                    onUserInput={ handleInput }
                                                    className={ classNames(
                                                        'w-full h-14 px-3 md:px-5 my-2 mb-6  rounded bg-dark-700 text-sm md:text-xl font-bold whitespace-nowrap caret-high-emphesis',
                                                        inputError ? 'text-red' : ''
                                                    ) }
                                                    placeholder="0.0"
                                                />
                                                <button className="absolute rounded p-2 -ml-16 mt-[0.9rem] border border-blue hover:bg-blue hover:bg-opacity-20"
                                                    onClick={ () => {
                                                        if ( !balance?.equalTo( ZERO ) ) {
                                                            setInput( balance?.toSignificant( balance?.currency.decimals ) )
                                                        }
                                                    } }>
                                                    { i18n._( t`MAX` ) }
                                                </button>
                                            </div>
                                        }

                                        {/** lock actions */ }
                                        { ( activeTab === 1 || !lockAmount.greaterThan( ZERO ) ) &&
                                            <div className="my-4">
                                                <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-3">
                                                    {
                                                        LOCK_PERIODS.map( ( period, index ) => (
                                                            <Button
                                                                key={ index }
                                                                variant={ lockPeriod.day === period.day && !week ? "filled" : "outlined" }
                                                                color={ "blue" }
                                                                size={ "sm" }
                                                                className={ "w-auto ml-2 mb-2" }
                                                                onClick={ () => handleLockPeriod( period ) }
                                                            >
                                                                { period.title }
                                                            </Button>
                                                        ) )
                                                    }
                                                    <Input.Numeric
                                                        value={ week }
                                                        onUserInput={ handleWeek }
                                                        className={ classNames(
                                                            'w-48 h-auto min-h-[3rem] flex-none h-auto px-3 md:px-5 ml-2 mb-2 rounded  text-sm md:text-xl font-bold caret-high-emphesis',
                                                            inputError ? ' pl-9 md:pl-12' : '',
                                                            week ? 'bg-blue text-white bg-opacity-50' : 'bg-dark-700 text-dark-900'
                                                        ) }
                                                        placeholder={ i18n._( t`Custom week` ) }
                                                        max={ MAX_WEEK }
                                                        min={ 1 }
                                                        step={ 1 }
                                                    />
                                                </div>
                                            </div>
                                        }
                                    </React.Fragment> }

                                    {/** action buttons */ }
                                    <div className="flex-col space-y-4 items-center mb-5">
                                        {
                                            !account && <Web3Connect color="blue" className="truncate" />
                                        }
                                        {
                                            account && !lockExpired && <>
                                                {
                                                    !lockAmount.greaterThan( ZERO ) ? (
                                                        insufficientFunds ? (
                                                            <Button color="red" className="truncate" disabled>
                                                                { i18n._( t`Insufficient Balance` ) }
                                                            </Button>
                                                        ) : ( <Button onClick={ handleLock } disabled={ lockBtnDisabled } color={ lockBtnDisabled ? "gray" : actionBtnColor } className="bg-blue truncate disabled:bg-grey" variant="filled">
                                                            { pendingLock ? <Dots>{ i18n._( t`Locking` ) } </Dots> : i18n._( t`${!input ? 'Enter amount' : 'Lock'}` ) }
                                                        </Button>
                                                        )
                                                    ) : (
                                                        <React.Fragment>
                                                            { activeTab === 0 && <Button onClick={ handleIncreaseAmount } disabled={ amountBtnDisabled } color={ amountBtnDisabled ? "gray" : actionBtnColor } className="bg-blue truncate disabled:bg-grey w-full" variant="filled">
                                                                { pendingLock ? <Dots>{ i18n._( t`Increasing amount` ) } </Dots> : i18n._( t`${!input ? 'Enter amount' : ( insufficientFunds ? 'Insufficient Balance' : 'Increase Amount' )}` ) }
                                                            </Button> }

                                                            { activeTab === 1 && <Button onClick={ handleIncreaseLock } disabled={ lockTimeBtnDisabled } color={ lockTimeBtnDisabled ? "blue" : actionBtnColor } className="bg-blue truncate disabled:bg-grey w-full" variant="filled">
                                                                { pendingLock ? <Dots>{ i18n._( t`Increasing lock period` ) } </Dots> : i18n._( t`${!week && !lockPeriod ? 'Select period' : ( lockTimeBtnDisabled ? 'Higher period required' : 'Increase Lock Period' )}` ) }
                                                            </Button> }
                                                        </React.Fragment>
                                                    )
                                                }
                                            </>
                                        }
                                        {
                                            ( !!account && !!lockExpired ) && <Button
                                                color="gradient"
                                                className="mt-4"
                                                onClick={ handleWithdrawWith }
                                                disabled={ !lockExpired }
                                            >
                                                { pendingLock ? <Dots>{ i18n._( t`Withdrawing` ) } </Dots> : <span>{ i18n._( t`Withdraw` ) } { token?.symbol } !</span> }
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
                                        <th className="text-center p-4 rounded-tr" colSpan={ 2 }>{ i18n._( t`Action` ) }</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-800">

                                    {
                                        vestingRows.length ? vestingRows.map( ( row: VestingRow, index ) => (
                                            <tr key={ index }>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">{ row.unlockTime }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900">{ row.amount.toExact() } { token.symbol }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-900" colSpan={ 2 }>
                                                    {
                                                        index === 0 && row.expired && showVesting && <div className='h-full w-full flex flex-col space-y-8 items-center'>
                                                            <Button variant="outlined" color="red" onClick={ handleWithdrawWithPenalty } disabled={ withdrawing }> { withdrawing ? <Dots>{ i18n._( t`Withdrawing` ) } </Dots> : i18n._( t`Claim all with penalty` ) }</Button>
                                                            {/*<Button variant="outlined" color="blue" >{ i18n._( t`Claim all and lock` ) }</Button>*/ }
                                                        </div>
                                                    }
                                                </td>
                                            </tr>
                                        ) ) :
                                            <tr>
                                                <td colSpan={ 3 } className="text-center p-4 pr-8 border-b border-dark-900">{ i18n._( t`Empty data set` ) }</td>
                                            </tr>
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

const sendTx = async ( txFunc: () => Promise<any> ): Promise<boolean> => {
    let success = true
    try {
        const ret = await txFunc()
        if ( ret?.error ) {
            success = false
        }
    } catch ( e ) {
        console.error( e )
        success = false
    }
    return success
}