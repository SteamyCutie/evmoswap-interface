import React, { ReactNode, useMemo, useState } from 'react'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import { EvmoSwap } from '../../config/tokens'
import Container from '../../components/Container'
import { useActiveWeb3React } from '../../services/web3'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useTokenInfo } from 'app/features/farm/hooks'
import { useEmosContract } from 'app/hooks/useContract'
import { t } from '@lingui/macro'
import Image from 'next/image'
import ButtonNew from 'app/components/Button/index.new'
import Web3Connect from 'app/components/Web3Connect'
import Button from 'app/components/Button'
import Input from 'app/components/Input'
import { classNames, formatBalance, formatNumber, formatNumberScale, formatPercent, tryParseAmount } from 'app/functions'
import { Currency, CurrencyAmount, Token, ZERO } from '@evmoswap/core-sdk'
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
import { addDays, getUnixTime, format } from 'date-fns'
import { InformationCircleIcon } from '@heroicons/react/outline'
import DoubleCheckIcon from 'app/features/boostv3/assets/images/Done_all_round_light.svg';
import { AddressZero } from '@ethersproject/constants'

type VestingRow = {
    unlockTime: string, amount: CurrencyAmount<Currency>, expired: boolean;
}

const INPUT_CHAR_LIMIT = 18
const MAX_WEEK = 52 * 4
const DAYS_IN_WEEK = 7
const SECS_IN_WEEK = DAYS_IN_WEEK * 86400

