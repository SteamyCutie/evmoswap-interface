import { CurrencyAmount, Token, Currency } from "@evmoswap/core-sdk"
import { CurrencyLogo } from "../CurrencyLogo"

export function TokenAmountCard ( {
    amount,
    currency,
    significant,
    className,
    flexDir = 'col',
    gap = 0
}: {
    amount?: CurrencyAmount<Token | Currency>
    currency?: Token | Currency
    significant?: number,
    className?: string,
    flexDir?: 'row' | 'col'
    gap?: number
} ) {
    const token = currency ?? amount?.currency
    return (
        <div className={ `flex flex-row items-center w-full p-3 pr-8 space-x-3 rounded-md bg-light-secondary dark:bg-dark-secondary ${className}` }>
            <CurrencyLogo currency={ token } size="40px" />
            <div className={ `flex flex-${flexDir} text-lg font-semibold text-dark dark:text-light gap-${gap}` }>
                <div className="truncate">{ ( significant ? amount?.toSignificant( significant ) : amount?.toExact() ) || '-' }</div>
                <div className="">{ token?.symbol }</div>
            </div>
        </div>
    )
}