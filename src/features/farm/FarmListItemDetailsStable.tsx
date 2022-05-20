import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { ZERO } from '@evmoswap/core-sdk'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ButtonError } from 'app/components/Button'
import CurrencyInput from 'app/components/CurrencyInput'
import Dots from 'app/components/Dots'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import ToggleButtonGroup from 'app/components/ToggleButton'

import { calculateGasMargin, classNames, formatCurrencyAmount, tryParseAmount } from 'app/functions'
import { useMasterChefContract } from 'app/hooks'
import { useToken } from 'app/hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import React, { useMemo, useState } from 'react'
import { OnsenModalView } from './enum'
import ReactGA from 'react-ga'
import { useUserInfo } from './hooks'
import InvestmentDetails from './InvestmentDetails'
import NavLink from 'app/components/NavLink'


const COLUMN_CONTAINER = 'flex flex-col flex-grow gap-4'
const INPUT_CHAR_LIMIT = 18

const FarmListItemDetailsStable = ( { farm, onDismiss, handleDismiss } ) => {

    const { account, chainId } = useActiveWeb3React()
    const { i18n } = useLingui()

    //view/tab toggle
    const [ view, setView ] = useState( OnsenModalView.Deposit )
    const action = view === OnsenModalView.Deposit ? "Deposit" : "Withdraw";
    const updateView = ( view ) => { setView( view ); handleInput( '' ); }

    //farm details
    const lpAddress = getAddress( farm.lpToken );
    const liquidityToken = useToken( lpAddress );
    const balance = useTokenBalance( account, liquidityToken )
    const userInfo = useUserInfo( farm, liquidityToken )
    const stakedBalance = userInfo.stakedAmount;
    const selectedBalance = view === OnsenModalView.Deposit ? balance : stakedBalance;


    //input 
    const [ typedValue, setTypedValue ] = useState( '' )
    const [ usingBalance, setUsingBalance ] = useState( false )
    const parsedAmount = useMemo( () => {
        return usingBalance ? balance : tryParseAmount( typedValue, liquidityToken );
    }, [ typedValue, balance, usingBalance, liquidityToken ] );
    const handleInput = ( v: string ) => {

        if ( v.length <= INPUT_CHAR_LIMIT ) {
            setUsingBalance( false )
            setTypedValue( v )
        }
    }


    //om max input
    const onMax = () => {

        if ( !selectedBalance?.equalTo( ZERO ) )
            handleInput( selectedBalance?.toSignificant( selectedBalance?.currency.decimals ) )
    }

    const renderBalance = () => {

        const sBalance = view === OnsenModalView.Deposit ? balance : stakedBalance;
        const prefixText = view === OnsenModalView.Withdraw ? "Staked" : "Balance"
        return (
            <>
                { i18n._( t`${prefixText}` ) }: { formatCurrencyAmount( sBalance, 4 ) } { sBalance?.currency?.symbol }
            </>
        )
    }


    //error
    const getError = () => {

        let error: string;

        if ( !typedValue || !parsedAmount || !parsedAmount.greaterThan( ZERO ) )
            error = i18n._( t`Enter an amount` )

        else if ( !selectedBalance || selectedBalance?.lessThan( parsedAmount ) )
            error = i18n._( t`Insufficient balance` )

        return error
    }
    let error = getError();



    //transaction
    const masterChefContract = useMasterChefContract()
    const addTransaction = useTransactionAdder()
    const [ attemptingTxn, setAttemptingTxn ] = useState<boolean>( false )
    const pendingText = i18n._(
        t`${action}ing ${parsedAmount?.toSignificant( 6 )} ${liquidityToken?.symbol}`
    )


    //approval
    const [ approval, approveACallback ] = useApproveCallback( parsedAmount, masterChefContract.address )
    const approved = approval === ApprovalState.APPROVED

    async function onDeposit () {

        if ( !approved || !chainId || !account || !masterChefContract || !parsedAmount || !liquidityToken ) return


        const endpoint = view === OnsenModalView.Deposit ? "deposit" : "withdraw"
        const action = view === OnsenModalView.Deposit ? "Deposit" : "Withdraw";

        let estimate,
            method: ( ...args: any ) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null

        estimate = masterChefContract.estimateGas[ endpoint ]
        method = masterChefContract[ endpoint ]
        args = [
            farm.pid,
            parsedAmount.quotient.toString(),
        ]
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
                        summary: i18n._(
                            t`${action} ${parsedAmount?.toSignificant( 3 )} ${liquidityToken?.symbol}`
                        ),
                    } )

                    ReactGA.event( {
                        category: 'Farm',
                        action: action,
                        label: liquidityToken?.symbol,
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

        handleDismiss()
    }


    return (

        <div className={ classNames( '' ) }>
            <div className={ classNames( COLUMN_CONTAINER ) }>
                <HeadlessUiModal.Header
                    header={
                        <div className="flex gap-0.5 items-center">
                            { farm.name }
                        </div>
                    }
                    onClose={ onDismiss }
                />
                <ToggleButtonGroup size="sm" value={ view } onChange={ ( view: OnsenModalView ) => updateView( view ) } variant="filled">
                    <ToggleButtonGroup.Button value={ OnsenModalView.Deposit }>{ i18n._( t`Deposit` ) }</ToggleButtonGroup.Button>
                    <ToggleButtonGroup.Button value={ OnsenModalView.Withdraw }>{ i18n._( t`Withdraw` ) }</ToggleButtonGroup.Button>
                    <ToggleButtonGroup.Button value={ OnsenModalView.Position }>{ i18n._( t`Rewards` ) }</ToggleButtonGroup.Button>
                </ToggleButtonGroup>

                {/*Dont unmount following components to make modal more react faster*/ }
                <div className={ classNames( COLUMN_CONTAINER, [ OnsenModalView.Deposit, OnsenModalView.Withdraw ].includes( view ) ? 'block' : 'hidden' ) }>
                    <CurrencyInput
                        label=''
                        value={ typedValue }
                        onUserInput={ handleInput }
                        onMax={ onMax }
                        renderBalance={ renderBalance }
                        showMaxButton={ typedValue !== selectedBalance?.toSignificant( selectedBalance?.currency?.decimals ) }
                        currency={ liquidityToken }
                        id="add-liquidity-input-token"
                        showCommonBases
                    />

                    <NavLink
                        href={ `/stable-pool/add/${String( liquidityToken?.symbol ).toLowerCase()}` }
                    >
                        <a className="flex items-center justify-end space-x-2 text-base cursor-pointer font text-secondary hover:text-high-emphesis">
                            { i18n._( t`Add Liquidity` ) }
                        </a>
                    </NavLink>
                    <ButtonError
                        onClick={ () => { approved ? onDeposit() : approveACallback() } }
                        color={ error ? 'gray' : 'blue' }
                        disabled={ !!error }
                        error={ error && !!parsedAmount }
                    >
                        { error && error }
                        { !error && <>
                            { !approved &&
                                <>
                                    { approval === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving ${liquidityToken?.symbol}` ) }</Dots> : i18n._( t`Approve` ) }
                                </>
                            }
                            { approved &&
                                <>
                                    { attemptingTxn ? <Dots>{ pendingText }</Dots> : i18n._( t`${action}` ) }
                                </>
                            }
                        </> }
                    </ButtonError>
                </div>
                <div className={ classNames( COLUMN_CONTAINER, view === OnsenModalView.Position ? 'block' : 'hidden' ) }>
                    <InvestmentDetails farm={ farm } handleDismiss={ handleDismiss } />
                </div>
            </div>

            { !liquidityToken && <Dots>{ i18n._( t`Loading` ) }</Dots> }
        </div>
    )
}

export default FarmListItemDetailsStable
