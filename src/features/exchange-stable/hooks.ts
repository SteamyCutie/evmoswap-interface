import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import {
    Currency,
    CurrencyAmount,
    Pair,
    Percent,
    Price,
    Route,
    Token,
    Trade,
    TradeType,
} from '@evmoswap/core-sdk'
import { useWeb3React } from '@web3-react/core'
import EVMOSWAP_ABI from 'app/constants/abis/evmo-swap.json'
import { EVMOSWAP_ADDRESS } from 'app/constants/addresses'
import { StableTokenInfo, STABLE_POOLS } from 'app/constants/pools'
import { calculateGasMargin, isAddress, shortenAddress, tryParseAmount } from 'app/functions'
import { useApproveCallback, useContract } from 'app/hooks'
import { useToken } from 'app/hooks/Tokens'
import useTransactionDeadline from 'app/hooks/useTransactionDeadline'
import { useActiveWeb3React } from 'app/services/web3'
import {
    useSingleCallResult,
    useSingleContractMultipleData,
    useSingleContractMultipleMethods,
} from 'app/state/multicall/hooks'
import { Field } from 'app/state/swap/actions'
import { useSwapState } from 'app/state/swap/hooks'
import { cloneDeepWith } from 'lodash'
import { useCallback, useMemo } from 'react'
import { TRADING_MODE } from './components/TradingMode'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { swapErrorToUserReadableMessage } from 'app/hooks/useSwapCallback'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import useENS from 'app/hooks/useENS'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useCurrencyBalances } from 'app/state/wallet/hooks'

export function useStablePoolContract ( address: string ): Contract | null {
    return useContract( address, EVMOSWAP_ABI, true )
}

export function useStableSwapContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useWeb3React()
    return useContract( EVMOSWAP_ADDRESS[ chainId ], EVMOSWAP_ABI, withSignerIfPossible )
}

// fetch pool info
export function useStablePoolInfo ( poolAddress: string ): {
    swapFee: number
    adminFee: number
    virtualPrice: number
    a: number
    isLoading: boolean
    lpToken: any
} {
    const contract = useStablePoolContract( poolAddress )
    const resp = {
        swapFee: 0,
        adminFee: 0,
        virtualPrice: 0,
        a: 0,
        isLoading: true,
        lpToken: undefined,
    }

    const callsData = useMemo(
        () => [
            { methodName: 'swapStorage', callInputs: [] },
            { methodName: 'getVirtualPrice', callInputs: [] },
            { methodName: 'getA', callInputs: [] },
        ],
        []
    )

    const results = useSingleContractMultipleMethods( contract, callsData )

    if ( results && Array.isArray( results ) && results.length === callsData.length ) {
        const [ { result: swapStorage }, { result: virtualPrice }, { result: a } ] = results
        resp.a = a?.[ 0 ]
        resp.swapFee = swapStorage?.swapFee
        resp.virtualPrice = virtualPrice?.[ 0 ]
        resp.adminFee = swapStorage?.adminFee
        resp.lpToken = swapStorage?.lpToken
        resp.isLoading = false
    } else {
        resp.isLoading = false
    }

    return resp
}

// fetch pool info
export function useStableTokensInfo (
    poolAddress: string,
    tokens?: StableTokenInfo[],
    virtualPrice: number = 1
): {
    balances: undefined | CurrencyAmount<Token>[] //array of token balances
    total: number
    tvl: number
    addresses: undefined | string[]
} {
    const { chainId } = useWeb3React()
    const contract = useStablePoolContract( poolAddress )
    const resp = {
        balances: undefined, //array of token balances
        total: 0,
        addresses: undefined, //array of token address
        tvl: 0,
    }

    const callsData = useMemo( () => {
        if ( !tokens ) return [ undefined ]
        return tokens.map( ( token ) => {
            return [ token?.index ]
        } )
    }, [ tokens ] )

    const balancesResult = useSingleContractMultipleData( contract, 'getTokenBalance', callsData )
    const addressesResult = useSingleContractMultipleData( contract, 'getToken', callsData )

    if ( balancesResult && Array.isArray( balancesResult ) && balancesResult.length === callsData.length ) {
        let balances: CurrencyAmount<Token>[] = []
        let total = 0

        balancesResult.map( ( row, index ) => {
            const balance = row?.result?.[ 0 ]
            if ( balance ) {
                const token = tokens[ index ]
                const currency = new Token( chainId, token.address, token.decimals, token.symbol )
                const amount = CurrencyAmount.fromRawAmount( currency, balance )
                balances[ tokens[ index ].index ] = amount
                total += Number( amount.toFixed( token.decimals ) )
            }
        } )

        resp.balances = balances
        resp.total = total
        resp.tvl = total * virtualPrice
    }

    if ( addressesResult && Array.isArray( addressesResult ) && addressesResult.length === callsData.length ) {
        const addresses = []
        addressesResult.map( ( row, index ) => {
            addresses[ tokens[ index ].index ] = row?.result?.[ 0 ]
        } )
        resp.addresses = addresses
    }
    return resp
}

