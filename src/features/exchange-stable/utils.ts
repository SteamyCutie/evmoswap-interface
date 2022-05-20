import { Currency, CurrencyAmount, Token } from "@evmoswap/core-sdk";
import { t } from "@lingui/macro";
import Bignumber from 'bignumber.js';

export function currencyAmountsToString ( amounts: CurrencyAmount<Currency | Token>[] ): string[] {
    const tempOne: string[] = [];
    amounts.map( ( amount, index ) => {
        if ( amount ) {
            tempOne[ index ] = amount.quotient?.toString();
        }
    } );
    return tempOne;
}

export function sumCurrencyAmounts ( amounts: CurrencyAmount<Currency | Token>[] ): string {
    let total = new Bignumber( 0 );
    amounts.map( ( amount ) => {
        if ( amount ) {
            total = total.plus( amount.toExact() );
        }
    } );
    return total.toString();
}


/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
export function contractErrorToUserReadableMessage ( error: any ): string {
    let reason: string | undefined

    if ( reason?.indexOf( 'execution reverted: ' ) === 0 ) reason = reason.substr( 'execution reverted: '.length )
    switch ( reason ) {
        case 'TF':
            return t`The output token cannot be transferred. There may be an issue with the output token.`
        default:
            if ( error.data ) {
                if ( error.data.message && error?.data?.message?.indexOf( "execution reverted:" ) >= 0 ) {

                    let eS = error.data.message?.split( "execution reverted:" ) || []
                    return t`${eS.reverse()[ 0 ]}`
                }
            }
            return t`Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`
    }
}