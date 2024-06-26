import { Disclosure, Transition } from '@headlessui/react'
import React, { useState } from 'react'

import { ExternalLink as LinkIcon } from 'react-feather'
import { useLingui } from '@lingui/react'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { SUSHI, Token, ZERO } from '@evmoswap/core-sdk'
import { formatNumber, formatNumberScale, getExplorerLink, tryParseAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import { getAddress } from '@ethersproject/address'
import { useTokenBalance } from 'app/state/wallet/hooks'
import Button from 'app/components/Button'
import Dots from 'app/components/Dots'
import NumericalInput from 'app/components/NumericalInput'
import { t } from '@lingui/macro'
import ExternalLink from 'app/components/ExternalLink'
import Typography from 'app/components/Typography'
import { useUserInfo } from './hooks'
import useSmartChef from './useSmartChef'
import { ClockIcon } from '@heroicons/react/outline'

const IncentivePoolItemDetail = ( {
    pool,
    pendingReward,
    stakingTokenPrice,
    earningTokenPrice,
    endInBlock,
    bonusEndBlock,
} ) => {
    const { i18n } = useLingui()

    const { account, chainId } = useActiveWeb3React()
    const [ pendingTx, setPendingTx ] = useState( false )
    const [ depositValue, setDepositValue ] = useState( '' )
    const [ withdrawValue, setWithdrawValue ] = useState( '' )

    const addTransaction = useTransactionAdder()

    const stakingToken = new Token(
        chainId,
        getAddress( pool.stakingToken?.id ),
        pool.stakingToken.decimals,
        pool.stakingToken.symbol,
        pool.stakingToken.name
    )

    const earningToken = new Token(
        chainId,
        getAddress( pool.earningToken?.id ),
        pool.earningToken.decimals,
        pool.earningToken.symbol,
        pool.earningToken.name
    )

    // SUSHI balance
    const balance = useTokenBalance( account, SUSHI[ chainId ] )

    // TODO: Replace these
    const { amount } = useUserInfo( pool, stakingToken )

    const typedDepositValue = tryParseAmount( depositValue, stakingToken )
    const typedWithdrawValue = tryParseAmount( withdrawValue, stakingToken )

    const [ approvalState, approve ] = useApproveCallback( typedDepositValue, pool.smartChef )

    const { deposit, withdraw, emergencyWithdraw, harvest } = useSmartChef( pool )

    const userMaxStake = tryParseAmount( '30000', stakingToken ).subtract(
        tryParseAmount( amount && amount?.greaterThan( 0 ) ? amount.toFixed( stakingToken?.decimals ) : '0.000001', stakingToken )
    )

    return (
        <Transition
            show={ true }
            enter="transition-opacity duration-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <Disclosure.Panel className="flex flex-col w-full border-t-0 rounded rounded-t-none bg-light-secondary dark:bg-dark-secondary" static>
                {/* <div className="grid grid-cols-2 gap-4 p-4"> */ }
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
                    <div className="col-span-2 text-center md:col-span-1">
                        { account && (
                            <div className="flex flex-row justify-between">
                                <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                                    { i18n._( t`Balance` ) }: { formatNumberScale( balance?.toSignificant( 6, undefined, 2 ) ?? 0, false, 4 ) }
                                    { stakingTokenPrice && balance
                                        ? ` (` +
                                        formatNumberScale( stakingTokenPrice.toFixed( 18 ) * Number( balance?.toFixed( 18 ) ?? 0 ), true ) +
                                        `)`
                                        : `` }
                                </div>
                            </div>
                        ) }

                        <div className="relative flex items-center mb-4 w-full">
                            <NumericalInput
                                className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
                                value={ depositValue }
                                onUserInput={ setDepositValue }
                            />
                            { account && (
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    size="xs"
                                    onClick={ () => {
                                        if ( !balance?.equalTo( ZERO ) ) {
                                            setDepositValue(
                                                pool.pid === 0
                                                    ? Number( balance?.toFixed( stakingToken?.decimals ) ?? 0 ) < 30000
                                                        ? balance?.toFixed( stakingToken?.decimals )
                                                        : userMaxStake?.toFixed( stakingToken?.decimals )
                                                    : balance?.toFixed( stakingToken?.decimals )
                                            )
                                        }
                                    } }
                                    className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                                >
                                    { i18n._( t`MAX` ) }
                                </Button>
                            ) }
                        </div>

                        { approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING ? (
                            <Button
                                className="w-full"
                                color="gradient"
                                disabled={ approvalState === ApprovalState.PENDING }
                                onClick={ approve }
                            >
                                { approvalState === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving` ) }</Dots> : i18n._( t`Approve` ) }
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                color="blue"
                                disabled={
                                    pendingTx ||
                                    !typedDepositValue ||
                                    ( pool.pid === 0 && Number( depositValue ) > 30000 ) ||
                                    balance?.lessThan( typedDepositValue )
                                }
                                onClick={ async () => {
                                    setPendingTx( true )
                                    try {
                                        // KMP decimals depend on asset, SLP is always 18
                                        const tx = await deposit( depositValue.toBigNumber( stakingToken?.decimals ) )

                                        addTransaction( tx, {
                                            summary: `${i18n._( t`Deposit` )} ${stakingToken?.symbol}`,
                                        } )
                                    } catch ( error ) {
                                        console.error( error )
                                    }
                                    setPendingTx( false )
                                } }
                            >
                                { i18n._( t`Stake` ) }
                            </Button>
                        ) }
                        { pool.pid === 0 && (
                            <div className="pl-1 pt-2 text-sm text-left text-red">
                                Max stake per user: { userMaxStake?.toFixed( 2 ) } SUSHIs
                            </div>
                        ) }
                    </div>
                    <div className="col-span-2 text-center md:col-span-1">
                        { account && (
                            <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                                { i18n._( t`Your Staked` ) }: { formatNumberScale( amount?.toSignificant( 6 ) ?? 0, false, 4 ) }
                                { stakingTokenPrice && amount
                                    ? ` (` +
                                    formatNumberScale( stakingTokenPrice.toFixed( 18 ) * Number( amount?.toSignificant( 18 ) ?? 0 ), true ) +
                                    `)`
                                    : `` }
                            </div>
                        ) }
                        <div className="relative flex items-center w-full mb-4">
                            <NumericalInput
                                className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-light-purple"
                                value={ withdrawValue }
                                onUserInput={ setWithdrawValue }
                            />
                            { account && (
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    size="xs"
                                    onClick={ () => {
                                        if ( !amount?.equalTo( ZERO ) ) {
                                            setWithdrawValue( amount?.toFixed( stakingToken?.decimals ) )
                                        }
                                    } }
                                    className="absolute border-0 right-4 focus:ring focus:ring-light-purple"
                                >
                                    { i18n._( t`MAX` ) }
                                </Button>
                            ) }
                        </div>

                        <Button
                            className="w-full"
                            color="blue"
                            disabled={ pendingTx || !typedWithdrawValue || amount?.lessThan( typedWithdrawValue ) }
                            onClick={ async () => {
                                setPendingTx( true )
                                try {
                                    const tx = pool.isFinished
                                        ? await emergencyWithdraw()
                                        : await withdraw( withdrawValue.toBigNumber( stakingToken?.decimals ) )
                                    addTransaction( tx, {
                                        summary: `${i18n._( t`Withdraw` )} ${stakingToken?.symbol}`,
                                    } )
                                } catch ( error ) {
                                    console.error( error )
                                }

                                setPendingTx( false )
                            } }
                        >
                            { i18n._( t`Unstake` ) }
                        </Button>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex justify-between">
                            <div className="mb-2 text-sm md:text-base text-secondary">{ earningToken?.symbol } Earned</div>
                            { endInBlock > 0 ? (
                                <a
                                    className="flex items-center mb-2 text-sm md:text-base text-blue"
                                    href={ chainId && getExplorerLink( chainId, bonusEndBlock, 'block' ) + '/countdown' }
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Ends in: { formatNumber( endInBlock ) } blocks
                                    <ClockIcon className="h-4" />
                                </a>
                            ) : (
                                <></>
                            ) }
                        </div>
                        <div className="flex flex-col justify-between text-sm gap-4 rounded-lg bg-dark-700">
                            <div className="flex mt-4">
                                <div className="flex flex-col w-2/3 px-4 align-middle">
                                    <div className="text-2xl font-bold">
                                        { ' ' }
                                        { formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) }
                                    </div>
                                    <div className="text-sm">
                                        ~
                                        { formatNumber(
                                            Number( pendingReward?.toFixed( earningToken?.decimals ) ) * Number( earningTokenPrice?.toFixed( 18 ) ),
                                            true
                                        ) }
                                    </div>
                                </div>
                                <div className="flex flex-col w-1/2 px-4 align-middle lg:w-1/3 gap-y-1">
                                    <Button
                                        color={
                                            Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 ? 'blue' : 'gradient'
                                        }
                                        size="sm"
                                        className="w-full"
                                        variant={
                                            Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 ? 'outlined' : 'filled'
                                        }
                                        disabled={ Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 }
                                        onClick={ async () => {
                                            setPendingTx( true )
                                            try {
                                                const tx = await harvest()
                                                addTransaction( tx, {
                                                    summary: `${i18n._( t`Harvest` )} ${earningToken?.symbol}`,
                                                } )
                                            } catch ( error ) {
                                                console.error( error )
                                            }
                                            setPendingTx( false )
                                        } }
                                    >
                                        { i18n._( t`Harvest` ) }
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col p-2 space-y-2">
                                <div className="flex flex-row justify-between px-2 text-md">
                                    <ExternalLink
                                        startIcon={ <LinkIcon size={ 16 } /> }
                                        href={ chainId && getExplorerLink( chainId, pool.smartChef, 'address' ) }
                                    >
                                        <Typography variant="sm">{ i18n._( t`View Contract` ) }</Typography>
                                    </ExternalLink>
                                    <ExternalLink startIcon={ <LinkIcon size={ 16 } /> } href={ pool.projectLink }>
                                        <Typography variant="sm">View Project Site</Typography>
                                    </ExternalLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Disclosure.Panel>
        </Transition>
    )
}

export default IncentivePoolItemDetail
