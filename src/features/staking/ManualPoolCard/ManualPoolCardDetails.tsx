import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { ZERO } from '@evmoswap/core-sdk'
import React, { useState, useRef } from 'react'
import { EvmoSwap, XEMO } from '../../../config/tokens'
import Button from '../../../components/Button'
import Dots from '../../../components/Dots'
import { ExternalLink as LinkIcon } from 'react-feather'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../../functions/parse'
import { useActiveWeb3React } from '../../../services/web3'
import useEmoBar from '../../../hooks/useEmoBar'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { useLingui } from '@lingui/react'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { formatNumber, getExplorerLink, formatNumberScale } from '../../../functions'
import { useEmosVaultContract, useDashboardContract, useMasterChefContract } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { getBalanceAmount } from 'functions/formatBalance'
import { GetEMOPrice } from 'features/staking/useStaking'
import NumericalInput from 'app/components/NumericalInput'
import ExternalLink from 'app/components/ExternalLink'
import Typography from 'app/components/Typography'
import { MASTERCHEF_ADDRESS } from 'app/constants/addresses'

const INPUT_CHAR_LIMIT = 18

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

export default function ManualPoolCardDetails () {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const emoPrice = GetEMOPrice()
    const emoBalance = useTokenBalance( account ?? undefined, EvmoSwap[ chainId ] )
    const XEMOBalance = useTokenBalance( account ?? undefined, XEMO[ chainId ] )
    const walletConnected = !!account
    const toggleWalletModal = useWalletModalToggle()
    const addTransaction = useTransactionAdder()
    const DEFAULT_GAS_LIMIT = 250000

    const dashboardContract = useDashboardContract()
    const emovaultContract = useEmosVaultContract()
    const { enterStaking, leaveStaking } = useEmoBar()

    const [ stakeValue, setStakeValue ] = useState<string>( '' )
    const [ unstakeValue, setUnstakeValue ] = useState<string>( '' )

    const parsedStakeAmount = tryParseAmount( stakeValue, emoBalance?.currency )
    const parsedUnstakeAmount = tryParseAmount( unstakeValue, XEMOBalance?.currency )
    const [ approvalState, approve ] = useApproveCallback( parsedStakeAmount, MASTERCHEF_ADDRESS[ chainId ] )

    const results = useRef( 0 )
    const getEmoVault = async () => {
        const totalstaked = await emovaultContract.balanceOf()
        const tvlOfManual = await dashboardContract.tvlOfPool( 0 )
        const totalStakedValue = getBalanceAmount( totalstaked._hex, 18 ).toNumber()
        const tvlOfManualValue = getBalanceAmount( tvlOfManual.tvl._hex, 18 ).toNumber() - totalStakedValue
        results.current = tvlOfManualValue
    }
    getEmoVault()

    const handleInput = ( v: string ) => {
        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setStakeValue( v )
            setUnstakeValue( v )
        }
    }

    const inputStakeError = ( emoBalance && emoBalance.equalTo( ZERO ) ) || parsedStakeAmount?.greaterThan( emoBalance )
    const inputUnstakeError = ( XEMOBalance && XEMOBalance.equalTo( ZERO ) ) || parsedUnstakeAmount?.greaterThan( XEMOBalance )

    const [ pendingTx, setPendingTx ] = useState( false )
    const stakeButtonDisabled = !stakeValue || pendingTx || ( parsedStakeAmount && parsedStakeAmount.equalTo( ZERO ) )
    const unstakeButtonDisabled = !unstakeValue || pendingTx || ( parsedUnstakeAmount && parsedUnstakeAmount.equalTo( ZERO ) )

    const handleStake = async () => {
        if ( stakeButtonDisabled ) return

        if ( !walletConnected ) {
            toggleWalletModal()
        } else {
            setPendingTx( true )
            if ( approvalState === ApprovalState.NOT_APPROVED ) {
                const success = await sendTx( () => approve() )
                if ( !success ) {
                    setPendingTx( false )
                    return
                }
            }
            const success = await sendTx( () => enterStaking( parsedStakeAmount ) )
            if ( !success ) {
                setPendingTx( false )
                return
            }
        }

        handleInput( '' )
        setPendingTx( false )
    }

    const handleUnstake = async () => {
        if ( unstakeButtonDisabled ) return

        if ( !walletConnected ) {
            toggleWalletModal()
        } else {
            setPendingTx( true )
            const success = await sendTx( () => leaveStaking( parsedUnstakeAmount ) )
            if ( !success ) {
                setPendingTx( false )
                return
            }
        }

        handleInput( '' )
        setPendingTx( false )
    }

    const [ pendingHarvestTx, setPendingHarvestTx ] = useState( false )
    const options = {
        gasLimit: DEFAULT_GAS_LIMIT,
    }
    const masterChefContract = useMasterChefContract()
    const harvestAmount = useRef( 0 )
    const getHarvestAmount = async () => {
        if ( account ) {
            harvestAmount.current = await masterChefContract.pendingTokens( 0, account )
        }
    }
    getHarvestAmount()
    const gasPrice = useGasPrice()
    const handleHarvestFarm = async () => {
        if ( !walletConnected ) {
            toggleWalletModal()
        } else {
            setPendingHarvestTx( true )
            try {
                const tx = await masterChefContract.leaveStaking( '0', { ...options, gasPrice } )
                addTransaction( tx, {
                    summary: `${i18n._( t`Harvest` )} EMO`,
                } )
            } catch ( e ) {
                console.error( e )
            }
            setPendingHarvestTx( false )
        }
    }

    const [ pendingCompundTx, setPendingCompundTx ] = useState( false )
    const handleCompoundFarm = async () => {
        if ( !walletConnected ) {
            toggleWalletModal()
        } else {
            setPendingCompundTx( true )
            try {
                const tx = await masterChefContract.enterStaking( harvestAmount.current, { ...options, gasPrice } )
                addTransaction( tx, {
                    summary: `${i18n._( t`Compound` )} EMO`,
                } )
            } catch ( e ) {
                console.error( e )
            }
            setPendingCompundTx( false )
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 p-4 rounded-b-lg rounded-t-none sm:grid-cols-2 lg:grid-cols-3 bg-dark-800">
            <div className="col-span-2 text-center md:col-span-1">
                { account && (
                    <div className="flex flex-row justify-between">
                        <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                            { i18n._( t`Balance` ) }: { formatNumberScale( emoBalance?.toSignificant( 6, undefined, 2 ) ?? 0, false, 4 ) }
                            { emoPrice && emoBalance
                                ? ` (` +
                                formatNumberScale(
                                    Number( Number( emoPrice ).toFixed( 18 ) ) * Number( Number( emoBalance )?.toFixed( 18 ) ?? 0 ),
                                    true
                                ) +
                                `)`
                                : `` }
                        </div>
                    </div>
                ) }

                <div className="relative flex items-center w-full mb-4">
                    <NumericalInput
                        className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
                        value={ stakeValue }
                        onUserInput={ setStakeValue }
                    />
                    { account && (
                        <Button
                            variant="outlined"
                            color="blue"
                            size="xs"
                            onClick={ () => {
                                if ( !emoBalance?.equalTo( ZERO ) ) {
                                    setStakeValue( Number( emoBalance )?.toFixed( 18 ) )
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
                        disabled={ stakeButtonDisabled || inputStakeError }
                        onClick={ handleStake }
                    >
                        { i18n._( t`Stake` ) }
                    </Button>
                ) }
            </div>
            <div className="col-span-2 text-center md:col-span-1">
                { account && (
                    <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                        { i18n._( t`Your Staked` ) }: { formatNumberScale( XEMOBalance?.toSignificant( 6 ) ?? 0, false, 4 ) }
                    </div>
                ) }
                <div className="relative flex items-center w-full mb-4">
                    <NumericalInput
                        className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-light-purple"
                        value={ unstakeValue }
                        onUserInput={ setUnstakeValue }
                    />
                    { account && (
                        <Button
                            variant="outlined"
                            color="blue"
                            size="xs"
                            onClick={ () => {
                                if ( !XEMOBalance?.equalTo( ZERO ) ) {
                                    setUnstakeValue( Number( XEMOBalance )?.toFixed( 18 ) )
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
                    disabled={ unstakeButtonDisabled || inputUnstakeError }
                    onClick={ handleUnstake }
                >
                    { i18n._( t`Unstake` ) }
                </Button>
            </div>
            <div className="col-span-2 md:col-span-1">
                <div className="flex justify-between">
                    <div className="mb-2 text-sm md:text-base text-secondary">EMO Earned</div>
                </div>
                <div className="flex justify-between w-full gap-2 text-sm rounded-lg md:gap-4 bg-dark-700">
                    <div className="flex flex-col justify-between w-1/2 px-4 mt-4">
                        <div className="flex flex-col">
                            <div className="text-xl font-bold"> { formatNumber( Number( harvestAmount.current )?.toFixed( 18 ) ) }</div>
                            <div className="text-sm">
                                ~$
                                { ( Number( Number( harvestAmount.current )?.toFixed( 18 ) ) * Number( Number( emoPrice )?.toFixed( 18 ) ) ).toFixed(
                                    10
                                ) }
                            </div>
                        </div>
                        <div className="mb-3">
                            <ExternalLink
                                startIcon={ <LinkIcon size={ 16 } /> }
                                href={ chainId && getExplorerLink( chainId, MASTERCHEF_ADDRESS[ chainId ], 'address' ) }
                                className="float-left"
                            >
                                <Typography variant="sm">{ i18n._( t`View Contract` ) }</Typography>
                            </ExternalLink>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2 p-3 align-middle gap-y-4">
                        <Button
                            color={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 ? 'blue' : 'gradient' }
                            size="sm"
                            className="w-full"
                            variant={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 ? 'outlined' : 'filled' }
                            disabled={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 }
                            onClick={ handleCompoundFarm }
                        >
                            { i18n._( t`Compound` ) }
                        </Button>
                        <Button
                            color={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 ? 'blue' : 'gradient' }
                            size="sm"
                            className="w-full"
                            variant={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 ? 'outlined' : 'filled' }
                            disabled={ Number( formatNumber( Number( harvestAmount.current ).toFixed( 18 ) ) ) <= 0 }
                            onClick={ handleHarvestFarm }
                        >
                            { i18n._( t`Harvest` ) }
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
