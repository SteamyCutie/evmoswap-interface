
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { AutoRow, RowBetween } from '../../../components/Row'
import Button, { ButtonConfirmed, ButtonError } from '../../../components/Button'
import { Currency, CurrencyAmount, Percent, Token, ZERO } from '@evmoswap/core-sdk'
import React, { useCallback, useMemo, useState } from 'react'
import TransactionConfirmationModal, { ConfirmationModalContent, TransactionErrorContent } from '../../../modals/TransactionConfirmationModal'
import { calculateGasMargin, calculateSlippageAmount } from '../../../functions/trade'
import { useUserSlippageToleranceWithDefault } from '../../../state/user/hooks'
import { AutoColumn } from '../../../components/Column'
import { BigNumber } from '@ethersproject/bignumber'
import Container from '../../../components/Container'
import CurrencyInputPanel from '../../../components/CurrencyInputPanel'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import ExchangeHeader from '../../../features/trade/Header'
import Head from 'next/head'
import NavLink from '../../../components/NavLink'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { TransactionResponse } from '@ethersproject/providers'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import useTransactionDeadline from '../../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { useStablePoolFromRouter, useStablePoolInfo, useStableTokenToReceive } from 'app/features/exchange-stable/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { classNames, tryParseAmount } from 'app/functions'
import { contractErrorToUserReadableMessage, currencyAmountsToString } from 'app/features/exchange-stable/utils'
import { ArrowDownIcon, ArrowSmDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/solid'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import Dots from 'app/components/Dots'
import NeonSelect, { NeonSelectItem } from 'app/components/Select'
import { Divider } from 'app/components/Divider/Divider'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent( 50, 10_000 )


export default function Remove () {

    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const router = useRouter()

    //pool details
    const { poolId, pool, poolAddress, poolContract } = useStablePoolFromRouter( router.query.pool );

    //pool lp
    const poolInfo = useStablePoolInfo( poolId );
    const lpToken = poolInfo.lpToken;
    const balance = useTokenBalance( account, lpToken );

    //pool pooled Tokens details
    const poolTokensInfo = poolInfo.pooledTokensInfo
    const poolBalances = poolTokensInfo?.balances;
    const tokens = poolTokensInfo.tokens || []



    //handle inputs data
    const [ tokenInput, setTokenInput ] = useState( "" )
    const onTokenInput = ( amount: string ) => {
        if ( amount?.split( "." )?.[ 1 ]?.length > lpToken?.decimals ) return;
        setTokenInput( amount )
    }
    const parsedAmount = useMemo( () => {
        return tryParseAmount(
            tokenInput,
            lpToken
        )
    }, [ tokenInput, lpToken ] );


    //token selection management
    const [ selectTokenIndex, setSelectedTokenIndex ] = useState( -1 ); //below 0 means all
    const singleMode = selectTokenIndex >= 0;


    // modal and loading
    const [ showConfirm, setShowConfirm ] = useState<boolean>( false )
    const [ attemptingTxn, setAttemptingTxn ] = useState<boolean>( false ) // clicked confirm
    const [ errorMessage, setErrorMessage ] = useState( "" );


    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const allowedSlippage = useUserSlippageToleranceWithDefault( DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE ) // custom from users
    const [ txHash, setTxHash ] = useState<string>( '' )
    const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected


    //basic infrered stats
    const estimatedSLPs = useStableTokenToReceive( poolId, parsedAmount, selectTokenIndex );
    const [ minToMints, minToMintsWithSlippage, amountSummaryTexts ] = useMemo( () => {

        let tempMints: CurrencyAmount<Currency>[] = new Array( tokens.length );
        let tempMintsWithSlippage = tempMints;
        let summaryTexts = [];

        if ( singleMode ) {

            tempMints[ selectTokenIndex ] = CurrencyAmount.fromRawAmount( tokens[ selectTokenIndex ], estimatedSLPs ?? "0" );
            tempMintsWithSlippage[ selectTokenIndex ] = CurrencyAmount.fromRawAmount( tokens[ selectTokenIndex ], calculateSlippageAmount( tempMints[ selectTokenIndex ], allowedSlippage )[ 0 ] )
            summaryTexts.push( ` ${tempMintsWithSlippage[ selectTokenIndex ]?.toSignificant( 3 )} ${tokens[ selectTokenIndex ]?.symbol}` )
        }
        else if ( Array.isArray( estimatedSLPs ) ) {

            estimatedSLPs.map( ( estimate, index ) => {
                tempMints[ index ] = CurrencyAmount.fromRawAmount( tokens[ index ], estimate ?? "0" )
                tempMintsWithSlippage[ index ] = CurrencyAmount.fromRawAmount( tokens[ index ], calculateSlippageAmount( tempMintsWithSlippage[ index ], allowedSlippage )[ 0 ] )
                summaryTexts.push( ` ${tempMintsWithSlippage[ index ]?.toSignificant( 3 )} ${tokens[ index ]?.symbol}` )
            } )
        }
        return [ tempMints, tempMintsWithSlippage, summaryTexts ];
    }, [ estimatedSLPs, allowedSlippage, selectTokenIndex, tokens, singleMode ] )


    // pooled tokens approval handlings
    const [ approval, approveCallback ] = useApproveCallback( parsedAmount, poolAddress )

    //error montior for whole flow.
    const checkError = () => {

        let error: string | undefined

        if ( !account ) {
            error = i18n._( t`Connect Wallet` )
        }

        if ( !error ) {

            const amount = parsedAmount ?? undefined;

            if ( !balance || !poolBalances ) {

                error = i18n._( t`Remove` ) //loading or not ready
            } else if ( amount && balance.lessThan( amount ) ) {

                error = i18n._( t`Insufficient ${lpToken?.symbol} balance` )
            } else if ( amount && singleMode && poolBalances && Number( amount.toExact() ) > Number( poolBalances[ selectTokenIndex ].toExact() ) ) {

                error = i18n._( t`Exceeds available - use 'Max'` )
            } else if ( amount && amount.greaterThan( ZERO ) && approval !== ApprovalState.APPROVED ) {

                error = i18n._( t`Requires ${lpToken?.symbol} approval` )

            }

        }

        return error;

    }
    const error = checkError();
    const isValid = !error;

    const addTransaction = useTransactionAdder()

    async function onRemove () {
        if ( !chainId || !library || !account || !poolContract || !isValid ) return


        if ( !deadline ) {
            return
        }

        const tokenInputBN = currencyAmountsToString( [ parsedAmount ] )[ 0 ];
        const endpoint = singleMode ? "removeLiquidityOneToken" : "removeLiquidity";
        const minAmounts = singleMode ? minToMintsWithSlippage[ selectTokenIndex ].quotient.toString() : minToMintsWithSlippage.map( ( e, i ) => e.quotient.toString() )

        let estimate,
            method: ( ...args: any ) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null


        estimate = poolContract.estimateGas[ endpoint ]
        method = poolContract[ endpoint ]

        args = [
            tokenInputBN,
            selectTokenIndex,
            minAmounts,
            deadline.toHexString(),
        ]

        //remove token index in not single mode
        if ( !singleMode )
            args.splice( 1, 1 );

        value = null

        setAttemptingTxn( true )
        await estimate( ...args, value ? { value } : {} )
            .then( ( estimatedGasLimit ) =>
                method( ...args, {
                    ...( value ? { value } : {} ),
                    gasLimit: calculateGasMargin( estimatedGasLimit ),
                } ).then( ( response ) => {
                    setAttemptingTxn( false )

                    addTransaction( response, {
                        summary: `${i18n._( t`Remove` )} ${amountSummaryTexts.join( ', ' )}`,
                    } )

                    setTxHash( response.hash )

                    ReactGA.event( {
                        category: 'Liquidity',
                        action: 'Remove',
                        label: pool.name,
                    } )
                } )
            )
            .catch( ( error ) => {
                setAttemptingTxn( false )
                // we only care if the error is something _other_ than the user rejected the tx
                if ( error?.code !== 4001 ) {
                    console.error( error )
                    setErrorMessage( contractErrorToUserReadableMessage( error ) )
                }
            } )
    }
    const pendingText = `${i18n._( t`Withdrawing` )} ${amountSummaryTexts.join( ', ' )}`

    const handleDismissConfirmation = useCallback( () => {
        setShowConfirm( false )
        // if there was a tx hash, we want to clear the input
        if ( txHash ) {
            setTokenInput( '' )
        }
        setTxHash( '' )
        setErrorMessage( '' )
    }, [ txHash ] )

    //confirmation modal componentes
    function modalHeader () {
        return (
            <div className="grid gap-4 pb-4">
                <div className="grid">
                    { ( singleMode ? [ minToMints[ selectTokenIndex ] ] : minToMints ).map( ( estimate, index ) => {
                        const notLastIndex = singleMode ? false : index !== minToMints.length - 1
                        return (
                            <React.Fragment key={ index }>
                                <div className="flex items-center justify-between text-dark-primary dark:text-light-primary bg-light dark:bg-dark p-4 rounded-xl text-3xl font-medium transition-all">
                                    <div className="flex items-center gap-4">
                                        <CurrencyLogo currency={ estimate.currency } size={ 40 } />
                                        <div className="">{ estimate?.toSignificant( 6 ) }</div>
                                    </div>
                                    <div className="ml-3">{ estimate.currency?.symbol }</div>
                                </div>
                                { notLastIndex && (
                                    <div className="flex justify-center -my-5 z-0">
                                        <div className="p-2 border-4 border-light-secondary dark:border-dark-secondary z-1 rounded-2xl text-dark-primary dark:text-light-primary bg-light-primary dark:bg-dark-primary transition-all">
                                            <PlusIcon width={ 24 } height={ 24 } />
                                        </div>
                                    </div>
                                ) }
                            </React.Fragment>
                        )
                    } ) }
                </div>
                <div className="justify-start text-sm opacity-80 dark:opacity-50 transition-all max-w-md">
                    { t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
                        4
                    )}% your transaction will revert.` }
                </div>
            </div>
        )
    }

    function modalBottom () {
        return (
            <div className="p-6 pt-0 mt-0 -m-6">
                <div className="grid gap-1 pb-6">
                    <div className="flex items-center justify-between text-dark-primary dark:text-light-primary transition-all">
                        <div className="text-base">{ i18n._( t`${lpToken?.symbol} burned` ) }</div>
                        <div className="text-base font-bold justify-center items-center flex right-align pl-1.5">
                            { parsedAmount?.toSignificant( 6 ) }
                        </div>
                    </div>
                </div>
                <Button color="gradient" size="lg" disabled={ !isValid } onClick={ onRemove }>
                    { error || i18n._( t`Confirm` ) }
                </Button>
            </div>
        )
    }
    return (
        <Container id="remove-liquidity-page" className="p-4 space-y-4 md:py-8 lg:py-12" maxWidth="2xl">
            <Head>
                <title>Remove Liquidity | EvmoSwap</title>
                <meta key="description" name="description" content="Remove liquidity from the EvmoSwap AMM" />
            </Head>

            <div className="flex items-center mb-5">
                <a
                    href="/stable-pool"
                    className="flex items-center space-x-2 text-base text-center transition-all cursor-pointer text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80"
                >
                    <span>{ i18n._( t`View Liquidity Positions` ) }</span>
                    <ChevronRightIcon width={ 18 } height={ 18 } />
                </a>
            </div>

            <DoubleGlowShadow>
                <div className="gap-4 p-3 md:p-4 lg:p-6 transition-all rounded-3xl z-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xl text-dark-primary dark:text-light-primary transition-all px-2 font-bold  mb-4">
                            { i18n._( t`Withdraw` ) }
                        </div>
                        <ExchangeHeader showNavs={ false } allowedSlippage={ allowedSlippage } />
                    </div>
                    <div>
                        <TransactionConfirmationModal
                            isOpen={ showConfirm }
                            onDismiss={ handleDismissConfirmation }
                            attemptingTxn={ attemptingTxn }
                            hash={ txHash ? txHash : '' }
                            content={ () => (
                                <ConfirmationModalContent
                                    title={ i18n._( t`You will receive` ) }
                                    onDismiss={ handleDismissConfirmation }
                                    topContent={ modalHeader }
                                    bottomContent={ modalBottom }
                                />
                            ) }
                            pendingText={ pendingText }
                            className="!bg-light-secondary dark:!bg-dark-secondary"
                        />
                        <AutoColumn gap="md">
                            <div>
                                <CurrencyInputPanel
                                    value={ tokenInput }
                                    onUserInput={ ( value ) => onTokenInput( value ) }
                                    onMax={ () => {
                                        onTokenInput( singleMode ? poolBalances?.[ selectTokenIndex ]?.toExact() : balance?.toExact() )
                                    } }
                                    showMaxButton={ true }
                                    currency={ lpToken }
                                    id={ `add-liquidity-input-token-lp` }
                                    showCommonBases
                                    disableCurrencySelect={ true }
                                    showCurrencyValue={ false }
                                    hideBalance={ true }
                                    className="pb-6"
                                />

                                <div className="flex justify-center -mt-4 -mb-5">
                                    <div className="p-2 border-4 border-light-secondary dark:border-dark-secondary z-1 rounded-2xl text-dark-primary dark:text-light-primary bg-light-primary dark:bg-dark-primary transition-all">
                                        <ArrowSmDownIcon width={ 18 } height={ 18 } />
                                    </div>
                                </div>

                                <div
                                    id="remove-liquidity-output"
                                    className="p-5 rounded-xl text-dark-primary dark:text-light-primary bg-light-primary dark:bg-dark-primary transition-all"
                                >
                                    <div className="flex flex-col justify-between space-y-0">
                                        <div className="w-full" style={ { margin: 'auto 0px' } }>
                                            <RowBetween className="items-center mb-3 font-medium">
                                                <div className="text-base">{ i18n._( t`You will receive` ) }</div>
                                                <div className="flex text-sm">
                                                    <NeonSelect value={ <span className='font-medium'>{ !singleMode ? i18n._( t`All Tokens` ) : tokens[ selectTokenIndex ].symbol }</span> }>
                                                        <>
                                                            <NeonSelectItem
                                                                value={ -1 }
                                                                onClick={ () => {
                                                                    setSelectedTokenIndex( -1 )
                                                                } }
                                                            >
                                                                { i18n._( t`All Tokens` ) }
                                                            </NeonSelectItem>
                                                            <Divider />
                                                            { tokens &&
                                                                tokens.map( ( token, index ) => {
                                                                    return (
                                                                        <React.Fragment key={ index }>

                                                                            <NeonSelectItem
                                                                                value={ index }
                                                                                onClick={ () => {
                                                                                    setSelectedTokenIndex( index )
                                                                                } }
                                                                            >
                                                                                { token.symbol }
                                                                            </NeonSelectItem>
                                                                            { index + 1 < tokens.length && <Divider /> }
                                                                        </React.Fragment>

                                                                    )
                                                                } ) }
                                                        </>
                                                    </NeonSelect>
                                                </div>
                                            </RowBetween>
                                        </div>

                                        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                                            { ( !singleMode ? tokens : [ tokens[ selectTokenIndex ] ] ).map( ( token, i ) => {
                                                const index = singleMode ? selectTokenIndex : i
                                                return (
                                                    <div
                                                        className={ classNames(
                                                            'flex flex-row items-center w-full py-3 pl-4 pr-8 space-x-3 rounded-lg text-dark-primary dark:text-light-primary bg-light-secondary dark:bg-dark-secondary transition-all'
                                                        ) }
                                                        key={ index }
                                                    >
                                                        <CurrencyLogo currency={ token } size={ 32 } />
                                                        <div className="flex flex-col -space-y-1 font-semibold text-lg">
                                                            <div className="truncate">{ minToMints?.[ index ]?.toSignificant( 6 ) || '-' }</div>
                                                            <div>{ token?.symbol }</div>
                                                        </div>
                                                    </div>
                                                )
                                            } ) }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={ { position: 'relative' } }>
                                { !account ? (
                                    <Web3Connect size="lg" color="blue" className="w-full" />
                                ) : (
                                    <div className="grid grid-rows gap-4 md:grid-cols-2">
                                        <ButtonError
                                            onClick={ () => {
                                                setShowConfirm( true )
                                            } }
                                            disabled={ !isValid }
                                            error={ !isValid && !!parsedAmount }
                                            color={ isValid ? 'red' : 'gray' }
                                        >
                                            { error || i18n._( t`Remove` ) }
                                        </ButtonError>
                                        <ButtonConfirmed
                                            onClick={ approveCallback }
                                            confirmed={ approval === ApprovalState.APPROVED }
                                            disabled={ approval !== ApprovalState.NOT_APPROVED }
                                            variant={ approval == ApprovalState.APPROVED ? 'outlined' : 'filled' }
                                        >
                                            { approval === ApprovalState.PENDING ? (
                                                <Dots>{ i18n._( t`Approving` ) }</Dots>
                                            ) : approval === ApprovalState.APPROVED ? (
                                                i18n._( t`Approved` )
                                            ) : (
                                                i18n._( t`Approve` )
                                            ) }
                                        </ButtonConfirmed>
                                    </div>
                                ) }
                            </div>
                        </AutoColumn>
                    </div>
                </div>
            </DoubleGlowShadow>
        </Container>
    )
}