import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { ChainId, Token } from '@evmoswap/core-sdk'
import Button from 'app/components/Button'
import Typography from 'app/components/Typography'
import Web3Connect from 'app/components/Web3Connect'
import { useFarmListItemDetailsModal } from './FarmListItemDetails'
import { classNames, tryParseAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import React, { useState } from 'react'

import { Chef } from './enum'
import { useUserInfo } from './hooks'
import useMasterChef from './useMasterChef'
import Dots from 'app/components/Dots'
import { MASTERCHEF_ADDRESS } from 'app/constants/addresses'
import { SettingsTabControlled as Settings } from 'app/components/Settings'
import RemovePercentInput from 'app/components/RemovePercentInput'

const APPROVAL_ADDRESSES = {
    [ Chef.MASTERCHEF ]: {
        [ ChainId.ETHEREUM ]: MASTERCHEF_ADDRESS[ ChainId.ETHEREUM ],
        [ ChainId.EVMOS ]: MASTERCHEF_ADDRESS[ ChainId.EVMOS ],
        [ ChainId.EVMOS_TESTNET ]: MASTERCHEF_ADDRESS[ ChainId.EVMOS_TESTNET ],
        [ ChainId.BSC_TESTNET ]: MASTERCHEF_ADDRESS[ ChainId.BSC_TESTNET ],
    },
}

// @ts-ignore TYPE NEEDS FIXING
const ManageBar = ( { farm, handleDismiss } ) => {
    const { account, chainId } = useActiveWeb3React()
    const { setContent } = useFarmListItemDetailsModal()

    const [ toggle, setToggle ] = useState( true )
    const [ toggleSettings, setToggleSettings ] = useState( false )

    const [ depositValue, setDepositValue ] = useState<string>()
    const [ withdrawValue, setWithdrawValue ] = useState<string>()
    const { deposit, withdraw } = useMasterChef( farm.chef )
    const addTransaction = useTransactionAdder()
    const liquidityToken = new Token(
        // @ts-ignore TYPE NEEDS FIXING
        chainId,
        getAddress( farm.lpToken ),
        farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18,
        'ELP'
    )
    const balance = useTokenBalance( account, liquidityToken )
    const { stakedAmount } = useUserInfo( farm, liquidityToken )
    const parsedDepositValue = tryParseAmount( depositValue, liquidityToken )
    const parsedWithdrawValue = tryParseAmount( withdrawValue, liquidityToken )
    // @ts-ignore TYPE NEEDS FIXING
    const [ approvalState, approve ] = useApproveCallback( parsedDepositValue, APPROVAL_ADDRESSES[ farm.chef ][ chainId ] )

    const depositError = !parsedDepositValue
        ? 'Enter an amount'
        : balance?.lessThan( parsedDepositValue )
            ? 'Insufficient balance'
            : undefined
    const isDepositValid = !depositError
    const withdrawError = !parsedWithdrawValue
        ? 'Enter an amount'
        : // @ts-ignore TYPE NEEDS FIXING
        stakedAmount?.lessThan( parsedWithdrawValue )
            ? 'Insufficient balance'
            : undefined
    const isWithdrawValid = !withdrawError
    const [ pendingTx, setPendingTx ] = useState( undefined )

    const navLinkStyle =
        'rounded-lg text-dark-text text-base hover:text-dark-text/60 dark:text-light-text dark:hover:text-light-text/60 transition-all'
    const activeNavLinkStyle = `${navLinkStyle} font-bold !text-dark dark:!text-light`;

    return (
        <>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">

                    <div className="flex py-2 md:pt-4 space-x-8 rounded-md transition-all">
                        <button className={ `${toggle ? activeNavLinkStyle : navLinkStyle}` } onClick={ () => setToggle( true ) }>{ i18n._( t`Stake liquidity` ) }</button>
                        <button className={ `${!toggle ? activeNavLinkStyle : navLinkStyle}` } onClick={ () => setToggle( false ) }>{ i18n._( t`Unstake liquidity` ) }</button>
                    </div>
                    <Settings
                        isOpened={ toggleSettings }
                        toggle={ () => {
                            setToggleSettings( !toggleSettings )
                        } }
                        direction="left"
                        className="!mr-5"
                    />
                </div>
            </div>

            <div className='flex flex-col bg-light dark:bg-dark p-6 rounded-xl gap-6'>

                {/*<Input.Numeric
                    id="staking-input"
                    className="text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary p-5 rounded-md"
                    value={ toggle ? depositValue : withdrawValue }
                    onUserInput={ toggle ? setDepositValue : setWithdrawValue }
                />*/}
                <RemovePercentInput
                    id="staking-input"
                    className="w-full !p-0"
                    value={ toggle ? depositValue : withdrawValue }
                    //onUserInput={ toggle ? setDepositValue : setWithdrawValue }
                    onUserInput={ () => { } }
                    showPercent={ false }
                    inputClassName="text-3xl"
                    label={
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-base text-dark dark:text-light font-medium">Balance: { toggle ? balance?.toSignificant( 4 ) : stakedAmount?.toSignificant( 4 ) }</div>
                            <div className="flex justify-end gap-2">
                                { [ '25', '50', '75', '100' ].map( ( multiplier, i ) => (
                                    <Button
                                        variant="outlined"
                                        size="xs"
                                        color={ toggle ? 'blue' : 'pink' }
                                        key={ i }
                                        onClick={ () => {
                                            toggle
                                                ? balance
                                                    ? // @ts-ignore TYPE NEEDS FIXING
                                                    setDepositValue( balance.multiply( multiplier ).divide( 100 ).toExact() )
                                                    : undefined
                                                : stakedAmount
                                                    ? // @ts-ignore TYPE NEEDS FIXING
                                                    setWithdrawValue( stakedAmount.multiply( multiplier ).divide( 100 ).toExact() )
                                                    : undefined
                                        } }
                                        className={ classNames(
                                            'text-xs !py-0.5 border border-opacity-50 text-dark dark:text-light bg-light-secondary dark:bg-dark-secondary',
                                            toggle ? 'focus:ring-blue border-blue' : 'focus:ring-pink border-pink'
                                        ) }
                                    >
                                        { multiplier === '100' ? 'MAX' : multiplier + '%' }
                                    </Button>
                                ) ) }
                            </div>
                        </div> }
                />

                <Typography variant="sm" className="text-light-text dark:text-dark-text">
                    { i18n._( t`Use one of the buttons to set a percentage or enter a value manually using the input field` ) }
                </Typography>
            </div>

            <div className='my-4'>
                { toggle ? (
                    !account ? (
                        <Web3Connect size="lg" color="blue" />
                    ) : ( isDepositValid && approvalState === ApprovalState.NOT_APPROVED ) ||
                        approvalState === ApprovalState.PENDING ? (
                        <Button
                            className="w-full"
                            color="gradient"
                            size='lg'
                            disabled={ approvalState === ApprovalState.PENDING }
                            onClick={ approve }
                        >
                            { approvalState === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving` ) }</Dots> : i18n._( t`Approve` ) }
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size='lg'
                            color={ !isDepositValid ? ( !!parsedDepositValue ? 'red' : 'gray' ) : 'gradient' }
                            // disabled={pendingTx || !typedDepositValue || balance?.lessThan(typedDepositValue)}
                            disabled={ !isDepositValid }
                            onClick={ async () => {
                                setPendingTx( true )
                                try {
                                    // KMP decimals depend on asset, SLP is always 18
                                    // @ts-ignore TYPE NEEDS FIXING
                                    const tx = await deposit( farm.pid, BigNumber.from( parsedDepositValue?.quotient.toString() ) )
                                    addTransaction( tx, {
                                        summary: `Deposit ${farm.token0.symbol}/${farm.token1.symbol}`,
                                    } )
                                } catch ( error ) {
                                    console.error( error )
                                }
                                setTimeout( () => {
                                    handleDismiss(), setPendingTx( false )
                                }, 4000 )
                            } }
                        >
                            { pendingTx ? <Dots>{ i18n._( t`Depositing` ) }</Dots> : depositError || i18n._( t`Confirm Deposit` ) }
                        </Button>
                    )
                ) : (
                    <Button
                        className="w-full"
                        size='lg'
                        color={ !isWithdrawValid ? ( !!parsedWithdrawValue ? 'red' : 'gray' ) : 'gradient' }
                        disabled={ !isWithdrawValid }
                        onClick={ async () => {
                            setPendingTx( true )
                            try {
                                // KMP decimals depend on asset, SLP is always 18
                                // @ts-ignore TYPE NEEDS FIXING
                                const tx = await withdraw( farm.pid, BigNumber.from( parsedWithdrawValue?.quotient.toString() ) )
                                addTransaction( tx, {
                                    summary: `Withdraw ${farm.token0.symbol}/${farm.token1.symbol}`,
                                } )
                            } catch ( error ) {
                                console.error( error )
                            }
                            setTimeout( () => {
                                handleDismiss(), setPendingTx( false )
                            }, 4000 )
                        } }
                    >
                        { pendingTx ? <Dots>{ i18n._( t`Withdrawing` ) }</Dots> : withdrawError || i18n._( t`Confirm Withdraw` ) }
                    </Button>
                ) }
            </div>
        </>
    )
}

export default ManageBar