// Estimate lp amount to receive
export function useStableTokenToMint (
    poolAddress: string,
    amounts: string[] | CurrencyAmount<Currency>[],
    deposit: boolean = true
) {
    const { account } = useActiveWeb3React()
    const contract = useStablePoolContract( poolAddress )
    const amountsBN =
        amounts && amounts[ 0 ] instanceof String
            ? amounts
            : useMemo( () => {
                return amounts.map( ( amount ) => {
                    return amount?.quotient?.toString()
                } )
            }, [ amounts ] )

    const amountToRecieve = useSingleCallResult( contract, 'calculateTokenAmount', [ account, amountsBN, String( deposit ) ] )
    return amountToRecieve?.result?.[ 0 ]
}

//Estimate withdrawal for pooled tokens
export function useStableTokenToReceive ( poolAddress: string, lptAmount: CurrencyAmount<Currency>, tokenIndex?: number ) {
    const { account } = useActiveWeb3React()
    const contract = useStablePoolContract( poolAddress )

    let callMethod = 'calculateRemoveLiquidity'
    let callData: any[] = [ account, lptAmount?.quotient?.toString() ]

    if ( tokenIndex >= 0 ) {
        callData.push( tokenIndex )
        callMethod = 'calculateRemoveLiquidityOneToken'
    }

    const amountToRecieve = useSingleCallResult( contract, callMethod, callData )
    return amountToRecieve?.result?.[ 0 ]
}

export function useStablePool ( poolAddress ) {
    const { account } = useActiveWeb3React()
    const contract = useContract( poolAddress, EVMOSWAP_ABI )
    const calculateTokenAmount = useCallback(
        async ( amounts: BigNumberish[], deposit: boolean ) => {
            let resp: any

            if ( !contract || !account ) return resp
            resp = await contract?.calculateTokenAmount( account, amounts, deposit )
            return resp
        },
        [ contract, account ]
    )

    return {
        calculateTokenAmount,
    }
}

//swap call back helper
export function useStableSwapCallback (
    trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
    allowedSlippage: Percent, // in bips
    recipientAddressOrName?: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
) {

    const { account, chainId } = useActiveWeb3React()
    const contract = useStableSwapContract()

    //basic swap details
    const {
        independentField,
        typedValue,
        [ Field.INPUT ]: { currencyId: inputCurrencyId },
        [ Field.OUTPUT ]: { currencyId: outputCurrencyId },
    } = useSwapState()
    const isExactIn: boolean = independentField === Field.INPUT

    //get swap token and determine is stable swap
    const [ tokenFrom, tokenTo ] = useMemo( () => {
        const chainPools = STABLE_POOLS?.[ chainId ]
        let fromToken, toToken: StableTokenInfo

        if ( chainPools )
            for ( const poolId of Object.keys( chainPools ) ) {
                const tokens = chainPools[ poolId ].pooledTokens
                for ( let index = 0; index < tokens.length; index++ ) {
                    const token = tokens[ index ]
                    if ( token.address.toLowerCase() === inputCurrencyId.toLowerCase() ) fromToken = token
                    if ( token.address.toLowerCase() === outputCurrencyId.toLowerCase() ) toToken = token

                    if ( fromToken !== undefined && toToken !== undefined ) return [ fromToken, toToken ]
                }
            }

        return [ fromToken, toToken ]
    }, [ chainId, inputCurrencyId, outputCurrencyId ] )

    //get token indexes
    const [ tokenIndexFrom, tokenIndexTo ]: number[] = [ tokenFrom?.index, tokenTo?.index ]

    //determine trade type
    const tradingMode: TRADING_MODE =
        tokenIndexFrom >= 0 && tokenIndexTo >= 0 ? TRADING_MODE.STABLE : TRADING_MODE.STANDARD

    //input amount parsed
    const inputToken = useToken( inputCurrencyId )
    const outputToken = useToken( outputCurrencyId )
    const parsedInputAmount = tryParseAmount( typedValue, ( isExactIn ? inputToken : outputToken ) ?? undefined )

    //get relevant token balances
    const relevantTokenBalances = useCurrencyBalances( account ?? undefined, [
        inputToken ?? undefined,
        outputToken ?? undefined,
    ] )
    const currencyBalances = {
        [ Field.INPUT ]: relevantTokenBalances[ 0 ],
        [ Field.OUTPUT ]: relevantTokenBalances[ 1 ],
    }


    //txn
    const deadline = useTransactionDeadline() // custom from users settings
    const addTransaction = useTransactionAdder()
    const { address: recipientAddress } = useENS( recipientAddressOrName )
    const recipient = !recipientAddressOrName ? account : recipientAddress

    //approvals
    const [ approval, approvalCallback ] = useApproveCallback( parsedInputAmount, EVMOSWAP_ADDRESS[ chainId ] )


    //calculate swap
    const swapOutputAmount = useSingleCallResult( contract, 'calculateSwap', [
        tokenIndexFrom,
        tokenIndexTo,
        parsedInputAmount?.quotient?.toString(),
    ] )?.result?.[ 0 ]

    const parsedOutputAmount = swapOutputAmount ? CurrencyAmount.fromRawAmount( outputToken, swapOutputAmount ) : undefined

    //console.log( parsedInputAmount?.toExact(), parsedOutputAmount?.toExact() )

    //create stable Trade
    const stableTrade = useStableTrade( tokenFrom, tokenTo, parsedInputAmount, parsedOutputAmount, isExactIn )


    //swap callback method for carrying out swapping
    const swapCallback = useCallback( async () => {

        let endpoint = 'swap'
        const dx = stableTrade.inputAmount.quotient.toString()
        const minDy = stableTrade.minimumAmountOut( allowedSlippage ).quotient.toString()

        let estimate,
            method: ( ...args: any ) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null

        estimate = contract.estimateGas[ endpoint ]
        method = contract[ endpoint ]

        args = [ tokenIndexFrom, tokenIndexTo, dx, minDy, deadline.mul( 1000 ).toHexString() ]

        value = null
        //console.log( args, value )

        return estimate( ...args, value ? { value } : {} )
            .then( ( estimatedGasLimit ) =>
                method( ...args, {
                    ...( value ? { value } : {} ),
                    gasLimit: calculateGasMargin( estimatedGasLimit ),
                } ).then( ( response ) => {
                    const inputSymbol = stableTrade.inputAmount.currency.symbol
                    const outputSymbol = stableTrade.outputAmount.currency.symbol
                    const inputAmount = stableTrade.inputAmount.toSignificant( 4 )
                    const outputAmount = stableTrade.outputAmount.toSignificant( 4 )

                    const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
                    const withRecipient =
                        recipient === account
                            ? base
                            : `${base} to ${recipient && isAddress( recipient ) ? shortenAddress( recipient ) : recipient}`

                    addTransaction( response, {
                        summary: withRecipient,
                    } )

                    return response.hash
                } )
            )
            .catch( ( error ) => {
                // if the user rejected the tx, pass this along
                if ( error?.code === 4001 ) {
                    throw new Error( 'Transaction rejected.' )
                } else {
                    // otherwise, the error was unexpected and we need to convey that
                    console.error( `Swap failed`, error )

                    throw new Error( `Swap failed: ${swapErrorToUserReadableMessage( error )}` )
                }
            } )
    }, [ stableTrade, tokenIndexFrom, tokenIndexTo, deadline, contract, recipient ] )


    //comput erros
    let inputError: string | undefined
    // compare input balance to max input based on version
    const [ balanceIn, amountIn ] = [ currencyBalances[ Field.INPUT ], stableTrade?.maximumAmountIn( allowedSlippage ) ]
    if ( balanceIn && amountIn && balanceIn.lessThan( amountIn ) ) {
        inputError = i18n._( t`Insufficient ${amountIn.currency.symbol} balance` )
    }

    return {
        tradingMode,
        approval,
        approvalCallback,
        stableTrade,
        swapCallback,
        parsedOutputAmount,
        inputError
    }
}


