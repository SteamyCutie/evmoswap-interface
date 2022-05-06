import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { AutoRow, RowBetween } from '../../../components/Row'
import Button, { ButtonConfirmed, ButtonError } from '../../../components/Button'
import { Currency, CurrencyAmount, Percent, Token, ZERO } from '@evmoswap/core-sdk'
import React, { useCallback, useMemo, useState } from 'react'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../../modals/TransactionConfirmationModal'
import { calculateGasMargin, calculateSlippageAmount } from '../../../functions/trade'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from '../../../state/user/hooks'
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
import { STABLE_POOLS } from 'app/constants/pools'
import { useStablePoolContract, useStablePoolInfo, useStableTokensInfo, useStableTokenToReceive } from 'app/features/exchange-stable/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { classNames, tryParseAmount } from 'app/functions'
import { currencyAmountsToString } from 'app/features/exchange-stable/utils'
import { ArrowDownIcon } from '@heroicons/react/solid'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import Dots from 'app/components/Dots'
import NeonSelect, { NeonSelectItem } from 'app/components/Select'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent( 50, 10_000 )


export default function Add () {

    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const router = useRouter()

    //pool details
    const poolParams = router.query.pool;
    const poolId = Array.isArray( poolParams ) ? poolParams[ 0 ] : poolParams;
    const pools = STABLE_POOLS[ chainId ];
    const [ pool, poolAddress ] = useMemo( () => {
        const poolAddresses = Object.keys( pools );
        let address = poolAddresses[ 0 ];
        let resp = pools[ address ]
        for ( let index = 0; index < poolAddresses.length; index++ ) {
            if ( String( pools?.[ poolAddresses[ index ] ]?.name ).toLowerCase() === String( poolId ).toLowerCase() ) {
                address = poolAddresses[ index ]
                resp = pools[ address ];
                break;
            }
        }
        return [ resp, address ];
    }, [ poolId, pools ] )
    const poolContract = useStablePoolContract( poolAddress )


    //pool lp
    const poolInfo = useStablePoolInfo( poolAddress );
    const lpToken = poolInfo?.lpToken ? { ...pool?.lpToken, ...{ address: poolInfo.lpToken } } : pool?.lpToken
    const balance = useTokenBalance( account, lpToken ? new Token( chainId, lpToken.address, lpToken.decimals, lpToken.symbol ) : undefined );
    const lpTokenCurrency = balance?.currency;


    //pool pooledTokens details
    const poolTokensInfo = useStableTokensInfo( poolAddress, pool?.pooledTokens )
    const poolBalances = poolTokensInfo?.balances;
    const tokens = useMemo( () => {
        let tokens: Currency[] = [];
        if ( pool )
            pool.pooledTokens.map( ( t ) => {
                tokens[ t.index ] = new Token( chainId, poolTokensInfo?.addresses?.[ t.index ] ?? t.address, t.decimals, t.symbol, t.name )
            } )
        return tokens;
    }, [ pool, poolTokensInfo.addresses, chainId ] )



    //handle inputs data
    const [ tokenInput, setTokenInput ] = useState( "" )
    const onTokenInput = ( amount: string ) => {
        if ( amount?.split( "." )?.[ 1 ]?.length > lpToken?.decimals ) return;
        setTokenInput( amount )
    }
    const parsedAmount = useMemo( () => {
        return tryParseAmount(
            tokenInput,
            lpTokenCurrency
        )
    }, [ tokenInput, lpTokenCurrency ] );


    //token selection management
    const [ selectTokenIndex, setSelectedTokenIndex ] = useState( -1 ); //below 0 means all
    const singleMode = selectTokenIndex >= 0;


    // modal and loading
    const [ showConfirm, setShowConfirm ] = useState<boolean>( false )
    const [ attemptingTxn, setAttemptingTxn ] = useState<boolean>( false ) // clicked confirm


    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const allowedSlippage = useUserSlippageToleranceWithDefault( DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE ) // custom from users
    const [ txHash, setTxHash ] = useState<string>( '' )
    const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected


    //basic infrered stats
    const estimatedSLPs = useStableTokenToReceive( poolAddress, parsedAmount, selectTokenIndex );
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

                error = i18n._( t`Exceeds available` )
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
                }
            } )
    }

    //confirmation modal componentes
    function modalHeader () {
        return (
            <div className="grid gap-4 pt-3 pb-4">
                <div className="grid gap-2">
                    {
                        ( singleMode ? [ minToMints[ selectTokenIndex ] ] : minToMints ).map( ( estimate, index ) => {
                            const notLastIndex = singleMode ? false : index !== ( minToMints.length - 1 )
                            return (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CurrencyLogo currency={ estimate.currency } size={ 48 } />
                                            <div className="text-2xl font-bold text-high-emphesis">
                                                { estimate?.toSignificant( 6 ) }
                                            </div>
                                        </div>
                                        <div className="ml-3 text-2xl font-medium text-high-emphesis">{ estimate.currency?.symbol }</div>
                                    </div>
                                    { notLastIndex &&
                                        <div className="ml-3 mr-3 min-w-[24px]">
                                            <Plus size={ 24 } />
                                        </div>
                                    }</> )
                        } )
                    }
                </div>
                <div className="justify-start text-sm text-secondary">
                    { t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
                        4
                    )}% your transaction will revert.` }
                </div>
            </div >
        )
    }

    function modalBottom () {
        return (
            <div className="p-6 mt-0 -m-6 bg-dark-800">
                <div className="grid gap-1 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-secondary">{ i18n._( t`${lpToken?.symbol} Burned` ) }</div>
                        <div className="text-sm font-bold justify-center items-center flex right-align pl-1.5 text-high-emphasis">
                            { parsedAmount?.toSignificant( 6 ) }
                        </div>
                    </div>
                </div>
                <Button
                    color="gradient"
                    size="lg"
                    disabled={ !isValid }
                    onClick={ onRemove }
                >
                    { error || i18n._( t`Confirm` ) }
                </Button>
            </div>
        )
    }

    const pendingText = `${i18n._( t`Withdrawing` )} ${amountSummaryTexts.join( ', ' )}`

    const handleDismissConfirmation = useCallback( () => {
        setShowConfirm( false )
        // if there was a tx hash, we want to clear the input
        if ( txHash ) {
            setTokenInput( '' )
        }
        setTxHash( '' )
    }, [ txHash ] )

    return (
        <Container id="remove-liquidity-page" className="py-4 space-y-4 md:py-8 lg:py-12" maxWidth="2xl">
            <Head>
                <title>Remove Liquidity | EvmoSwap</title>
                <meta key="description" name="description" content="Remove liquidity from the EvmoSwap AMM" />
            </Head>
            <div className="px-4 mb-5">
                <NavLink href="/stable-pool">
                    <a className="flex items-center space-x-2 text-base font-medium text-center cursor-pointer text-secondary hover:text-high-emphesis">
                        <span>{ i18n._( t`View Liquidity Positions` ) }</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </NavLink>
            </div>

            <DoubleGlowShadow>
                <div className="p-4 space-y-4 rounded bg-dark-900" style={ { zIndex: 1 } }>

                    <RowBetween>
                        <div className="text-2xl text-white font-bold">{ i18n._( t`Withdraw` ) }</div>
                        <ExchangeHeader
                            showNavs={ false }
                            allowedSlippage={ allowedSlippage }
                        />
                    </RowBetween>
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
                                    currency={ lpTokenCurrency }
                                    id={ `add-liquidity-input-token-lp}` }
                                    showCommonBases
                                    disableCurrencySelect={ true }
                                />

                                <AutoColumn justify="space-between" className="py-2.5">
                                    <AutoRow justify={ 'flex-start' } style={ { padding: '0 1rem', 'justify-content': 'space-between' } }>
                                        <button className="z-10 -mt-6 -mb-6 rounded-full cursor-default bg-dark-900 p-3px">
                                            <div className="p-3 rounded-full bg-dark-800">
                                                <ArrowDownIcon width="32px" height="32px" />
                                            </div>

                                        </button>
                                    </AutoRow>
                                </AutoColumn>

                                <div id="remove-liquidity-output" className="p-5 rounded bg-dark-800">
                                    <div className="flex flex-col justify-between space-y-3">
                                        <div className="w-full text-white" style={ { margin: 'auto 0px' } }>
                                            <RowBetween className="items-center mb-4">
                                                <div>{ i18n._( t`You Will Receive` ) }:</div>
                                                <div className="flex text-sm font-bold text-secondary">
                                                    <NeonSelect value={ !singleMode ? i18n._( t`All Tokens` ) : tokens[ selectTokenIndex ].symbol }>
                                                        <>
                                                            <NeonSelectItem value={ -1 } onClick={ () => { setSelectedTokenIndex( -1 ) } }>
                                                                { i18n._( t`All Tokens` ) }
                                                            </NeonSelectItem>
                                                            {
                                                                pool && pool.pooledTokens.map( ( token ) => {
                                                                    return (
                                                                        <NeonSelectItem key={ token.index } value={ token.index } onClick={ () => { setSelectedTokenIndex( token.index ) } }>
                                                                            { token.symbol }
                                                                        </NeonSelectItem>
                                                                    )
                                                                } )
                                                            }
                                                        </>
                                                    </NeonSelect>
                                                </div>
                                            </RowBetween>
                                        </div>

                                        <div className="flex flex-col space-y-3 md:flex-row md:space-x-6 md:space-y-0">
                                            {
                                                ( !singleMode ? tokens : [ tokens[ selectTokenIndex ] ] ).map( ( token, i ) => {
                                                    const index = singleMode ? selectTokenIndex : i;
                                                    return (
                                                        <div
                                                            className={ classNames(
                                                                "flex flex-row items-center w-full p-3 pr-8 space-x-3 rounded bg-dark-900 justify-between"
                                                            ) }
                                                            key={ index }
                                                        >

                                                            <CurrencyLogo currency={ token } size="46px" />
                                                            <AutoColumn>
                                                                <div className="text-white truncate">{ minToMints?.[ index ]?.toSignificant( 6 ) || '-' }</div>
                                                                <div className="text-sm">{ token?.symbol }</div>
                                                            </AutoColumn>
                                                        </div> )
                                                } )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={ { position: 'relative' } }>
                                { !account ? (
                                    <Web3Connect size="lg" color="blue" className="w-full" />
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <ButtonConfirmed
                                            onClick={ approveCallback }
                                            confirmed={ approval === ApprovalState.APPROVED }
                                            disabled={ approval !== ApprovalState.NOT_APPROVED }
                                        >
                                            { approval === ApprovalState.PENDING ? (
                                                <Dots>{ i18n._( t`Approving` ) }</Dots>
                                            ) : approval === ApprovalState.APPROVED ? (
                                                i18n._( t`Approved` )
                                            ) : (
                                                i18n._( t`Approve` )
                                            ) }
                                        </ButtonConfirmed>
                                        <ButtonError
                                            onClick={ () => {
                                                setShowConfirm( true )
                                            } }
                                            disabled={ !isValid }
                                            error={ !isValid && !!parsedAmount }
                                        >
                                            { error || i18n._( t`Remove` ) }
                                        </ButtonError>
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