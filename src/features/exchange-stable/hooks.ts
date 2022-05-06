import { BigNumberish } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Currency, CurrencyAmount, Token } from "@evmoswap/core-sdk";
import { useWeb3React } from "@web3-react/core";
import EVMOSWAP_ABI from "app/constants/abis/evmo-swap.json"
import { StableTokenInfo } from "app/constants/pools";
import { useContract } from "app/hooks"
import { useActiveWeb3React } from "app/services/web3";
import { useSingleCallResult, useSingleContractMultipleData, useSingleContractMultipleMethods } from "app/state/multicall/hooks"
import { useCallback, useMemo } from "react"


export function useStablePoolContract ( address: string ): Contract | null {
    return useContract( address, EVMOSWAP_ABI, true )
}

// fetch pool info
export function useStablePoolInfo ( poolAddress: string ): { swapFee: number; adminFee: number; virtualPrice: number; a: number; isLoading: boolean; lpToken: any; } {

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
            { methodName: 'getA', callInputs: [] }
        ],
        []
    )

    const results = useSingleContractMultipleMethods( contract, callsData )

    if ( results && Array.isArray( results ) && results.length === callsData.length ) {

        const [ { result: swapStorage }, { result: virtualPrice }, { result: a } ] = results
        resp.a = a?.[ 0 ];
        resp.swapFee = swapStorage?.swapFee
        resp.virtualPrice = virtualPrice?.[ 0 ]
        resp.adminFee = swapStorage?.adminFee
        resp.lpToken = swapStorage?.lpToken;
        resp.isLoading = false;
    } else {
        resp.isLoading = false;
    }

    return resp;
}

// fetch pool info
export function useStableTokensInfo ( poolAddress: string, tokens?: StableTokenInfo[], virtualPrice: number = 1 ): {
    balances: undefined | CurrencyAmount<Token>[]; //array of token balances
    total: number;
    tvl: number;
    addresses: undefined | string[];
} {
    const { chainId } = useWeb3React()
    const contract = useStablePoolContract( poolAddress )
    const resp = {
        balances: undefined,//array of token balances
        total: 0,
        addresses: undefined, //array of token address
        tvl: 0,
    }

    const callsData = useMemo( () => {
        if ( !tokens ) return [ undefined ];
        return tokens.map( ( token ) => {
            return [ token.index ]
        } )
    }, [ tokens ] )

    const balancesResult = useSingleContractMultipleData( contract, "getTokenBalance", callsData )
    const addressesResult = useSingleContractMultipleData( contract, "getToken", callsData )

    if ( balancesResult && Array.isArray( balancesResult ) && balancesResult.length === callsData.length ) {
        let balances: CurrencyAmount<Token>[] = [];
        let total = 0;

        balancesResult.map( ( row, index ) => {
            const balance = row?.result?.[ 0 ];
            if ( balance ) {
                const token = tokens[ index ]
                const currency = new Token( chainId, token.address, token.decimals, token.symbol );
                const amount = CurrencyAmount.fromRawAmount( currency, balance );
                balances[ tokens[ index ].index ] = amount;
                total += Number( amount.toFixed( token.decimals ) )
            }
        } )

        resp.balances = balances;
        resp.total = total;
        resp.tvl = total * virtualPrice;
    }

    if ( addressesResult && Array.isArray( addressesResult ) && addressesResult.length === callsData.length ) {
        const addresses = [];
        addressesResult.map( ( row, index ) => {
            addresses[ tokens[ index ].index ] = row?.result?.[ 0 ];
        } )
        resp.addresses = addresses;
    }
    return resp;
}


// Estimate lp amount to receive
export function useStableTokenToMint ( poolAddress: string, amounts: string[] | CurrencyAmount<Currency>[], deposit: boolean = true ) {

    const { account } = useActiveWeb3React()
    const contract = useStablePoolContract( poolAddress )
    const amountsBN = amounts && amounts[ 0 ] instanceof String ? amounts : useMemo( () => {
        return amounts.map( ( amount ) => {
            return amount?.quotient?.toString();
        } )
    }, [ amounts ] )

    const amountToRecieve = useSingleCallResult( contract, "calculateTokenAmount", account ? [ account, amountsBN, String( deposit ) ] : undefined )
    return amountToRecieve?.result?.[ 0 ];
}

//Estimate withdrawal for pooled tokens
export function useStableTokenToReceive ( poolAddress: string, lptAmount: CurrencyAmount<Currency>, tokenIndex?: number ) {

    const { account } = useActiveWeb3React()
    const contract = useStablePoolContract( poolAddress )

    let callMethod = "calculateRemoveLiquidity";
    let callData: any[] = [ account, lptAmount?.quotient?.toString() ]

    if ( tokenIndex >= 0 ) {
        callData.push( tokenIndex );
        callMethod = "calculateRemoveLiquidityOneToken";
    }

    const amountToRecieve = useSingleCallResult( contract, callMethod, callData )
    return amountToRecieve?.result?.[ 0 ];
}

export function useStablePool ( poolAddress ) {

    const { account } = useActiveWeb3React()
    const contract = useContract( poolAddress, EVMOSWAP_ABI )
    const calculateTokenAmount = useCallback( async ( amounts: BigNumberish[], deposit: boolean ) => {
        let resp: any;

        if ( !contract || !account ) return resp;
        resp = await contract?.calculateTokenAmount( account, amounts, deposit )
        return resp;
    }, [ contract, account ] );

    return {
        calculateTokenAmount
    }
}