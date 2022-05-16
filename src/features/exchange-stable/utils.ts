import { Currency, CurrencyAmount, Token } from "@evmoswap/core-sdk";
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