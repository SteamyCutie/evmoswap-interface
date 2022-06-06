import React, { ReactNode, useMemo, useState } from 'react'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import { EvmoSwap } from '../../config/tokens'
import Container from '../../components/Container'
import { useActiveWeb3React } from '../../services/web3'
import { useTokenBalance } from '../../state/wallet/hooks'
import { t } from '@lingui/macro'
import Image from 'next/image'
import ButtonNew from 'app/components/Button/index.new'
import Web3Connect from 'app/components/Web3Connect'
import Button from 'app/components/Button'
import Input from 'app/components/Input'
import { classNames, formatBalance, formatNumberScale, formatPercent, tryParseAmount } from 'app/functions'
import { Currency, CurrencyAmount, Token, ZERO } from '@evmoswap/core-sdk'
import { RowBetween } from 'app/components/Row'
import { GetAPY } from 'app/features/staking/useStaking'
import Dots from 'app/components/Dots'
import { VOTING_ESCROW_ADDRESS } from 'app/constants/addresses'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import { addDays, getUnixTime, format, isFuture } from 'date-fns'
import { BigNumber } from '@ethersproject/bignumber'
import { useRewardPool } from 'app/features/boost/hooks/useRewardPool'
import useVotingEscrow from 'app/features/boost/hooks/useVotingEscrow'
import { useFeeDistributor } from 'app/features/boost/hooks/useFeeDistributor'
import { timestampToDate } from 'app/features/boost/functions'
import {
    EMOSPlaceholder,
    useFarmsReward,
    useLockedBalance,
    useLockerExtraRewards,
    useRewardsBalance,
    useStakingBalance,
} from 'app/features/boost/hooks/balances'
import useCurrentBlockTimestamp from 'app/hooks/useCurrentBlockTimestamp'
import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { Divider } from 'app/components/Divider/Divider'
import { CheckIcon } from '@heroicons/react/solid'
import Alert from 'app/components/Alert'

type VestingRow = {
    unlockTime: string
    amount: CurrencyAmount<Currency>
    expired: boolean
    penaltyAmount: BigNumber
}

const INPUT_CHAR_LIMIT = 18
const WEEKS_PER_MONTH = 4.34524
const MAX_WEEK = WEEKS_PER_MONTH * 12 * 4
const DAYS_IN_WEEK = 7
const SECS_IN_WEEK = DAYS_IN_WEEK * 86400

const tabStyle = 'flex justify-center items-center w-full h-8 rounded-md font-semibold lg:text-lg text-sm p-6'
const activeTabStyle = `${tabStyle} bg-blue-special text-white !font-medium`
const inactiveTabStyle = `${tabStyle} bg-transparent text-dark dark:text-light`
const actionBtnColor = 'gradient'

//stake lock period
const LOCK_PERIODS = [
    { week: WEEKS_PER_MONTH, title: '1 month' },
    { week: WEEKS_PER_MONTH * 6, title: '6 months' },
    { week: WEEKS_PER_MONTH * 9, title: '9 months' },
    { week: WEEKS_PER_MONTH * 12, title: '1 year' },
    { week: WEEKS_PER_MONTH * 12 * 2, title: '2 year' },
    { week: WEEKS_PER_MONTH * 12 * 3, title: '3 year' },
    { week: WEEKS_PER_MONTH * 12 * 4, title: '4 years' },
]

//evmo benefit outlines
const OUTLINES = [
    "Mint NFTs and Trade",
    "Vote and Govern Protocol",
    "Receive Free Partner Tokens",
    "Boost your yield farm earnings",
    "Access Exclusive Launchpad Projects",
];