const emosIcon = "/icons/icon-72x72.png";
const tabStyle = 'rounded-lg p-6'
const activeTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-dark-900 text-secondary`
const inactiveTabStyle = `${tabStyle} flex justify-center items-center w-full h-8 rounded font-bold md:font-medium lg:text-lg text-sm bg-transparent text-white`
const actionBtnColor = "blue";

//stake lock period
const LOCK_PERIODS = [
    { multiplier: 1.2, week: 4, day: 30, title: '1 month', hint: 'Locked 1 month and enjoy {multiplier} rewards.' },
    { multiplier: 1.2, week: 13, day: 90, title: '3 months', hint: 'Locked 3 months and enjoy {multiplier} rewards.' },
    { multiplier: 1.5, week: 26, day: 180, title: '6 months', hint: 'Locked 6 months and enjoy {multiplier} rewards.' },
    { multiplier: 1.2, week: 39, day: 270, title: '9 months', hint: 'Locked 9 months and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52, day: 360, title: '1 year', hint: 'Locked 2 years and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52 * 2, day: 360 * 2, title: '2 year', hint: 'Locked 2 years and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52 * 3, day: 360 * 3, title: '3 year', hint: 'Locked 3 years and enjoy {multiplier} rewards.' },
    { multiplier: 2.5, week: 52 * 4, day: 360 * 4, title: '4 years', hint: 'Locked 4 years and enjoy {multiplier} rewards.' },
]

export default function Boostv3 () {

    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const balance = useTokenBalance( account ?? undefined, EvmoSwap[ chainId ] )
    const token = balance?.currency || new Token( chainId, AddressZero, 18, "EMO" );

    const { createLockWithMc, increaseAmountWithMc, increaseUnlockTimeWithMc, withdrawWithMc } = useVotingEscrow()
    const { harvestRewards, withdrawEarnings } = useRewardPool();
    const { manualAPY: APR } = getAPY()

    const [ pendingTx, setPendingTx ] = useState( false )
    const [ pendingLock, setPendingLock ] = useState( false )
    const [ withdrawing, setWithdrawing ] = useState( false )

    const emosInfo = useTokenInfo( useEmosContract() )
    const { lockEnd, lockAmount, emosSupply } = useLockedBalance()
    const { earnedBalances, withdrawableBalance } = useStakingBalance();
    const totalActiveVesting = CurrencyAmount.fromRawAmount( token, earnedBalances?.total?.toString() || "0" )
    const totalCompletedVesting = CurrencyAmount.fromRawAmount( token, withdrawableBalance?.penaltyAmount?.toString() || "0" )
    const rewards = useRewardsBalance();
    const hasCompletedVesting = withdrawableBalance ? BigNumber.from( withdrawableBalance.penaltyAmount ).gt( 0 ) : false

    const [ activeTab, setActiveTab ] = useState( 0 );

    const [ input, setInput ] = useState( '' )
    const [ usingBalance, setUsingBalance ] = useState( false )
    const parsedAmount = useMemo( () => {
        return usingBalance ? balance : tryParseAmount( input, token );
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
            <div className="flex flex-col justify-start flex-grow w-full h-full px-4 md:px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 lg:gap-6 mt-4 md:grid-cols-3">

                    <RewardCards
                        title={ i18n._( t`Vesting` ) }
                        icon={ <InformationCircleIcon className='ml-1 w-4 h-4' /> }
                        value={ `${totalActiveVesting?.toFixed( 2 )} ${token.symbol}` }
                    >
                        <div>
                            <p className='my-2'><small>+{ 0.00 } { token.symbol } { i18n._( t`waiting to be vested` ) }</small></p>
                            {
                                !account ? (
                                    <Web3Connect color="blue" className="truncate" />
                                ) : !totalActiveVesting?.greaterThan( 0 ) ? (
                                    <Button color="red" className="truncate bg-[#EA5858] text-white" disabled>
                                        { i18n._( t`No rewards` ) }
                                    </Button>
                                ) : <Button onClick={ handleClaimRewards } disabled={ pendingTx } color="red" className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal bg-[#EA5858]" variant="filled">
                                    { pendingTx ? <Dots>{ i18n._( t`Claiming` ) } </Dots> : i18n._( t`Withdraw early - 50% penalty` ) }
                                </Button>
                            }
                        </div>
                    </RewardCards>
                    <RewardCards
                        title={ i18n._( t`Vest Complete` ) }
                        value={ `${totalCompletedVesting?.toFixed( 2 )} ${token.symbol}` }
                    >
                        {
                            !account ? (
                                <Web3Connect color="blue" className="truncate" />
                            ) : !totalCompletedVesting?.greaterThan( 0 ) ? (
                                <Button color="red" className="truncate bg-[#EA5858] text-white" disabled>
                                    { i18n._( t`No rewards` ) }
                                </Button>
                            ) : <Button onClick={ handleWithdrawWithPenalty } disabled={ withdrawing } color="blue" className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal" variant="filled">
                                { pendingTx ? <Dots>{ i18n._( t`Claiming` ) } </Dots> : i18n._( t`Claim Rewards` ) }
                            </Button>
                        }
                    </RewardCards>
                    <RewardCards
                        title={ i18n._( t`Locker Extra Rewards` ) }
                        value={ `${rewards?.total?.toFixed( 2 )} ${token.symbol}` }
                    >
                        {
                            !account ? (
                                <Web3Connect color="blue" className="truncate" />
                            ) : rewards?.total?.lte( 0 ) ? (
                                <Button color="red" className="truncate bg-[#EA5858] text-white" disabled>
                                    { i18n._( t`No rewards` ) }
                                </Button>
                            ) : <Button onClick={ handleClaimRewards } disabled={ pendingTx } color="blue" className="disabled:bg-opacity-40 lg:truncate lg:hover:whitespace-normal" variant="filled">
                                { pendingTx ? <Dots>{ i18n._( t`Claiming` ) } </Dots> : i18n._( t`Claim Rewards` ) }
                            </Button>
                        }
                    </RewardCards>

                </div>

                <div className='flex flex-col space-y-2 bg-dark-900 rounded text-center'>
                    <div className={ classNames( 'bg-dark-800 rounded-t p-4', vestingRows.length ? '' : 'rounded-b' ) }>
                        <p className='text-white'>{ i18n._( `Vests are grouped by week` ) }</p>
                        <p className='text-white my-3'>
                            { i18n._( `Next vesting group starts on` ) }
                            <span className='font-black'>{ format( addDays( Date.now(), DAYS_IN_WEEK ), " dd MMM yyyy 'at' hh:mm aaaaa'm' " ) }</span>
                            { i18n._( `so far you have ${'0.00'} ${token.symbol} in it` ) }
                        </p>
                        <p className='text-sm'>{ i18n._( `Invest in Vaults and Claim the rewards to add them to the closest starting vesting group` ) }</p>

                    </div>
                    {/** Vesting table */ }
                    { !!vestingRows.length && <div className="w-full mt-12 pb-2">
                        <div className="relative overflow-auto">
                            <table className="border-collapse table-auto w-full text-sm mt-4">
                                <thead className="bg-dark-900">
                                    <tr>
                                        <th className="text-center p-4 border-b border-dark-800">{ i18n._( t`Expiry Time` ) }</th>
                                        <th className="text-center p-4 border-b border-dark-800">{ i18n._( t`Amount` ) }</th>
                                        <th className="text-center p-4 border-b border-dark-800">{ i18n._( t`Action` ) }</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-dark-900">

                                    {
                                        vestingRows.length ? vestingRows.map( ( row: VestingRow, index ) => (
                                            <tr key={ index }>
                                                <td className="text-center p-4 pr-8 border-b border-dark-800">{ row.unlockTime }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-800">{ row.amount.toFixed( 6 ) } { token.symbol }</td>
                                                <td className="text-center p-4 pr-8 border-b border-dark-800">

                                                    <div className='h-full w-full flex space-x-8 items-center justify-center'>
                                                        <Button variant="outlined" color="red" onClick={ handleWithdrawWithPenalty } disabled={ withdrawing }> { withdrawing ? <Dots>{ i18n._( t`Withdrawing` ) } </Dots> : i18n._( t`Claim all with penalty` ) }</Button>
                                                        <Button variant="outlined" color="blue" onClick={ handleWithdrawWithPenalty } disabled={ withdrawing }> { withdrawing ? <Dots>{ i18n._( t`Withdrawing` ) } </Dots> : i18n._( t`Claim all with penalty` ) }</Button>
                                                    </div>

                                                </td>
                                            </tr>
                                        ) ) :
                                            <tr>
                                                <td colSpan={ 3 } className="text-center p-4 pr-8">{ i18n._( t`Empty data set` ) }</td>
                                            </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    }
                </div>



                <div className="flex flex-col md:flex-row w-full gap-8">

                    {/** col 1 */ }
                    <div className="flex flex-col w-full lg:w-3/5 space-y-8">


                        {/** Staking and Locking */ }
                        <div className="bg-dark-900 h-full bg-opacity-80">

                            <div className="flex flex-row items-center justify-between w-full p-6 bg-dark-800 text-lg rounded-t text-high-emphesis font-black">
                                <div className="">{ i18n._( t`Stakig & Lock ${token.symbol}` ) }</div>
                                <div>{ i18n._( t`APR` ) } { formatPercent( APR ) }</div>
                            </div>


                            {/** Lock tab content */

                                <div className="mt-8 px-4 md:px-8">
                                    <div className='bg-tahiti-gold bg-opacity-10 p-3 rounded'>
                                        <ul className="text-tahiti-gold text-sm text-high-emphesis list-disc ml-4 flex flex-col space-y-3">
                                            <li>
                                                { i18n._( t`Lock ${token.symbol} is equal to Staking ${token.symbol} and enjoys ${token.symbol} minted rewards at the same time.` ) }
                                            </li>
                                        </ul>
                                    </div>

                                    { lockAmount?.greaterThan( ZERO ) && <RowBetween className="mt-8 text-white">
                                        <div>{ i18n._( t`Locked` ) }: { lockAmount?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                        <div>{ lockExpired ? <span>{ i18n._( t`Expired` ) }!</span> : <span>{ i18n._( t`Ends` ) }: { timestampToDate( lockEnd ) }</span> }</div>
                                    </RowBetween>
                                    }

                                    { !lockExpired && <React.Fragment>

                                        {/** Lock update tab toggle */ }
                                        { lockAmount?.greaterThan( ZERO ) && <div className="grid grid-cols-2 gap-0 p-1 rounded mt-4 mb-8 bg-dark-800">
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
                                        { ( activeTab === 0 || !lockAmount?.greaterThan( ZERO ) ) &&
                                            <RowBetween className="mt-8">
                                                <div>{ i18n._( t`Your ${token.symbol} Balance` ) }</div>
                                                <div>{ balance?.toSignificant( 4 ) } { balance?.currency?.symbol }</div>
                                            </RowBetween>
                                        }
                                        { ( activeTab === 0 || !lockAmount?.greaterThan( ZERO ) ) &&
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
                                                <button className="absolute rounded-2xl text-xs px-2 py-1 -ml-16 mt-[1.3rem] md:bg-cyan-blue md:bg-opacity-30 border border-secondary md:border-cyan-blue pointer-events-auto focus:outline-none focus:ring hover:bg-opacity-40 hover:bg-cyan-blue hover:bg-opacity-0 md:text-cyan-blue md:py-1 md:px-3 md:-ml-20 md:text-sm md:font-normal md:text-cyan-blue"
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
                                        { ( activeTab === 1 || !lockAmount?.greaterThan( ZERO ) ) &&
                                            <div className="my-4">
                                                <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                                                    {
                                                        LOCK_PERIODS.map( ( period, index ) => (
                                                            <Button
                                                                key={ index }
                                                                variant={ "filled" }
                                                                color={ lockPeriod.day === period.day && !week ? "blue" : "gray" }
                                                                size={ "sm" }
                                                                className={ classNames( "w-auto ml-2 mb-2", lockPeriod.day === period.day && !week ? '' : 'bg-dark-800 text-secondary capitalize' ) }
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
                                                            'w-48 flex-none h-auto min-h-[2.5rem] h-auto px-3 md:px-5 ml-2 mb-2 rounded  text-sm md:text-xl font-bold caret-high-emphesis',
                                                            inputError ? ' pl-9 md:pl-12' : '',
                                                            week ? 'bg-blue text-white bg-opacity-50' : 'bg-dark-800 text-secondary'
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
                                    <div className="flex-col space-y-4 items-center mb-5 w-full">
                                        {
                                            !account && <Web3Connect color="blue" className="truncate w-full" size='lg' />
                                        }
                                        {
                                            account && !lockExpired && <>
                                                {
                                                    !lockAmount.greaterThan( ZERO ) ? (
                                                        insufficientFunds ? (
                                                            <Button color="red" className="truncate w-full" disabled>
                                                                { i18n._( t`Insufficient Balance` ) }
                                                            </Button>
                                                        ) : ( <Button onClick={ handleLock } disabled={ lockBtnDisabled } color={ lockBtnDisabled ? "gray" : actionBtnColor } className="bg-blue truncate disabled:bg-dark-800 disabled:bg-opacity-100 w-full" variant="filled">
                                                            { pendingLock ? <Dots>{ i18n._( t`Locking` ) } </Dots> : i18n._( t`${!input ? 'Enter amount' : 'Lock'}` ) }
                                                        </Button>
                                                        )
                                                    ) : (
                                                        <React.Fragment>
                                                            { activeTab === 0 && <Button onClick={ handleIncreaseAmount } disabled={ amountBtnDisabled } color={ amountBtnDisabled ? "red" : actionBtnColor } className="bg-blue truncate disabled:bg-dark-800 disabled:bg-opacity-100 w-full" variant="filled">
                                                                { pendingLock ? <Dots>{ i18n._( t`Increasing amount` ) } </Dots> : i18n._( t`${!input ? 'Enter amount' : ( insufficientFunds ? 'Insufficient Balance' : 'Increase Amount' )}` ) }
                                                            </Button> }

                                                            { activeTab === 1 && <Button onClick={ handleIncreaseLock } disabled={ lockTimeBtnDisabled } color={ lockTimeBtnDisabled ? "blue" : actionBtnColor } className="bg-blue truncate disabled:bg-dark-800 disabled:bg-opacity-100 w-full" variant="filled">
                                                                { pendingLock ? <Dots>{ i18n._( t`Increasing lock period` ) } </Dots> : i18n._( t`${!week && !lockPeriod ? 'Select period' : ( lockTimeBtnDisabled ? 'Higher period required' : 'Increase Lock Period' )}` ) }
                                                            </Button> }
                                                        </React.Fragment>
                                                    )
                                                }
                                            </>
                                        }
                                        {
                                            ( !!account ) && <Button
                                                color="gradient"
                                                className="mt-4 disabled:opacity-60"
                                                onClick={ handleWithdrawWith }
                                                disabled={ !lockExpired }
                                            >
                                                { pendingLock ? <Dots>{ i18n._( t`Harvesting` ) } </Dots> : <span>{ i18n._( t`Harvest Lock Rewards` ) } ({ rewards?.total?.toFixed( 2 ) })</span> }
                                            </Button>
                                        }
                                    </div>

                                </div>
                            /** End Lock tab content */ }

                        </div>
                    </div>

                    {/** col 2 */ }
                    <div className="flex flex-col w-full lg:w-2/5 rounded bg-dark-900 bg-opacity-60 w-full h-full p-4 md:px-8 justify-between">

                        <div className='flex flex-col h-full overflow-hidden'>
                            <h3 className="text-medium font-bold text-white">{ i18n._( t`Locking demonstrates a commitment to the long-term vision of EvmoSwap` ) }</h3>
                            <p className='my-4 text-sm leading-6'>{ i18n._( t`Lock your ${token.symbol} and get Boost Power to increase your Yield farm earnings and participate in protocol Governance` ) }</p>

                            <div className='bg-dark-800 p-4 h-full rounded mt-4 text-white text-sm'>
                                <div className='flex items-center space-x-2'>
                                    <Image src={ DoubleCheckIcon } alt="" className='w-4 h-4' />
                                    <p>{ i18n._( t`Boost your yield farm earnings` ) }</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 xl:gap-8 mt-8">

                            <StatButton
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
                                title={ i18n._( t`Circulating Supply` ) }
                                value={ `${formatNumberScale( emosInfo.circulatingSupply )} ${token.symbol}` }
                            />
                        </div>

                    </div>
                </div>
            </div>
        </Container >
    )
}

interface RewardCardProps {
    title: string,
    value: string,
    icon?: any,
    children: ReactNode,
    className?: string
}

interface StatButtonProps {
    title: string,
    value: string,
    icon?: ReactNode
}
const RewardCards = ( props: RewardCardProps ) => {
    const { children, title, value, icon = '', className = '' } = props;

    return (
        <div className={ classNames( 'flex flex-col text-center w-full overflow-hidden space-y-2 px-14 pt-6 pb-4 rounded bg-dark-900 bg-opacity-80 font-semibold justify-between', className ) }>
            <div className='flex flex-col'>
                <h2 className='flex items-center text-normal text-white place-self-center'>{ title }  { icon }</h2>
                <p className='font-black text-2xl text-white'>{ value }</p>
            </div>
            <div>{ children }</div>
        </div>
    )
}
const StatButton = ( props: StatButtonProps ) => {
    const { icon, title, value } = props;

    return <ButtonNew
        endIcon={ icon }
        className="bg-dark-700 hover:bg-darker px-0 py-4 justify-evenly h-auto"
    >
        <div className="flex flex-col space-y-2 text-center">
            <div className="px-1 text-white text-xs md:truncate">{ title }</div>
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