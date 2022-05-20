import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Currency, CurrencyAmount, Pair, Percent, Price, Route, Token, Trade, TradeType } from '@evmoswap/core-sdk'
import { useWeb3React } from '@web3-react/core'
import EVMOSWAP_ABI from 'app/constants/abis/evmo-swap.json'
import EVMOMETASWAP_ABI from 'app/constants/abis/evmo-meta-swap.json'
import EVMOMETASWAP_DEPOSIT_ABI from 'app/constants/abis/evmo-meta-swap-deposit.json'
import { EVMOMETASWAP_ADDRESS, EVMOMETASWAP_DEPOSIT_ADDRESS, EVMOSWAP_ADDRESS } from 'app/constants/addresses'
import { StablePool, StablePoolInfo, StableTokenInfo, STABLE_POOLS } from 'app/constants/pools'
import { calculateGasMargin, formatBalance, isAddress, shortenAddress, tryParseAmount } from 'app/functions'
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

const FEE_DECIMALS = 10

export function useStableSwapDepositContract ( poolId: string | number, withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useWeb3React()
    const isMeta = STABLE_POOLS?.[ chainId ]?.[ poolId ]?.isMeta
    const address = isMeta ? EVMOMETASWAP_DEPOSIT_ADDRESS[ chainId ] : EVMOSWAP_ADDRESS[ chainId ]
    const abi = isMeta ? EVMOMETASWAP_DEPOSIT_ABI : EVMOSWAP_ABI
    return useContract( address, abi, withSignerIfPossible )
}

export function useStablePoolContract ( poolId: string ): Contract | null {
    const { chainId } = useWeb3React()
    const isMeta = STABLE_POOLS?.[ chainId ]?.[ poolId ]?.isMeta
    return useStableSwapContract( isMeta, true )
}

export function useStableSwapContract ( isMeta?: boolean, withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useWeb3React()
    const address = isMeta ? EVMOMETASWAP_ADDRESS[ chainId ] : EVMOSWAP_ADDRESS[ chainId ]
    const abi = isMeta ? EVMOMETASWAP_ABI : EVMOSWAP_ABI
    return useContract( address, abi, withSignerIfPossible )
}

export function useStablePoolFromRouter ( routeParams: string | string[] ): {
    poolId: string
    pool: StablePool
    poolContract: Contract
    poolAddress: string
} {
    const { chainId } = useWeb3React()
    const poolSlug = Array.isArray( routeParams ) ? routeParams[ 0 ] : routeParams
    const pools = STABLE_POOLS[ chainId ]
    const [ pool, poolId ] = useMemo( () => {

        if ( !pools ) return [];

        const poolIdes = Object.keys( pools )
        let id = poolIdes[ 0 ]
        let resp = pools[ id ]
        for ( let index = 0; index < poolIdes.length; index++ ) {
            if ( String( pools?.[ poolIdes[ index ] ]?.slug ).toLowerCase() === String( poolSlug ).toLowerCase() ) {
                id = poolIdes[ index ]
                resp = pools[ id ]
                break
            }
        }
        return [ resp, id ]
    }, [ poolSlug, pools ] )
    const poolContract = useStableSwapDepositContract( poolId )
    const poolAddress = poolContract?.address

    return {
        poolId,
        pool,
        poolContract,
        poolAddress,
    }
}

// fetch pool info
export function useStablePoolInfo ( poolId: string ): StablePoolInfo {
    const { chainId } = useWeb3React()
    const pool = STABLE_POOLS[ chainId ]?.[ poolId ]

    const contract = useStablePoolContract( poolId )
    const resp = {
        ...pool,
        ...{
            swapFee: 0,
            adminFee: 0,
            virtualPrice: 0,
            a: 0,
            isLoading: true,
            pooledTokensInfo: undefined,
            lpToken: undefined
        },
    }

    let lpAddress: string;

    const callsData = useMemo(
        () => [
            { methodName: 'swapStorage', callInputs: [] },
            { methodName: 'getVirtualPrice', callInputs: [] },
            { methodName: 'getA', callInputs: [] },
        ],
        []
    )

    const results = useSingleContractMultipleMethods( contract, callsData )

    const swapStorage = results?.[ 0 ]?.result;
    const virtualPrice = results?.[ 1 ]?.result?.[ 0 ];
    const a = results?.[ 2 ]?.result?.[ 0 ];

    const lpToken = useToken( swapStorage?.lpToken )

    if ( swapStorage && virtualPrice && a ) {
        resp.a = a;
        resp.swapFee = Number( formatBalance( swapStorage?.swapFee || '0', FEE_DECIMALS ) ) * 100
        resp.virtualPrice = Number( formatBalance( virtualPrice || '0', lpToken?.decimals || 0 ) )
        resp.adminFee = Number( formatBalance( swapStorage?.adminFee || '0', FEE_DECIMALS ) ) * 100
    }

    if ( results )
        resp.isLoading = false;

    resp.lpToken = lpToken;

    resp.pooledTokensInfo = useStablePooledTokensInfo( poolId )

    return resp
}

