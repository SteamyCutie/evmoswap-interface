import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { ZERO } from '@evmoswap/core-sdk'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ButtonError } from 'app/components/Button'
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
import { RowBetween } from 'app/components/Row'
import Button from 'app/components/Button'
import Input from 'app/components/Input'
import Typography from 'app/components/Typography'


const COLUMN_CONTAINER = 'flex flex-col flex-grow gap-4'

const FarmListItemDetailsStable = ( { farm, onDismiss, handleDismiss } ) => {

    const { account, chainId } = useActiveWeb3React()
    const { i18n } = useLingui()

    //view/tab toggle
    const [ view, setView ] = useState( OnsenModalView.Deposit )
    const action = view === OnsenModalView.Deposit ? "Deposit" : "Withdraw";
    const isWidthdraw = view === OnsenModalView.Withdraw;

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
    const parsedAmount = useMemo( () => {
        return tryParseAmount( typedValue, liquidityToken );
    }, [ typedValue, balance, liquidityToken ] );
    const handleInput = ( v: string ) => { setTypedValue( v ) }


    //om max input
    const onMax = ( value?: string ) => {

        let amount = value;
        if ( !amount && selectedBalance.greaterThan( ZERO ) )
            amount = selectedBalance?.toSignificant( selectedBalance?.currency.decimals );

        if ( amount )
            handleInput( amount )
    }

    const renderBalance = () => {

        const prefixText = isWidthdraw ? "Staked" : "Balance"
        return (
            <>
                { i18n._( t`${prefixText}` ) }: { formatCurrencyAmount( selectedBalance, 4 ) }
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


        const endpoint = !isWidthdraw ? "deposit" : "withdraw"
        const action = !isWidthdraw ? "Deposit" : "Withdraw";

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
                <div className={ classNames( COLUMN_CONTAINER, [ OnsenModalView.Deposit, OnsenModalView.Withdraw ].includes( view ) ? 'block px-2' : 'hidden' ) }>

                    <Typography variant="sm" className="text-secondary my-4">
                        { i18n._( t`Use one of the buttons to set a percentage or enter a value manually using the input field` ) }
                    </Typography>

                    <RowBetween>
                        <div className="text-base text-white">{ renderBalance() }</div>
                        <div className="flex justify-end gap-2">
                            { [ '25', '50', '75', '100' ].map( ( multiplier, i ) => (
                                <Button
                                    variant="outlined"
                                    size="xs"
                                    color={ !isWidthdraw ? 'blue' : 'pink' }
                                    key={ i }
                                    disabled={ !selectedBalance || !selectedBalance?.greaterThan( ZERO ) }
                                    onClick={ () => { selectedBalance ? onMax( selectedBalance.multiply( multiplier ).divide( 100 ).toExact() ) : undefined } }
                                    className={ classNames(
                                        'text-md border border-opacity-50',
                                        !isWidthdraw ? 'focus:ring-blue border-blue' : 'focus:ring-pink border-pink'
                                    ) }
                                >
                                    { multiplier === '100' ? 'MAX' : multiplier + '%' }
                                </Button>
                            ) ) }
                        </div>
                    </RowBetween>

                    <Input.Numeric
                        className='w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-dark-purple'
                        label=''
                        value={ typedValue }
                        onUserInput={ handleInput }
                        id="add-liquidity-input-token"
                    />

                    <div className="w-full flex items-center justify-end">
                        <NavLink
                            href={ `/stable-pool/add/${String( liquidityToken?.symbol ).toLowerCase()}` }
                        >
                            <a className="space-x-2 text-base cursor-pointer font text-secondary hover:text-high-emphesis">
                                { i18n._( t`Add Liquidity` ) }
                            </a>
                        </NavLink>
                    </div>

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
                                    { approval === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving` ) }</Dots> : i18n._( t`Approve` ) }
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

            <div className='text-center m-2'>
                { !liquidityToken && <Dots>{ i18n._( t`Loading` ) }</Dots> }
            </div>
        </div>
    )
}

export default FarmListItemDetailsStable
