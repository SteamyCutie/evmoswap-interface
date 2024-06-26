import { ChainId, ZERO } from '@evmoswap/core-sdk'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import Dots from 'app/components/Dots'
import NumericalInput from 'app/components/NumericalInput'
import QuestionHelper from 'app/components/QuestionHelper'
import { Ifo, PoolIds } from 'app/constants/types'
import { formatBalance, formatCurrencyAmount, formatNumber, formatNumberScale, tryParseAmount } from 'app/functions'
import { BIG_ONE, BIG_TEN, BIG_ZERO } from 'app/functions/bigNumber'
import { getBalanceAmount, getBalanceNumber, getFullDisplayBalance } from 'app/functions/formatBalance'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { useMemo, useState } from 'react'
import { PublicIfoData, WalletIfoData } from '../hooks/types'
import useIfoPool from '../hooks/useIfoPool'
import IfoCardDetails from './IfoCardDetails'
import BigNumber from 'bignumber.js'
import { useIfoContract } from 'app/hooks'
import { useSingleCallResult } from 'app/state/multicall/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
interface IfoCardProps {
    poolId: PoolIds
    ifo: Ifo
    publicIfoData: PublicIfoData
    walletIfoData: WalletIfoData
}

const cardConfig = (
    poolId: PoolIds
): {
    title: string
    variant: 'blue' | 'violet'
    tooltip: string
} => {
    switch ( poolId ) {
        case PoolIds.poolBasic:
            return {
                title: 'WEVMOS OFFERING',
                variant: 'blue',
                tooltip: 'Every person can only commit a limited amount, but may expect a higher return per token committed.',
            }
        case PoolIds.poolUnlimited:
            return {
                title: 'Public sale',
                variant: 'violet',
                tooltip: 'No limits on the amount you can commit. Additional fee applies when claiming.',
            }
        default:
            return { title: '', variant: 'blue', tooltip: '' }
    }
}

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