// fetch pool pooled tokens info
export function useStablePooledTokensInfo (
    poolId: string,
    selectTokensId?: string[]
): {
    balances: undefined | CurrencyAmount<Token>[] //array of token balances
    total: number
    tokens: undefined | Token[]
} {
    const { chainId } = useWeb3React()
    const pool = STABLE_POOLS?.[ chainId ]?.[ poolId ]

    const swapContract = useStablePoolContract( poolId )
    const swapDepositContract = useStableSwapDepositContract( poolId )

    const resp = {
        balances: undefined, //array of token balances
        tokens: undefined,
        total: 0,
    }

    const tokens = pool?.pooledTokens

    const selectTokensIdSorted = selectTokensId ? selectTokensId.join( ',' ).toLowerCase().split( ',' ) : []
    //make call data base on token index.
    const callsData = useMemo( () => {
        const ret = []
        if ( !tokens ) return [ [ undefined ] ]
        tokens.map( ( token, i ) => {
            let index
            if ( selectTokensId ) {
                if ( selectTokensIdSorted.includes( token.address.toLowerCase() ) ) index = i
            } else {
                index = i
            }
            if ( index !== undefined ) ret[ i ] = [ index ]
        } )
        return ret
    }, [ tokens, selectTokensIdSorted ] )

    const addressesResult = useSingleContractMultipleData( swapDepositContract, 'getToken', callsData )
    const balancesResult = useSingleContractMultipleData( swapContract, 'getTokenBalance', callsData )

    const [ currencies, balances, total ] = useMemo( () => {
        const tempCurrencies: Token[] = []
        const tempBalances: CurrencyAmount<Token>[] = []
        let total = 0

        if ( tokens )
            tokens.map( ( token, index ) => {
                const address = addressesResult?.[ index ]?.result?.[ 0 ]
                if ( token && address ) {
                    const currency = new Token( chainId, address ?? token.address, token.decimals, token.symbol )

                    tempCurrencies[ index ] = currency
                    const balance = balancesResult?.[ index ]?.result?.[ 0 ]
                    if ( balance ) {
                        const amount = CurrencyAmount.fromRawAmount( currency, balance )
                        tempBalances[ index ] = amount
                        total += Number( amount.toFixed( token.decimals ) )
                    }
                }
            } )

        return [ tempCurrencies, tempBalances, total ]
    }, [ addressesResult, balancesResult ] )

    if ( balances.length ) resp.balances = balances

    if ( currencies.length ) resp.tokens = currencies

    resp.total = total

    return resp
}

// Estimate lp amount to receive
export function useStableTokenToMint (
    poolId: string,
    amounts: string[] | CurrencyAmount<Currency>[],
    deposit: boolean = true
) {
    const { account } = useActiveWeb3React()
    const contract = useStableSwapDepositContract( poolId )
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
export function useStableTokenToReceive ( poolId: string | number, lptAmount: CurrencyAmount<Currency>, tokenIndex?: number ) {
    const { account } = useActiveWeb3React()
    const contract = useStableSwapDepositContract( poolId )

    let callMethod = 'calculateRemoveLiquidity'
    let callData: any[] = [ account, lptAmount?.quotient?.toString() ]

    if ( tokenIndex >= 0 ) {
        callData.push( tokenIndex )
        callMethod = 'calculateRemoveLiquidityOneToken'
    }

    const amountToRecieve = useSingleCallResult( contract, callMethod, callData )
    return amountToRecieve?.result?.[ 0 ]
}

export function useStablePool ( poolId ) {
    const { account } = useActiveWeb3React()
    const contract = useContract( poolId, EVMOSWAP_ABI )
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
    const [ tokenFrom, tokenTo, tokenIndexFrom, tokenIndexTo ] = useMemo( () => {
        const chainPools = STABLE_POOLS?.[ chainId ]
        let fromToken, toToken: StableTokenInfo
        let fromIndex, toIndex: Number

        if ( chainPools )
            for ( const poolId of Object.keys( chainPools ) ) {
                const tokens = chainPools[ poolId ].pooledTokens
                for ( let index = 0; index < tokens.length; index++ ) {
                    const token = tokens[ index ]
                    if ( token.address.toLowerCase() === inputCurrencyId.toLowerCase() ) {
                        fromToken = token
                        fromIndex = index
                    }
                    if ( token.address.toLowerCase() === outputCurrencyId.toLowerCase() ) {
                        toToken = token
                        toIndex = index
                    }

                    if ( fromToken !== undefined && toToken !== undefined ) return [ fromToken, toToken, fromIndex, toIndex ]
                }
            }

        return [ fromToken, toToken, fromIndex, toIndex ]
    }, [ chainId, inputCurrencyId, outputCurrencyId ] )

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
    const stableTrade = useStableTrade( parsedInputAmount, parsedOutputAmount, isExactIn )

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
        inputError,
    }
}

//stable pair reserve for swap
export function useStableTokenReserve ( token?: Token ) {
    const { chainId } = useWeb3React()
    const basePool = STABLE_POOLS?.[ chainId ]?.[ '0' ]
    let baseTokens = useMemo( () => {
        if ( !basePool ) return []
        return basePool.pooledTokens.map( ( t, i ) => {
            return t.address.toLowerCase()
        } )
    }, [ basePool ] )

    let isBaseTokens = token ? baseTokens.includes( token.address.toLowerCase() ) : false
    let tokenIndex = token ? ( isBaseTokens ? baseTokens.indexOf( token.address.toLowerCase() ) : 0 ) : undefined //index for meta token will always be zero(i.e UST + 3Pool)

    const swapContract = useStableSwapContract( !isBaseTokens )

    const balanceResult = useSingleCallResult( swapContract, 'getTokenBalance', [ tokenIndex ] )?.result?.[ 0 ]
    return token && balanceResult ? CurrencyAmount.fromRawAmount( token, balanceResult ) : undefined
}

//create stabe trade
export function useStableTrade (
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
    const inputReserve = useStableTokenReserve( inputAmount?.currency )
    const outputReserve = useStableTokenReserve( outputAmount?.currency )
    const canMakePair = inputReserve && outputReserve && !inputReserve.equalTo( outputReserve )
    //create pair and route
    const pair = canMakePair ? new Pair( inputReserve, outputReserve ) : undefined

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
