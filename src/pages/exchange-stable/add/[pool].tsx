import { ApprovalState } from '../../../hooks/useApproveCallback'
import { AutoRow, RowBetween } from '../../../components/Row'
import { ButtonError } from '../../../components/Button'
import { Currency, CurrencyAmount, Percent, ZERO } from '@evmoswap/core-sdk'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import TransactionConfirmationModal, {
    ConfirmationModalContent,
    TransactionErrorContent,
} from '../../../modals/TransactionConfirmationModal'
import { calculateGasMargin, calculateSlippageAmount } from '../../../functions/trade'
import { useExpertModeManager, useUserSlippageToleranceWithDefault } from '../../../state/user/hooks'
import { AutoColumn } from '../../../components/Column'
import { BigNumber } from '@ethersproject/bignumber'
import Container from '../../../components/Container'
import CurrencyInput from '../../../components/CurrencyInput'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import ExchangeHeader from '../../../features/trade/Header'
import Head from 'next/head'
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
import { useStablePoolFromRouter, useStablePoolInfo, useStableTokenToMint } from 'app/features/exchange-stable/hooks'
import ApproveToken from 'app/features/exchange-stable/components/ApproveToken'
import { useCurrencyBalances } from 'app/state/wallet/hooks'
import { formatNumberPercentage, tryParseAmount } from 'app/functions'
import StablePositionCard from 'app/features/exchange-stable/components/StablePositionCard'
import StablePoolInfo from 'app/features/exchange-stable/components/StablePoolDetail'
import { useReload } from 'app/hooks/useReload'
import ConfirmAddStableModalBottom from 'app/features/exchange-stable/components/ConfirmAddStableModal'
import {
    contractErrorToUserReadableMessage,
    currencyAmountsToString,
    sumCurrencyAmounts,
} from 'app/features/exchange-stable/utils'
import AddLiquidityPositionNav from 'app/features/liquidity/AddLiquidityPositionNav'
import Button from 'app/components/Button/index'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent( 50, 10_000 )