//create stabe trade
export function useStableTrade (
    inputToken: StableTokenInfo,
    outputToken: StableTokenInfo,
    inputAmount?: CurrencyAmount<Token>,
    outputAmount?: CurrencyAmount<Token>,
    isExactIn?: Boolean
) {

    const { chainId } = useWeb3React()

    const executionPrice =
        inputAmount && outputAmount
            ? new Price(
                inputAmount.currency,
                outputAmount.currency,
                inputAmount.quotient.toString(),
                outputAmount.quotient.toString()
            )
            : undefined

    //get token pool balance
    const poolInfo = useStableTokensInfo( EVMOSWAP_ADDRESS[ chainId ], [ inputToken, outputToken ] )
    const reserves = poolInfo?.balances
    const [ inputReserve, outputReserve ] = reserves
        ? [ reserves?.[ inputToken.index ], reserves?.[ outputToken.index ] ]
        : [ undefined ]

    //create pair and route
    const pair = inputReserve && outputReserve ? new Pair( inputReserve, outputReserve ) : undefined
    const route =
        pair && inputAmount && outputAmount ? new Route( [ pair ], inputAmount.currency, outputAmount.currency ) : undefined

    //create a trade
    const tradeVstable =
        route && inputAmount
            ? new Trade( route, inputAmount, isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT )
            : undefined


    //since we are using stable trade, needs to override the uniswap executionPrice base on stable swap output.
    //Trade executionPrice and other methods are readonly. Attempt to clone and override.
    //@TODO: make more standard class for stable trade.
    let stableTrade = tradeVstable
        ? cloneDeepWith( tradeVstable, ( value ) => {
            return value
        } )
        : undefined

    //override neccessary property
    if ( stableTrade ) {

        stableTrade = { ...stableTrade, ...tradeVstable }
        if ( outputAmount ) stableTrade.outputAmount = outputAmount
        if ( executionPrice ) stableTrade.executionPrice = executionPrice
        stableTrade.minimumAmountOut = tradeVstable.minimumAmountOut
        stableTrade.maximumAmountIn = tradeVstable.maximumAmountIn
        stableTrade.mode = TRADING_MODE.STABLE
    }

    return stableTrade
}
