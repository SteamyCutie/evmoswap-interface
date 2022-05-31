import NavLink from '../../components/NavLink'
import React from 'react'
import { currencyId } from '../../functions/currency'
import { useActiveWeb3React } from '../../services/web3'

export default function LiquidityHeader({ input = undefined, output = undefined }: any): JSX.Element {
  const { chainId } = useActiveWeb3React()

  const navLinkStyle =
    'rounded-lg text-dark-primary text-base hover:text-dark-primary/60 dark:text-light-primary dark:hover:text-light-primary/60 transition-all'

  return (
    <div className="flex p-2 pb-1 pt-2 md:pb-2 md:pt-4 space-x-12 rounded-md transition-all">
      <NavLink activeClassName="font-extrabold" href={`/add/${currencyId(input)}/${currencyId(output)}`}>
        <a className={navLinkStyle}>Add liquidity</a>
      </NavLink>
      <NavLink
        onClick={(event) => {
          if (!output) event.preventDefault()
        }}
        activeClassName="font-extrabold"
        href={`/remove/${currencyId(input)}/${currencyId(output)}`}
      >
        <a className={navLinkStyle}>Remove liquidity</a>
      </NavLink>
    </div>
  )
}