export default function Add () {
    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const router = useRouter()

    //pool details
    const { poolId, pool, poolAddress, poolContract } = useStablePoolFromRouter( router.query.pool )

    //pool pooled Tokens details
    const poolInfo = useStablePoolInfo( poolId )
    const poolTokensInfo = poolInfo.pooledTokensInfo
    const poolTVL = Number( poolTokensInfo.total ) * Number( poolInfo.virtualPrice )
    const tokens = poolTokensInfo.tokens || []

    //pool lp
    const lpToken = poolInfo.lpToken

    //get user balances for each pooled tokens
    const balances = useCurrencyBalances( account ?? undefined, tokens )

    //handle inputs data
    const defaultInputs = new Array( tokens.length ).fill( '' )
    const [ tokensInput, setTokensInput ] = useState( defaultInputs )
    const onTokenInput = ( index, amount: string ) => {
        if ( amount?.split( '.' )?.[ 1 ]?.length > tokens[ index ]?.decimals ) return
        const newInput = [ ...tokensInput ]
        newInput[ index ] = amount
        setTokensInput( newInput )
    }
    const parsedAmounts = useMemo( () => {
        const amounts: CurrencyAmount<Currency>[] | undefined[] = new Array( tokens.length )
        tokens.map( ( token, index ) => {
            const typedValue = tokensInput[ index ] || '0'
            amounts[ index ] = tryParseAmount( typedValue, token, true )
        } )
        return amounts
    }, [ tokensInput, tokens ] )

    const amountSummaryTexts = parsedAmounts.map( ( amount ) => {
        return ` ${amount?.toSignificant( 3 )} ${amount?.currency?.symbol}`
    } )

    // modal and loading
    const [ showConfirm, setShowConfirm ] = useState<boolean>( false )
    const [ attemptingTxn, setAttemptingTxn ] = useState<boolean>( false ) // clicked confirm
    const [ errorMessage, setErrorMessage ] = useState( '' )

    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const allowedSlippage = useUserSlippageToleranceWithDefault( DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE ) // custom from users
    const [ txHash, setTxHash ] = useState<string>( '' )
    const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
    const [ isExpertMode ] = useExpertModeManager()

    //basic infrered stats
    const estimatedSLP = useStableTokenToMint( poolId, parsedAmounts, true )
    const minToMint = lpToken ? CurrencyAmount.fromRawAmount( lpToken, estimatedSLP ?? '0' ) : undefined
    const minToMintWithSlippage = lpToken
        ? CurrencyAmount.fromRawAmount( lpToken, calculateSlippageAmount( minToMint, allowedSlippage )[ 0 ] )
        : undefined
    const parsedAmountsTotal = Number( sumCurrencyAmounts( parsedAmounts ) )
    const poolTokenPercentage = formatNumberPercentage( parsedAmountsTotal, poolTokensInfo.total + parsedAmountsTotal )

    // pooled tokens approval handlings
    const approvals = useRef( new Array( tokens.length ).fill( ApprovalState.UNKNOWN ) ).current
    const [ reload ] = useReload()
    const updateApprovals = ( index, approval ) => {
        approvals[ index ] = approval
        if ( approval === ApprovalState.APPROVED ) reload()
    }
    const totalApproved = useMemo( () => {
        let count = 0
        for ( let index = 0; index < tokens.length; index++ ) {
            if ( approvals[ index ] === ApprovalState.APPROVED ) {
                count++
                break
            }
        }
        return count
    }, [ approvals, tokens ] )
    const allTokenApproved = totalApproved === tokens.length

    //error montior for whole flow.
    const checkError = () => {
        let error: string | undefined
        let zeroCount = 0

        if ( !account ) {
            error = i18n._( t`Connect Wallet` )
        }

        if ( !error )
            for ( let index = 0; index < tokens.length; index++ ) {
                const amount = parsedAmounts[ index ] ?? undefined

                const balance = balances[ index ]
                if ( !balance ) {
                    error = i18n._( t`Add` ) //loading or not ready
                    break
                }

                const token = balance.currency
                const approval = approvals[ index ]

                if ( !amount?.greaterThan( ZERO ) ) {
                    zeroCount++
                }

                if ( amount && balance.lessThan( amount ) ) {
                    error = i18n._( t`Insufficient ${token?.symbol} balance` )
                    break
                }

                if ( amount && amount.greaterThan( ZERO ) && approval !== ApprovalState.APPROVED ) {
                    error = i18n._( t`Requires ${token?.symbol} approval` )
                    break
                }
            }

        if ( zeroCount >= tokens.length ) {
            error = error ?? i18n._( t`Enter an amount` )
        }

        return error
    }
    const error = checkError()
    const isValid = !error

    const addTransaction = useTransactionAdder()

    async function onAdd () {
        if ( !chainId || !library || !account || !poolContract || !isValid ) return

        if ( !deadline ) {
            return
        }

        const tokensInputBN = currencyAmountsToString( parsedAmounts )

        let estimate,
            method: ( ...args: any ) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null

        estimate = poolContract.estimateGas.addLiquidity
        method = poolContract.addLiquidity
        args = [ tokensInputBN, minToMintWithSlippage.quotient.toString(), deadline.mul( 1000 ).toHexString() ]

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
                        summary: `${i18n._( t`Add` )} ${amountSummaryTexts.join( `, ` )}`,
                    } )

                    setTxHash( response.hash )

                    ReactGA.event( {
                        category: 'Liquidity',
                        action: 'Add',
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

    //confirmation modal componentes
    const modalHeader = () => {
        return (
            <div className="pb-4">
                <div className="flex items-center justify-start gap-3 font-semibold text-2xl md:text-3xl">
                    <div>{ minToMint?.toSignificant( 6 ) }</div>
                    <div>{ lpToken?.symbol }</div>
                </div>
                <div className="pt-3 text-sm text-light-text dark:text-dark-text max-w-md">
                    { i18n._(
                        t`Output is estimated. If the price changes by more than ${allowedSlippage.toSignificant(
                            4
                        )}% your transaction will revert.`
                    ) }
                </div>
            </div>
        )
    }

    const modalBottom = () => {
        return (
            <ConfirmAddStableModalBottom
                lpToken={ lpToken }
                onAdd={ onAdd }
                parsedAmounts={ parsedAmounts }
                estimatedSLP={ minToMintWithSlippage }
                poolTokenPercentage={ poolTokenPercentage }
            />
        )
    }

    const pendingText = i18n._( t`Depositing ${amountSummaryTexts.join( ', ' )}` )

    const handleDismissConfirmation = useCallback( () => {
        setShowConfirm( false )
        // if there was a tx hash, we want to clear the input
        if ( txHash ) {
            setTokensInput( defaultInputs )
        }
        setTxHash( '' )

        setErrorMessage( '' )
    }, [ txHash, defaultInputs ] )

    return (
        <>
            <Head>
                <title>Add Liquidity | EvmoSwap</title>
                <meta
                    key="description"
                    name="description"
                    content="Add liquidity to the EvmoSwap AMM to enable gas optimised and low slippage trades across countless networks"
                />
            </Head>

            <Container id="add-liquidity-page" className="p-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">

                <AddLiquidityPositionNav
                    alert={ {
                        message:
                            <>
                                <b>{ i18n._( t`Tip:` ) }</b>{ ' ' }
                                { i18n._(
                                    t`By adding liquidity you'll earn 0.25% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`
                                ) }
                            </>
                    } }
                    link={ '/stable-pool' }
                />

                <DoubleGlowShadow>
                    <div className="gap-4 p-3 md:p-4 lg:p-6 transition-all rounded-3xl z-0">
                        <RowBetween className="my-2">
                            <div className="text-2xl text-dark dark:text-light font-bold">{ i18n._( t`Add` ) }</div>
                            <ExchangeHeader showNavs={ false } allowedSlippage={ allowedSlippage } />
                        </RowBetween>

                        <TransactionConfirmationModal
                            isOpen={ showConfirm }
                            onDismiss={ handleDismissConfirmation }
                            attemptingTxn={ attemptingTxn }
                            hash={ txHash }
                            content={ () =>
                                errorMessage ? (
                                    <TransactionErrorContent onDismiss={ handleDismissConfirmation } message={ errorMessage } />
                                ) : (
                                    <ConfirmationModalContent
                                        title={ i18n._( t`You will receive` ) }
                                        onDismiss={ handleDismissConfirmation }
                                        topContent={ modalHeader }
                                        bottomContent={ modalBottom }
                                    />
                                )
                            }
                            pendingText={ pendingText }
                        />
                        <div className="flex flex-col space-y-4 mt-4">
                            <div className='flex flex-col space-y-1'>
                                { tokens.map( ( token, index ) => (
                                    <React.Fragment key={ index }>
                                        <CurrencyInput
                                            value={ tokensInput[ index ] ?? '' }
                                            onUserInput={ ( value ) => onTokenInput( index, value ) }
                                            onMax={ () => {
                                                onTokenInput( index, balances?.[ index ]?.toExact() )
                                            } }
                                            showMaxButton={ false }
                                            currency={ token }
                                            id={ `add-liquidity-input-token-${index}` }
                                            showCommonBases
                                            disableCurrencySelect={ true }
                                            hideBalance={ true }
                                            label=''
                                            className='bg-light dark:bg-dark space-x-3 py-3 rounded-xl'
                                        />
                                        { index !== tokens.length - 1 && (
                                            <AutoColumn justify="space-between" className="py-0.5 z-10">
                                                <AutoRow justify={ isExpertMode ? 'space-between' : 'center' }>
                                                    <button className="p-1.5 rounded-2xl bg-light-secondary dark:bg-dark-secondary transition-all -mt-6 -mb-6">
                                                        <div className="p-2 transition-all bg-white rounded-xl hover:bg-white/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 text-dark-secondary dark:text-light-secondary">
                                                            <Plus size="18" />
                                                        </div>
                                                    </button>
                                                </AutoRow>
                                            </AutoColumn>
                                        ) }
                                    </React.Fragment>
                                ) ) }
                            </div>


                            <StablePositionCard
                                className="rounded-xl p-4 my-4"
                                amounts={ parsedAmounts }
                                poolTVL={ poolTVL }
                                estimatedSLP={ minToMint }
                                poolTokenPercentage={ poolTokenPercentage }
                            />

                            { !account ? (
                                <Web3Connect size="lg" color="gradient" className="w-full" />
                            ) : (
                                <AutoColumn gap={ 'md' }>
                                    { !allTokenApproved && !!balances?.length && (
                                        <RowBetween
                                            justify="center"
                                            align="center"
                                            className="flex-col md:flex-row space-y-4 md:space-x-2 md:space-y-0"
                                        >
                                            { tokens.map( ( _, index ) => {
                                                if ( balances?.[ index ]?.greaterThan( ZERO ) && approvals[ index ] !== ApprovalState.APPROVED )
                                                    return (
                                                        <ApproveToken
                                                            currencyAmount={ balances[ index ] }
                                                            spender={ poolAddress }
                                                            onApprovalChange={ ( approval ) => updateApprovals( index, approval ) }
                                                            key={ index }
                                                            size="default"
                                                            color="gradient"
                                                            className={ `${approvals[ index ] === ApprovalState.UNKNOWN ? 'hidden' : ''
                                                                }` }
                                                        />
                                                    )
                                            } ) }
                                        </RowBetween>
                                    ) }

                                    { totalApproved > 0 && (
                                        <Button
                                            onClick={ () => {
                                                isExpertMode ? onAdd() : setShowConfirm( true )
                                            } }
                                            color={ !isValid ? ( error.includes( 'amount' ) ? 'gray' : 'red' ) : 'gradient' }
                                            disabled={ !isValid }
                                            size="lg"
                                        >
                                            { error ?? i18n._( t`Confirm Adding Liquidity` ) }
                                        </Button>
                                    ) }
                                </AutoColumn>
                            ) }

                            <StablePoolInfo poolInfo={ poolInfo } showHeader={ true } className="p-4" />
                        </div>
                    </div>
                </DoubleGlowShadow>
            </Container>
        </>
    )
}
