import NavLink from '../../components/NavLink'
import React from 'react'
import { currencyId } from '../../functions/currency'
import { useActiveWeb3React } from '../../services/web3'

export default function LiquidityHeader ( { input = undefined, output = undefined }: any ): JSX.Element {

    const navLinkStyle =
        'rounded-lg text-dark-text text-base hover:text-dark-text/60 dark:text-light-text dark:hover:text-light-text/60 transition-all font-bold'

    const activeNavLinkStyle = '!text-dark dark:!text-light';

    return (
        <div className="flex p-2 pb-1 pt-2 md:pb-2 md:pt-4 space-x-8 rounded-md transition-all">
            <NavLink activeClassName={ activeNavLinkStyle } href={ `/add/${currencyId( input )}/${currencyId( output )}` }>
                <a className={ navLinkStyle }>Add liquidity</a>
            </NavLink>
            <NavLink
                onClick={ ( event ) => {
                    if ( !output ) event.preventDefault()
                } }
                activeClassName={ activeNavLinkStyle }
                href={ `/remove/${currencyId( input )}/${currencyId( output )}` }
            >
                <a className={ navLinkStyle }>Remove liquidity</a>
            </NavLink>
        </div>
    )
}