export default function Boostv3 () {

    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const balance = useTokenBalance( account ?? undefined, EvmoSwap[ chainId ] )
    const token = balance?.currency || EMOSPlaceholder;

    const { createLockWithMc, increaseAmountWithMc, increaseUnlockTimeWithMc, withdrawWithMc } = useVotingEscrow()
    const { harvestRewards, withdrawEarnings } = useRewardPool();
    const { manualAPY: APR } = GetAPY()

    const [ pendingTx, setPendingTx ] = useState( false )
    const [ pendingLock, setPendingLock ] = useState( false )
    const [ withdrawing, setWithdrawing ] = useState( false )
    const [ withdrawingMC, setWithdrawingMC ] = useState( false )
    const [ harvesting, setHarvesting ] = useState( false )

    const { lockEnd, lockAmount, emosSupply, veEmosSupply } = useLockedBalance()
    const { earnedBalances, withdrawableBalance } = useStakingBalance();
    const totalActiveVesting = CurrencyAmount.fromRawAmount( token, earnedBalances?.total?.toString() || "0" )
    const totalActiveVestingPenalty = totalActiveVesting?.divide( 2 )?.toExact()?.toBigNumber( token.decimals );
    const totalCompletedVesting = CurrencyAmount.fromRawAmount( token, withdrawableBalance?.amountWithoutPenalty?.toString() || "0" )
    const rewards = useRewardsBalance();
    const pendingFarmsRewards = useFarmsReward();

    const { claimLockerExtraRewards } = useFeeDistributor();
    const lockerExtraRewards = useLockerExtraRewards();

    const [ activeTab, setActiveTab ] = useState( 0 );

    const [ input, setInput ] = useState( '' )
    const [ usingBalance, setUsingBalance ] = useState( false )
    const parsedAmount = useMemo( () => {
        return usingBalance ? balance : tryParseAmount( input, token );
    }, [ input, balance, usingBalance, token ] );

    const [ approvalState, approve ] = useApproveCallback( parsedAmount, VOTING_ESCROW_ADDRESS[ chainId ] )
    const requireApproval = approvalState === ApprovalState.NOT_APPROVED;
    const waitingApproval = approvalState === ApprovalState.UNKNOWN;

    const insufficientFunds = !balance?.greaterThan( ZERO ) || ( parsedAmount?.greaterThan( ZERO ) && parsedAmount?.greaterThan( balance ) )
    const inputError = insufficientFunds

    const [ week, setWeek ] = useState( '' )
    const [ lockPeriod, setLockPeriod ] = useState( LOCK_PERIODS[ 0 ] );
    const currentBlockTime = useCurrentBlockTimestamp();
    const blockTimestamp = currentBlockTime ? currentBlockTime.mul( 1000 ).toNumber() : Date.now();

    const lockDays = Number( week ? week : lockPeriod.week ) * 7
    const newLockTime = Math.floor( getUnixTime( addDays( blockTimestamp, lockDays ) ) / SECS_IN_WEEK ) * SECS_IN_WEEK;
    const maxedLockedPeriod = ( Number( week ) === MAX_WEEK || lockPeriod.week === MAX_WEEK ) && newLockTime === lockEnd;

    const lockTimeBtnDisabled = pendingLock || newLockTime <= lockEnd || maxedLockedPeriod;
    const lockExpired = lockEnd && getUnixTime( blockTimestamp ) >= lockEnd;
    const amountBtnDisabled = pendingLock || !input || insufficientFunds || waitingApproval;
    const lockBtnDisabled = pendingLock || !input || waitingApproval;
    const [ activeVestingRow, setActiveVestingRow ] = useState<number | undefined>( 0 );

    const vestingRows = useMemo( () => {
        const rows = [];

        if ( earnedBalances && earnedBalances?.earningsData?.length )
            earnedBalances.earningsData.map( ( earning: { unlockTime: number; amount: number } ) => {
                const amount = CurrencyAmount.fromRawAmount( balance?.currency, earning?.amount?.toString() || "0" );
                const penaltyAmount = amount.divide( 2 ).toExact().toBigNumber( amount.currency.decimals );
                const expired = isFuture( getUnixTime( earning?.unlockTime ) );

                if ( ( amount.greaterThan( 0 ) && expired ) || penaltyAmount.gt( 0 ) )
                    rows.push( {
                        unlockTime: timestampToDate( earning?.unlockTime?.toString() ),
                        amount: amount,
                        expired: expired,
                        penaltyAmount: penaltyAmount
                    } )
            } )
        return rows;
    }, [ earnedBalances, balance?.currency ] )


    const handleInput = ( v: string ) => {

        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setUsingBalance( false )
            setInput( v )
        }
    }

    const handleWeek = ( v: string ) => {
        const vN = parseInt( v )
        if ( vN === 0 || v === '' ) {
            setWeek( '' )
            return
        }

        if ( vN > 0 && vN <= MAX_WEEK ) setWeek( String( vN ) )
    }

    const handleLockPeriod = ( period ) => {
        if ( week ) setWeek( '' )
        setLockPeriod( period )
    }

    const handleLock = async () => {
        if ( !input || waitingApproval ) return

        setPendingLock( true )

        if ( requireApproval ) {
            const success = await sendTx( () => approve() )
            setPendingLock( false )
            return
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
        if ( !input ) return

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

    const handleClaimLockerExtraRewards = async () => {
        setPendingTx( true )
        const success = await sendTx( () =>
            claimLockerExtraRewards( `Claim Lock Extra Rewards ${lockerExtraRewards.toFixed( 4 )} ${token.symbol}` )
        )
        if ( !success ) {
            setPendingTx( false )
            return
        }

        setPendingTx( false )
    }

    const handleWithdrawVesting = async (
        amount: CurrencyAmount<Token | Currency>,
        index?: number,
        withPenalty?: boolean
    ) => {
        if ( !amount.greaterThan( ZERO ) ) return

        setActiveVestingRow( index )

        setWithdrawing( true )

        let cIndex = index
        if ( index >= 0 && Array.isArray( earnedBalances?.indexes ) && earnedBalances.indexes.length )
            cIndex = earnedBalances.indexes[ index ]

        const success = await sendTx( () => withdrawEarnings( amount, withPenalty, cIndex >= 0 ? cIndex : undefined ) )

        if ( !success ) {
            setWithdrawing( false )
            return
        }

        setActiveVestingRow( undefined )

        setWithdrawing( false )
    }

    const handleLockRewardHarvest = async () => {
        setHarvesting( true )

        const success = await sendTx( () => harvestRewards() )
        console.log( success )
        if ( !success ) {
            setHarvesting( false )
            return
        }

        handleInput( '' )
        setHarvesting( false )
    }

    const handleWithdrawWithMc = async () => {
        if ( !lockExpired ) return

        setWithdrawingMC( true )

        const success = await sendTx( () => withdrawWithMc() )

        if ( !success ) {
            setWithdrawingMC( false )
            return
        }

        handleInput( '' )
        setWithdrawingMC( false )
    }

    return (
        <Container id="boostv3-page" className="py-4 md:py-8 lg:py-12" maxWidth="7xl">
            <Head>
                <title key="title">veEMO | EvmoSwap</title>
                <meta key="description" name="description" content="Boost EvmoSwap" />
            </Head>
            <div className="flex flex-col justify-start flex-grow w-full h-full px-4 md:px-6 py-4 space-y-6">

                <Alert type="warning" message={ <Typography variant="base" color="red" className="text-red" weight={ 400 }>
                    Emergency Withdraw your locked EMOs<br />
                    1. Please go to <a className='text-yellow' href="https://legacy.evmoswap.org/veEMO" target="_blank" rel="noreferrer">https://legacy.evmoswap.org/veEMO</a>, First Harvest lock rewards, then Emergency Withdraw your EMOs.<br />
                    2. Then re-lock your EMOs again on this page.
                </Typography>
                } />

                {/** Top action cards */ }
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 lg:gap-6 mt-4 md:grid-cols-3">
                    <BoostRewardCard title={ i18n._( t`Vesting` ) } value={ `${totalActiveVesting?.toFixed( 2 )} ${token.symbol}` }>
                        <div>
                            <p className="text-dark dark:text-light mb-5 text-base">
                                + { CurrencyAmount.fromRawAmount( token, pendingFarmsRewards.toString() ).toFixed( 2 ) } { token.symbol }{ ' ' }
                                { i18n._( t`waiting to be vested` ) }
                            </p>
                            { !account ? (
                                <Web3Connect color="gradient" className="truncate !rounded-md" size="default" />
                            ) : !totalActiveVestingPenalty.lte( 0 ) ? (
                                <NoRewardButton />
                            ) : (
                                <Button
                                    onClick={ () => handleWithdrawVesting( totalActiveVesting, -1, true ) }
                                    disabled={ withdrawing }
                                    color="gradient"
                                    className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal !rounded-md"
                                    variant="filled"
                                >
                                    { withdrawing && activeVestingRow === -1 ? (
                                        <Dots>{ i18n._( t`Withdrawing` ) } </Dots>
                                    ) : (
                                        i18n._( t`Withdraw early - 50% penalty` )
                                    ) }
                                </Button>
                            ) }
                        </div>
                    </BoostRewardCard>

                    <BoostRewardCard
                        title={ i18n._( t`Vest Complete` ) }
                        value={ `${totalCompletedVesting?.toFixed( 2 )} ${token.symbol}` }
                    >
                        { !account ? (
                            <Web3Connect color="gradient" className="truncate !rounded-md" size="default" />
                        ) : !totalCompletedVesting?.greaterThan( 0 ) ? (
                            <NoRewardButton />
                        ) : (
                            <Button
                                onClick={ () => handleWithdrawVesting( totalCompletedVesting, -2 ) }
                                disabled={ withdrawing }
                                color="blue"
                                className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal bg-blue-600"
                                variant="filled"
                            >
                                { withdrawing && activeVestingRow === -2 ? (
                                    <Dots>{ i18n._( t`Claiming` ) } </Dots>
                                ) : (
                                    i18n._( t`Claim Rewards` )
                                ) }
                            </Button>
                        ) }
                    </BoostRewardCard>

                    <BoostRewardCard
                        title={ i18n._( t`Locker Extra Rewards` ) }
                        value={ `${lockerExtraRewards.toFixed( 2 )} ${'EVMOS'}` }
                    >
                        { !account ? (
                            <Web3Connect color="gradient" className="truncate !rounded-md" size="default" />
                        ) : !lockerExtraRewards.greaterThan( ZERO ) ? (
                            <Button
                                color="gray"
                                className="truncate text-white font-bold disabled:bg-grey-light !rounded-md"
                                disabled
                            >
                                { i18n._( t`No rewards` ) }
                            </Button>
                        ) : (
                            <Button
                                onClick={ handleClaimLockerExtraRewards }
                                disabled={ pendingTx }
                                color="blue"
                                className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal bg-blue-600"
                                variant="filled"
                            >
                                { pendingTx ? <Dots>{ i18n._( t`Claiming` ) } </Dots> : i18n._( t`Claim Rewards` ) }
                            </Button>
                        ) }
                    </BoostRewardCard>
                </div>

                {/** Vesting */ }
                <div className="flex flex-col space-y-2 text-center  border rounded-2xl border-light-stroke/50 dark:border-dark-stroke/50 bg-light-secondary dark:bg-dark-secondary">
                    <div className={ classNames( 'rounded-t p-4', vestingRows.length ? '' : 'rounded-b' ) }>
                        <h2 className="text-blue-special font-medium text-slg">{ i18n._( `Vests are grouped by week` ) }</h2>
                        <p className="text-dark dark:text-light my-3 text-3xl font-bold">
                            { i18n._( `Next vesting group starts on` ) }
                            <span>{ format( addDays( blockTimestamp, DAYS_IN_WEEK ), " dd MMM yyyy 'at' hh:mm aaaaa'm' " ) }</span>
                        </p>
                        <p className="text-base text-secondary">
                            { i18n._( `Invest in Vaults and Claim the rewards to add them to the closest starting vesting group` ) }
                        </p>
                    </div>
                    {/** Vesting table */ }
                    { !!vestingRows.length && (
                        <div className="w-full mt-4 pb-2 bg-light-primary dark:bg-dark-primary p-4 rounded-b-2xl">
                            <div className="relative overflow-auto">
                                <table className="w-full border-collapse table-auto text-base text-dark-primary dark:text-white font-semibold">
                                    <thead className="rounded-md text-left">
                                        <tr>
                                            <th className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-l-md">{ i18n._( t`Expiry Time` ) }</th>
                                            <th className="p-4 bg-light-secondary dark:bg-dark-secondary">{ i18n._( t`Amount` ) }</th>
                                            <th className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-r-md">{ i18n._( t`Action` ) }</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-left">
                                        { vestingRows.length ? (
                                            vestingRows.map( ( row: VestingRow, index ) => (
                                                <tr key={ index }>
                                                    <td
                                                        className={ classNames(
                                                            'p-4 border-b border-dark-800',
                                                            index == vestingRows.length - 1 ? 'border-none' : ''
                                                        ) }
                                                    >
                                                        { row.expired ? i18n._( t`Vest Complete` ) : row.unlockTime }
                                                    </td>
                                                    <td
                                                        className={ classNames(
                                                            'p-4 border-b border-dark-800',
                                                            index == vestingRows.length - 1 ? 'border-none' : ''
                                                        ) }
                                                    >
                                                        { row.amount.toFixed( 6 ) } { token.symbol }
                                                    </td>
                                                    <td
                                                        className={ classNames(
                                                            'p-4 border-b border-dark-800',
                                                            index == vestingRows.length - 1 ? 'border-none' : ''
                                                        ) }
                                                    >
                                                        <div className="h-full w-full flex space-x-8 items-center">
                                                            <Button
                                                                size="sm"
                                                                variant="outlined"
                                                                color={ row.expired ? 'gray' : 'red' }
                                                                className={ classNames(
                                                                    '!w-auto !border-none !rounded-md !p-2 font-bold',
                                                                    row.expired ? '!bg-grey-light !text-white' : 'bg-red-550 !text-red-550 !bg-opacity-10'
                                                                ) }
                                                                onClick={ () => handleWithdrawVesting( row.amount, index, true ) }
                                                                disabled={ row.expired || withdrawing || row.penaltyAmount.lte( 0 ) }
                                                            >
                                                                { ' ' }
                                                                { withdrawing && activeVestingRow == index ? (
                                                                    <Dots>{ i18n._( t`Withdrawing` ) } </Dots>
                                                                ) : (
                                                                    i18n._( t`Withdraw early - 50% penalty` )
                                                                ) }
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outlined"
                                                                className={ classNames(
                                                                    '!w-auto !border-none !rounded-md !p-2 !bg-light-secondary dark:!bg-dark-secondary font-bold',
                                                                    !row.expired ? 'text-dark-primary dark:text-white' : ' text-blue-special'
                                                                ) }
                                                                onClick={ () => handleWithdrawVesting( row.amount, index, false ) }
                                                                disabled={ !row.expired || withdrawing || !row.amount.greaterThan( ZERO ) }
                                                            >
                                                                { ' ' }
                                                                { withdrawing && activeVestingRow == index && row.expired ? (
                                                                    <Dots>{ i18n._( t`Claiming` ) } </Dots>
                                                                ) : (
                                                                    i18n._( t`Claim all rewards` )
                                                                ) }
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) )
                                        ) : (
                                            <tr>
                                                <td colSpan={ 3 } className="text-center p-4 pr-8">
                                                    { i18n._( t`Empty data set` ) }
                                                </td>
                                            </tr>
                                        ) }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) }
                </div>

                <div className="flex flex-col md:flex-row space-x-0 space-y-8 md:space-x-8 md:space-y-0">
                    {/** col 1 */ }
                    <div className="flex flex-col space-y-8 w-full md:w-[60%]">
                        {/** Staking and Locking */ }
                        <div
                            className={ `h-full px-8 border rounded-2xl border-light-stroke/50 dark:border-dark-stroke/50 bg-light-secondary dark:bg-dark-secondary` }
                        >
                            <div className="flex flex-row items-center justify-between w-full text-lg py-6 text-high-emphesis font-black text-dark dark:text-light">
                                <div className="">{ i18n._( t`Staking & Lock ${token.symbol}` ) }</div>
                                <div>
                                    { i18n._( t`APR` ) } { formatPercent( APR ) }
                                </div>
                            </div>
                            <Divider />

                            {
                                /** Lock tab content */

                                <div className="mt-8">
                                    <Alert
                                        type='warning'
                                        message={ i18n._(
                                            t`Lock ${token.symbol} is equal to Staking ${token.symbol} and enjoys ${token.symbol} minted rewards at the same time.`
                                        ) }
                                        dismissable={ false }
                                        className={ "!p-3 !rounded-md" }
                                    />

                                    { lockAmount?.greaterThan( ZERO ) && (
                                        <RowBetween className="my-6 text-dark dark:text-light font-semibold">
                                            <div>
                                                { i18n._( t`Locked` ) }: { lockAmount?.toFixed( 4 ) } { balance?.currency?.symbol }
                                            </div>
                                            <div>
                                                { lockExpired ? (
                                                    <span>{ i18n._( t`Expired` ) }!</span>
                                                ) : (
                                                    <span>
                                                        { i18n._( t`Ends` ) }: { timestampToDate( lockEnd ) }
                                                    </span>
                                                ) }
                                            </div>
                                        </RowBetween>
                                    ) }

                                    { !lockExpired && (
                                        <React.Fragment>
                                            {/** Lock update tab toggle */ }
                                            { lockAmount?.greaterThan( ZERO ) && (
                                                <div className="grid grid-cols-2 gap-0 p-1 rounded-md mt-4 mb-8 bg-white dark:bg-dark">
                                                    <button
                                                        className={ activeTab === 0 ? activeTabStyle : inactiveTabStyle }
                                                        onClick={ () => {
                                                            setActiveTab( 0 )
                                                        } }
                                                    >
                                                        { i18n._( t`Update Amount` ) }
                                                    </button>

                                                    {
                                                        <button
                                                            className={ activeTab === 1 ? activeTabStyle : inactiveTabStyle }
                                                            onClick={ () => {
                                                                setActiveTab( 1 )
                                                            } }
                                                        >
                                                            { i18n._( t`Update Period` ) }
                                                        </button>
                                                    }
                                                </div>
                                            ) }

                                            {/** input */ }
                                            { ( activeTab === 0 || !lockAmount?.greaterThan( ZERO ) ) && (
                                                <RowBetween className="mt-8 text-dark dark:text-light font-semibold">
                                                    <div>{ i18n._( t`Your ${token.symbol} Balance` ) }</div>
                                                    <div>
                                                        { balance?.toFixed( 4 ) } { balance?.currency?.symbol }
                                                    </div>
                                                </RowBetween>
                                            ) }
                                            { ( activeTab === 0 || !lockAmount?.greaterThan( ZERO ) ) && (
                                                <div>
                                                    <Input.Numeric
                                                        value={ input }
                                                        onUserInput={ handleInput }
                                                        className={ classNames(
                                                            'w-full h-14 px-3 md:px-5 my-2 mb-3  rounded-md text-2xl md:text-3xl font-inter font-bold whitespace-nowrap caret-high-emphesis dark:bg-dark dark:bg-opacity-50',
                                                            inputError ? 'text-red' : ''
                                                        ) }
                                                        placeholder="0.0"
                                                    />
                                                    <button
                                                        className="absolute px-2 py-1 -ml-16 mt-[1.3rem] pointer-events-auto hover:rounded-2xl hover:border hover:border-blue-special md:py-1 md:px-3 md:-ml-20 text-base text-blue-special font-bold transition-all"
                                                        onClick={ () => {
                                                            if ( !balance?.equalTo( ZERO ) ) {
                                                                setInput( balance?.toSignificant( balance?.currency.decimals ) )
                                                            }
                                                        } }
                                                    >
                                                        { i18n._( t`Max` ) }
                                                    </button>
                                                </div>
                                            ) }

                                            {/** lock actions */ }
                                            { ( activeTab === 1 || !lockAmount?.greaterThan( ZERO ) ) && (
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                                        { LOCK_PERIODS.map( ( period, index ) => (
                                                            <Button
                                                                key={ index }
                                                                variant={ 'filled' }
                                                                disabled={ maxedLockedPeriod }
                                                                className={ classNames(
                                                                    'w-auto mb-2',
                                                                    '!rounded-md text-dark dark:text-light font-bold',
                                                                    lockPeriod.week === period.week && !week ? '' : 'capitalize',
                                                                    ( lockPeriod.week === period.week ||
                                                                        ( maxedLockedPeriod && period.week === MAX_WEEK ) ) &&
                                                                        !week
                                                                        ? '!bg-blue-special !text-light'
                                                                        : '!bg-white dark:!bg-dark'
                                                                ) }
                                                                onClick={ () => handleLockPeriod( period ) }
                                                            >
                                                                { period.title }
                                                            </Button>
                                                        ) ) }
                                                        <Input.Numeric
                                                            value={ week }
                                                            onUserInput={ handleWeek }
                                                            className={ classNames(
                                                                'flex-none h-auto min-h-[2.5rem] h-auto px-3 md:px-5 ml-2 mb-2 rounded-md !text-sm font-bold caret-high-emphesis',
                                                                inputError ? 'text-red' : '',
                                                                week
                                                                    ? 'bg-blue-special text-white !border-none !text-lg'
                                                                    : 'bg-white dark:bg-dark text-secondary',
                                                                '!border !border-solid border-grey-600 dark:border-grey-400'
                                                            ) }
                                                            placeholder={ i18n._( t`Custom week` ) }
                                                            title={ i18n._( t`Custom lock period in weeks` ) }
                                                            max={ MAX_WEEK }
                                                            min={ 1 }
                                                            step={ 1 }
                                                            readOnly={ maxedLockedPeriod }
                                                        />
                                                    </div>
                                                </div>
                                            ) }
                                        </React.Fragment>
                                    ) }

                                    {/** action buttons */ }
                                    <div className="flex-col space-y-4 items-center my-5 w-full">
                                        { !account && <Web3Connect color="gradient" className="truncate w-full" size="lg" /> }

                                        { account && !lockExpired && (
                                            <>
                                                { !lockAmount.greaterThan( ZERO ) ? (
                                                    insufficientFunds ? (
                                                        <Button color="gray" className="truncate w-full font-bold" size="lg" disabled>
                                                            { i18n._( t`Insufficient balance` ) }
                                                        </Button>
                                                    ) : requireApproval || approvalState === ApprovalState.PENDING ? (
                                                        <Button
                                                            size="lg"
                                                            onClick={ handleLock }
                                                            disabled={ lockBtnDisabled || approvalState === ApprovalState.PENDING }
                                                            color={
                                                                lockBtnDisabled || approvalState === ApprovalState.PENDING ? 'gray' : actionBtnColor
                                                            }
                                                            className="truncate w-full font-bold"
                                                            variant="filled"
                                                        >
                                                            { pendingLock || approvalState === ApprovalState.PENDING ? (
                                                                <Dots>{ i18n._( t`Approving` ) } </Dots>
                                                            ) : (
                                                                i18n._( t`Approve` )
                                                            ) }
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="lg"
                                                            onClick={ handleLock }
                                                            disabled={ lockBtnDisabled }
                                                            color={ lockBtnDisabled ? 'gray' : actionBtnColor }
                                                            className="truncate w-full font-bold"
                                                            variant="filled"
                                                        >
                                                            { pendingLock ? (
                                                                <Dots>{ i18n._( t`Locking` ) } </Dots>
                                                            ) : (
                                                                i18n._( t`${!input ? 'Enter amount' : 'Lock'}` )
                                                            ) }
                                                        </Button>
                                                    )
                                                ) : (
                                                    <React.Fragment>
                                                        { activeTab === 0 && (
                                                            <Button
                                                                size="lg"
                                                                onClick={ handleIncreaseAmount }
                                                                disabled={ amountBtnDisabled }
                                                                color={ amountBtnDisabled ? 'gray' : actionBtnColor }
                                                                className="truncate w-full font-bold"
                                                                variant="filled"
                                                            >
                                                                { pendingLock ? (
                                                                    <Dots>{ i18n._( t`Increasing amount` ) } </Dots>
                                                                ) : (
                                                                    i18n._(
                                                                        t`${!input
                                                                            ? 'Enter amount'
                                                                            : insufficientFunds
                                                                                ? 'Insufficient balance'
                                                                                : 'Increase amount'
                                                                            }`
                                                                    )
                                                                ) }
                                                            </Button>
                                                        ) }

                                                        { activeTab === 1 && (
                                                            <Button
                                                                size="lg"
                                                                onClick={ handleIncreaseLock }
                                                                disabled={ lockTimeBtnDisabled }
                                                                color={ lockTimeBtnDisabled ? 'gray' : actionBtnColor }
                                                                className="truncate w-full font-bold"
                                                                variant="filled"
                                                            >
                                                                { pendingLock ? (
                                                                    <Dots>{ i18n._( t`Increasing lock period` ) } </Dots>
                                                                ) : (
                                                                    i18n._(
                                                                        t`${!week && !lockPeriod
                                                                            ? 'Select period'
                                                                            : maxedLockedPeriod
                                                                                ? 'Locked on max period'
                                                                                : newLockTime <= lockEnd
                                                                                    ? 'Select a higher period !'
                                                                                    : 'Increase lock period'
                                                                            }`
                                                                    )
                                                                ) }
                                                            </Button>
                                                        ) }
                                                    </React.Fragment>
                                                ) }
                                            </>
                                        ) }
                                        { !!account && !!lockExpired && (
                                            <Button
                                                color={ !lockExpired || !lockAmount?.greaterThan( 0 ) ? 'gray' : actionBtnColor }
                                                className="mt-4 font-bold"
                                                onClick={ handleWithdrawWithMc }
                                                disabled={ !lockExpired || withdrawingMC || !lockAmount?.greaterThan( 0 ) }
                                                size="lg"
                                            >
                                                { withdrawingMC ? (
                                                    <Dots>{ i18n._( t`Withdrawing` ) } </Dots>
                                                ) : (
                                                    <span>
                                                        { i18n._( t`Withdraw` ) } ({ lockAmount?.toFixed( 2 ) })
                                                    </span>
                                                ) }
                                            </Button>
                                        ) }
                                        { !!account && (
                                            <Button
                                                color={ harvesting || rewards?.total?.lte( 0 ) ? 'gray' : actionBtnColor }
                                                className="mt-4 font-bold"
                                                onClick={ handleLockRewardHarvest }
                                                disabled={ harvesting || rewards?.total?.lte( 0 ) }
                                                size="lg"
                                            >
                                                { harvesting ? (
                                                    <Dots>{ i18n._( t`Harvesting` ) } </Dots>
                                                ) : (
                                                    <span>
                                                        { i18n._( t`Harvest lock rewards` ) } ({ rewards?.total?.toFixed( 2 ) })
                                                    </span>
                                                ) }
                                            </Button>
                                        ) }
                                    </div>
                                </div>
                                /** End Lock tab content */
                            }
                        </div>
                    </div>

                    {/** col 2 */ }
                    <div className="flex flex-col w-full md:w-[40%] p-4 justify-between border rounded-2xl border-light-stroke/50 dark:border-dark-stroke/50 bg-light-secondary dark:bg-dark-secondary">
                        <h3 className="text-medium font-bold text-dark dark:text-light">
                            { i18n._( t`Locking demonstrates a commitment to the long-term vision of EvmoSwap` ) }
                        </h3>
                        <p className="my-4 text-base leading-6 text-secondary dark:text-secondary-dark font-semibold">
                            { i18n._(
                                t`Lock your ${token.symbol} and get Boost Power to increase your Yield farm earnings and participate in protocol Governance`
                            ) }
                        </p>
                        <div className="flex flex-col flex-grow h-full grow">
                            {/** benefit outlines */ }
                            <div className="bg-white dark:bg-dark px-4 py-6 h-full rounded-2xl mt-4 mb-4 space-y-4  text-secondary dark:text-secondary-dark text-sm grow">
                                { OUTLINES &&
                                    OUTLINES.map( ( outline, index ) => (
                                        <div className="flex items-center space-x-2 text-dark dark:text-light font-semibold" key={ index }>
                                            <div className="h-5 w-5 p-1 bg-blue-special rounded-md text-white">
                                                <CheckIcon />
                                            </div>

                                            <p>{ i18n._( t`${outline}` ) }</p>
                                        </div>
                                    ) ) }
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StatButton
                                title={
                                    <div className="flex items-center">
                                        { i18n._( t`Total Locked` ) }{ ' ' }
                                        <QuestionHelper
                                            text={ i18n._( t`veEMO Total Supply: ${formatNumberScale( formatBalance( veEmosSupply || 0 ) )}` ) }
                                        />
                                    </div>
                                }
                                value={ `${formatNumberScale( Number( formatBalance( emosSupply ? emosSupply : 0 ) ) )} ${token.symbol}` }
                            />

                            <StatButton
                                title={ i18n._( t`Average lock time` ) }
                                value={ `${!veEmosSupply || !emosSupply ? '-' : ( ( Number( veEmosSupply ) / Number( emosSupply ) ) * 4 ).toFixed( 3 )
                                    } ${i18n._( t`Years` )}` }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

interface BoostRewardCardProps {
    title: string
    value: string
    icon?: any
    children: ReactNode
    className?: string
}

interface StatButtonProps {
    title: string | ReactNode
    value: string
    icon?: ReactNode
}
const BoostRewardCard = ( props: BoostRewardCardProps ) => {
    const { children, title, value, icon = '', className = '' } = props

    return (
        <div
            className={ classNames(
                'flex flex-col text-center w-full overflow-hidden px-4 pt-6 pb-4 font-semibold justify-between border rounded-2xl border-light-stroke/50 dark:border-dark-stroke/50 bg-light-secondary dark:bg-dark-secondary',
                className
            ) }
        >
            <div className="flex flex-col">
                <h2 className="flex items-center place-self-center text-lg text-secondary dark:text-secondary-dark transition-all">
                    { title } { icon }
                </h2>
                <p className="font-bold text-3.5xl my-3 text-dark dark:text-light font-inter">{ value }</p>
            </div>
            <div>{ children }</div>
        </div>
    )
}
const StatButton = ( props: StatButtonProps ) => {
    const { icon, title, value } = props

    return (
        <div className="bg-white dark:bg-dark hover:bg-darker px-0 py-4 justify-evenly h-auto rounded-2xl">
            <div className="flex flex-col space-y-2 text-center items-center">
                <div className="px-1 text-dark dark:text-light font-inter text-xl md:text-lg xl:text-xl md:truncate">
                    { value }
                </div>
                <div className="px-1 text-primary text-sm md:truncate text-secondary dark:text-secondary-dark">{ title }</div>
            </div>
        </div>
    )
}

const NoRewardButton = () => {
    const { i18n } = useLingui()

    return (
        <Button color="gray" className="truncate text-white font-bold disabled:bg-grey-light !rounded-md" disabled>
            { i18n._( t`No rewards` ) }
        </Button>
    )
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