const IfoPoolCard: React.FC<IfoCardProps> = ( { poolId, ifo, publicIfoData, walletIfoData } ) => {
    const config = cardConfig( poolId )
    const { account, chainId } = useActiveWeb3React()
    const { address } = ifo
    const ifoContract = useIfoContract( address[ chainId ] )
    const now = Date.parse( new Date().toString() ) / 1000

    const { status, offerToken } = publicIfoData
    const raiseToken = publicIfoData[ poolId ].raiseToken
    const allowClaimStatus = publicIfoData.allowClaim

    const publicPoolCharacteristics = publicIfoData[ poolId ]
    const userPoolCharacteristics = walletIfoData[ poolId ]

    const rasieTokenBalance = useTokenBalance( account ?? undefined, raiseToken )

    const walletConnected = !!account
    const toggleWalletModal = useWalletModalToggle()

    const [ input, setInput ] = useState<string>( '' )
    const [ pendingTx, setPendingTx ] = useState( false )
    const [ claimPendingTx, setClaimPendingTx ] = useState( false )
    const [ usingBalance, setUsingBalance ] = useState( false )

    const parsedAmount = usingBalance ? rasieTokenBalance : tryParseAmount( input, rasieTokenBalance?.currency )

    const insufficientFunds =
        ( rasieTokenBalance && rasieTokenBalance.equalTo( ZERO ) ) || parsedAmount?.greaterThan( rasieTokenBalance )
    const inputError = insufficientFunds

    const [ approvalState, approve ] = useApproveCallback( parsedAmount, ifo.address[ chainId ? chainId : ChainId.EVMOS ] )

    const handleInput = ( v: string ) => {
        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setUsingBalance( false )
            setInput( v )
        }
    }

    // TODO:
    const { limitPerUserInLP } = publicPoolCharacteristics
    const { amountTokenCommittedInLP } = userPoolCharacteristics

    const veEmoLeft = walletIfoData.ifoVeEmo?.veEmoLeft

    const maximumTokenEntry = useMemo( () => {
        if ( !veEmoLeft ) {
            return BIG_ZERO
            // return limitPerUserInLP.minus(amountTokenCommittedInLP).multipliedBy(10 ** (18 - raiseToken.decimals))
        }

        if ( limitPerUserInLP.isGreaterThan( 0 ) ) {
            // console.log(Number(limitPerUserInLP.minus(amountTokenCommittedInLP).multipliedBy(10 ** (18 - raiseToken.decimals))))
            // console.log(Number(veEmoLeft.multipliedBy(10)))

            //compare veemo left
            if ( amountTokenCommittedInLP.isGreaterThan( 0 ) ) {
                return veEmoLeft
                    .multipliedBy( 10 )
                    .isGreaterThan( amountTokenCommittedInLP.multipliedBy( 10 ** ( 18 - raiseToken.decimals ) ) )
                    ? limitPerUserInLP.minus( amountTokenCommittedInLP ).multipliedBy( 10 ** ( 18 - raiseToken.decimals ) )
                    : veEmoLeft.minus( amountTokenCommittedInLP ).multipliedBy( 10 ** ( 18 - raiseToken.decimals ) )
            }

            if ( limitPerUserInLP.isGreaterThan( 0 ) ) {
                // console.log('amountTokenCommittedInLP2', Number(amountTokenCommittedInLP))

                return limitPerUserInLP
                    .minus( amountTokenCommittedInLP )
                    .multipliedBy( 10 ** ( 18 - raiseToken.decimals ) ) //$983.78
                    .isLessThanOrEqualTo( veEmoLeft.multipliedBy( 10 ) ) //$16.22
                    ? limitPerUserInLP.minus( amountTokenCommittedInLP ).multipliedBy( 10 ** ( 18 - raiseToken.decimals ) ) //$983.78
                    : veEmoLeft.multipliedBy( 10 ) // x $10 $16.22
            }
        }

        return veEmoLeft.multipliedBy( 10 )
    }, [ veEmoLeft, limitPerUserInLP, amountTokenCommittedInLP ] )

    // include user balance for input
    // const maximumTokenCommittable = useMemo(() => {

    //   return maximumTokenEntry.isLessThanOrEqualTo(new BigNumber(rasieTokenBalance?.toSignificant(4))) ? maximumTokenEntry : new BigNumber(rasieTokenBalance?.toSignificant(4))
    // }, [poolId, maximumTokenEntry, rasieTokenBalance])

    // console.log('maximumTokenCommittable', Number(maximumTokenEntry)/1e18, Number(maximumTokenCommittable), rasieTokenBalance?.toSignificant(4).toBigNumber(18))

    // console.log('abcd', getBalanceAmount(maximumTokenCommittable).toFixed(7).slice(0, -1))

    const buttonDisabled = !input || pendingTx || ( parsedAmount && parsedAmount.equalTo( ZERO ) )
    // status === 'finished' ||
    // (poolId === PoolIds.poolBasic && Number(input) > getBalanceNumber(maximumTokenEntry))

    const { harvestPool, depositPool } = useIfoPool( walletIfoData.contract )

    const handleDepositPool = async () => {
        if ( buttonDisabled ) return

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

            // const success = await sendTx(() => createLockWithMc(parsedAmount, getUnixTime(addDays(Date.now(), activeTab))))
            const success = await sendTx( () => depositPool( parsedAmount, poolId ) )

            if ( !success ) {
                setPendingTx( false )
                // setModalOpen(true)
                return
            }

            handleInput( '' )
            setPendingTx( false )
        }
    }

    const handleHarvestPool = async () => {
        if ( !walletConnected ) {
            toggleWalletModal()
        } else {
            setClaimPendingTx( true )

            // const success = await sendTx(() => createLockWithMc(parsedAmount, getUnixTime(addDays(Date.now(), activeTab))))
            const success = await sendTx( () => harvestPool( poolId ) )

            if ( !success ) {
                setClaimPendingTx( false )
                // setModalOpen(true)
                return
            }

            setClaimPendingTx( false )
        }
    }

    const callsData = useMemo(
        () => [
            { methodName: 'viewUserInfo', callInputs: [ account, [ 0, 1 ] ] }, // viewUserInfo
            { methodName: 'viewUserOfferingAndRefundingAmountsForPools', callInputs: [ account, [ 0, 1 ] ] }, // viewUserOfferingAndRefundingAmountsForPools
        ],
        [ account ]
    )

    const allowClaimObject = useSingleCallResult( [] ? ifoContract : null, 'allowClaim', [] )?.result
    // const allowClaim = allowClaimObject ? allowClaimObject[0] : false
    const allowClaim = true

    const addTransaction = useTransactionAdder()
    const [ pendingAllowTx, setPendingAllowTx ] = useState( false )
    const handleAllowClaim = async () => {
        setPendingAllowTx( true )
        try {
            const args = [ !allowClaim ]
            const tx = await ifoContract.setAllowClaim( ...args )
            addTransaction( tx, {
                summary: `${i18n._( t`Set` )} EMO`,
            } )
            setPendingAllowTx( false )
        } catch ( error ) {
            console.log( error )
            setPendingAllowTx( false )
        }
    }

    return (
        <div className="space-y-6 rounded-3xl bg-light-secondary dark:bg-dark-secondary">
            {/* <div className="flex flex-row justify-between p-6 rounded-t item-center bg-dark-600"> */ }
            <div
                className={ `flex flex-row justify-between px-6 py-4 items-center rounded-t-3xl item-center bg-gradient-to-b ${poolId === PoolIds.poolBasic ? 'from-blue to-light-blue' : 'from-blue to-light-blue'
                    }` }
            >
                <div className="flex flex-row items-center text-2xl font-bold text-white">
                    { config.title }
                    {/* <QuestionHelper text={config.tooltip} /> */ }
                </div>

                { status === 'coming_soon' && (
                    <div className="bg-gray-700 bg-opacity-60 text-white opacity-60 h-[24px] pr-3 whitespace-nowrap inline-flex rounded-sm pl-3 font-bold text-sm items-center justify-center">
                        Upcoming
                    </div>
                ) }

                { status === 'live' && (
                    <div className="bg-gray-700 bg-opacity-60 text-green h-[24px] pr-3 whitespace-nowrap inline-flex rounded-sm pl-3 font-bold text-sm items-center justify-center">
                        Live
                    </div>
                ) }

                { status === 'finished' && (
                    <div className="bg-gray-600 bg-opacity-60 text-yellow  h-[24px] pr-3 whitespace-nowrap inline-flex rounded-sm pl-3 font-bold text-sm items-center justify-center">
                        Finished
                    </div>
                ) }
            </div>
            <div className="flex gap-3 px-4">
                <CurrencyLogo currency={ offerToken } size={ '48px' } />
                <div className="flex flex-col overflow-hidden">
                    <div className="text-2xl leading-7 tracking-[-0.01em] font-bold truncate ">
                        { ifo[ poolId ].saleAmount } { offerToken.symbol }
                    </div>
                    <div className="text-sm font-bold leading-5 text-secondary">
                        { ifo[ poolId ].distributionRatio * 100 }% of total sale
                    </div>
                </div>
            </div>

            {/* input */ }
            <div className="col-span-2 px-4 text-center md:col-span-1">
                <div className={ status === 'finished' && 'hidden' }>
                    <div className="flex items-center justify-between mb-2 text-left cursor-pointer text-secondary">
                        <div>
                            { raiseToken.symbol } { i18n._( t`Balance` ) }:{ ' ' }
                            { formatNumberScale( rasieTokenBalance?.toSignificant( 6, undefined, 4 ) ?? 0, false, 4 ) }
                        </div>
                        { poolId === PoolIds.poolBasic && (
                            <div className="text-sm text-blue">
                                { limitPerUserInLP.isGreaterThan( 0 ) &&
                                    `maxCommit: ${( <br /> )}
                ${( Number( maximumTokenEntry ) / 1e18 ).toFixed( 6 )} EMO` }
                            </div>
                        ) }
                    </div>

                    {/* <div className={`relative flex items-center w-full mb-4 ${inputError ? 'rounded border border-red' : ''}`}> */ }

                    <div className="relative flex items-center w-full mb-4">
                        <NumericalInput
                            className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple"
                            value={ input }
                            onUserInput={ handleInput }
                        />
                        { account && (
                            <Button
                                variant="outlined"
                                color="blue"
                                size="xs"
                                onClick={ () => {
                                    if ( !rasieTokenBalance?.equalTo( ZERO ) ) {
                                        setInput(
                                            poolId === PoolIds.poolBasic && limitPerUserInLP.isGreaterThan( 0 )
                                                ? getBalanceAmount( maximumTokenEntry ).toFixed( 7 ).slice( 0, -1 )
                                                : rasieTokenBalance?.toFixed( raiseToken?.decimals )
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
                            disabled={ approvalState === ApprovalState.PENDING || status === 'coming_soon' }
                            onClick={ approve }
                        >
                            { approvalState === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving` ) }</Dots> : i18n._( t`Approve` ) }
                        </Button>
                    ) : (
                        <Button
                            color={ buttonDisabled || !walletConnected ? 'blue' : insufficientFunds ? 'red' : 'blue' }
                            onClick={ handleDepositPool }
                            disabled={ buttonDisabled || inputError }
                        >
                            { !walletConnected
                                ? i18n._( t`Connect Wallet` )
                                : !input
                                    ? i18n._( t`Commit` )
                                    : insufficientFunds
                                        ? i18n._( t`Insufficient Balance` )
                                        : i18n._( t`Commit` ) }
                        </Button>
                    ) }
                </div>

                {/* claim */ }
                { status === 'finished' &&
                    now > publicIfoData.endTimeNum &&
                    ( userPoolCharacteristics.offeringAmountInToken.isGreaterThan( 0 ) ||
                        userPoolCharacteristics.refundingAmountInLP.isGreaterThan( 0 ) ) && (
                        <Button
                            className="w-full mt-2"
                            color={
                                allowClaimStatus && userPoolCharacteristics.offeringTokenTotalHarvest.isGreaterThan( 0 )
                                    ? 'gradient'
                                    : 'gray'
                            }
                            disabled={
                                claimPendingTx ||
                                !allowClaimStatus ||
                                !userPoolCharacteristics.offeringTokenTotalHarvest.isGreaterThan( 0 )
                            }
                            onClick={ handleHarvestPool }
                        >
                            { claimPendingTx ? (
                                <Dots>{ i18n._( t`Claiming` ) }</Dots>
                            ) : (
                                'Claim (' + ( Number( userPoolCharacteristics.offeringTokenTotalHarvest ) / 1e18 ).toFixed( 4 ) + ')'
                            ) }
                        </Button>
                    ) }

                { status === 'finished' &&
                    now > publicIfoData.endTimeNum &&
                    userPoolCharacteristics.amountTokenCommittedInLP.isLessThanOrEqualTo( 0 ) && (
                        <Button className="w-full mt-2" color="gray" disabled={ true }>
                            You didn't participate
                        </Button>
                    ) }
            </div>

            {/* info */ }
            <IfoCardDetails poolId={ poolId } ifo={ ifo } publicIfoData={ publicIfoData } walletIfoData={ walletIfoData } />
        </div>
    )
}

export default IfoPoolCard
