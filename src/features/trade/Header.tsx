import { ChainId, Currency, Percent } from '@evmoswap/core-sdk'
import React, { FC, useState } from 'react'

import Gas from '../../components/Gas'
import NavLink from '../../components/NavLink'
import Settings from '../../components/Settings'
import { currencyId } from '../../functions'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'

const getQuery = ( input, output ) => {
    if ( !input && !output ) return

    if ( input && !output ) {
        return { inputCurrency: input.address || 'EVMOS' }
    } else if ( input && output ) {
        return { inputCurrency: input.address, outputCurrency: output.address }
    }
}

interface ExchangeHeaderProps {
    input?: Currency
    output?: Currency
    allowedSlippage?: Percent
    showNavs?: boolean
}

const ExchangeHeader: FC<ExchangeHeaderProps> = ( { input, output, allowedSlippage, showNavs = true } ) => {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const router = useRouter()
    const [ animateWallet, setAnimateWallet ] = useState( false )
    const isRemove = router.asPath.startsWith( '/remove' )
    const isLimitOrder = router.asPath.startsWith( '/limit-order' )

    const navLinkStyle =
        'font-semibold rounded-md bg-blue !px-5 text-light-primary hover:text-light-primary/80 dark:text-light-primary dark:hover:text-light-primary/80 transition-all'
    const navTextStyle =
        'flex items-center justify-center px-6 text-base font-medium text-center rounded-md transition-all'

    return (
        <div className="flex items-center justify-between space-x-3 mb-4">
            { showNavs && (
                <div className="flex flex-nowrap p-1 transition-all rounded-xl bg-light-primary dark:bg-dark-primary text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80 h-10">
                    <NavLink
                        activeClassName={ navLinkStyle }
                        href={ {
                            pathname: '/swap',
                            query: getQuery( input, output ),
                        } }
                    >
                        <a className={ navTextStyle }>{ i18n._( t`Swap` ) }</a>
                    </NavLink>

                    <NavLink
                        activeClassName={ navLinkStyle }
                        href={ `/${!isRemove ? 'add' : 'remove'}${input ? `/${currencyId( input )}` : ''}${output ? `/${currencyId( output )}` : ''
                            }` }
                    >
                        <a className={ navTextStyle }>{ i18n._( t`Liquidity` ) }</a>
                    </NavLink>

                    {/* <NavLink
          activeClassName={navLinkStyle}
          href={{
            pathname: '/zap',
          }}
        >
          <a className={navTextStyle}>
            {i18n._(t`Zap`)}
          </a>
        </NavLink> */}
                </div>
            ) }
            <div className="flex items-center">
                <div className="grid grid-flow-col gap-1">
                    {/* {isLimitOrder && (
            <div className="items-center h-full w-full cursor-pointer hover:bg-light-secondary dark:bg-dark-secondary rounded px-3 py-1.5">
              <MyOrders />
            </div>
          )} */}
                    {/* {chainId === ChainId.EVMOS &&
            <div className="items-center w-full h-full px-3 space-x-3 rounded cursor-pointer text-green text-opacity-80 hover:text-opacity-100 md:flex hover:bg-light-secondary dark:bg-dark-secondary">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.5215 0.618164L12.6818 1.57302L15.933 4.37393V13.2435C15.9114 13.6891 15.5239 14.0498 15.0502 14.0286C14.6196 14.0074 14.2751 13.6679 14.2536 13.2435V7.28093C14.2536 6.21998 13.3923 5.37122 12.3158 5.37122H11.8421V2.67641C11.8421 1.61546 10.9808 0.766697 9.90428 0.766697H1.93779C0.861242 0.766697 0 1.61546 0 2.67641V18.4421C0 18.9089 0.387559 19.2909 0.861242 19.2909H10.9808C11.4545 19.2909 11.8421 18.9089 11.8421 18.4421V6.64436H12.3158C12.6818 6.64436 12.9617 6.92021 12.9617 7.28093V13.2435C13.0048 14.4105 13.9737 15.3017 15.1579 15.2805C16.2775 15.2381 17.1818 14.3469 17.2248 13.2435V3.80102L13.5215 0.618164ZM9.66744 8.89358H2.17464V3.10079H9.66744V8.89358Z"
                  fill="#7CFF6B"
                />
              </svg>

              <div className="hidden md:block text-baseline">
                <Gas />
              </div>
            </div>
          } */}
                    {/* <a
            href={'https://app.multichain.org/#/router'}
            target="_blank"
            rel="noreferrer"
            className="relative flex items-center w-full h-full px-4 rounded text-blue bg-light-secondary dark:bg-dark-secondary hover:bg-dark-700"
          >
            Bridge
          </a> */}
                    <div className="relative flex items-center w-full h-full rounded">
                        <Settings placeholderSlippage={ allowedSlippage } />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExchangeHeader
