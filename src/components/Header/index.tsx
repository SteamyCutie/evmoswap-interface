import { NATIVE } from '@evmoswap/core-sdk'
import { Feature, featureEnabled } from '../../functions/feature'
import React from 'react'

import { ANALYTICS_URL } from '../../constants'
import ExternalLink from '../ExternalLink'
import Image from 'next/image'
import LanguageSwitch from '../LanguageSwitch'
import Link from 'next/link'
import More from './More'
import NavLink from '../NavLink'
import { Popover } from '@headlessui/react'
import QuestionHelper from '../QuestionHelper'
import Web3Network from '../Web3Network'
import Web3Status from '../Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../services/web3'
import { useETHBalances } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
// import TokenStats from '../TokenStats'
import { ExternalLink as LinkIcon } from 'react-feather'
import Typography from '../Typography'
import TokenStats from '../TokenStats'
import { useRouter } from 'next/router'
import { MenuIcon } from '../Icon'
import { MenuAlt1Icon } from '@heroicons/react/outline'
import CloseIcon from '../CloseIcon'
import { Divider } from '../Divider/Divider'

// import { ExternalLink, NavLink } from "./Link";
// import { ReactComponent as Burger } from "../assets/images/burger.svg";

const AppBar = () => {
    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()

    const userEthBalance = useETHBalances( account ? [ account ] : [] )?.[ account ?? '' ]

    const navLinkStyle =
        'p-2 text-base font-normal transition-all md:p-3 whitespace-nowrap !text-dark dark:!text-light hover:!text-dark/60 dark:hover:!text-light/80'

    const activeNavLinkStyle = '!font-semibold';

    const routeTag: any = useRouter().asPath.split( '/' )[ 1 ].split( '?' )[ 0 ]

    return (
        <header className="flex-shrink-0 w-full z-10 max-w-screen-7xl">
            <Popover as="nav" className="z-10 w-full bg-transparent">
                { ( { open, close } ) => (
                    <>

                        <div className="px-4 mx-0.5 sm:px-6 lg:px-12 py-4 bg-light-primary/50 dark:bg-dark-primary/50 lg:backdrop-blur-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="grid dark:hidden">
                                        <Image src="/logo.svg" alt="light logo" width="191px" height="33px" />
                                    </div>
                                    <div className="hidden dark:grid">
                                        <Image src="/logo-dark.svg" alt="dark logo" width="191px" height="33px" />
                                    </div>
                                    <div className="hidden sm:block sm:ml-4">
                                        <div className="flex space-x-2">
                                            {/* <Buy /> */ }
                                            <NavLink href="/swap">
                                                <a
                                                    id={ `swap-nav-link` }
                                                    className={ `${navLinkStyle} ${routeTag === 'swap' || routeTag === 'add' || routeTag === 'remove'
                                                        ? activeNavLinkStyle
                                                        : ''
                                                        }` }
                                                >
                                                    { i18n._( t`Swap` ) }
                                                </a>
                                            </NavLink>
                                            <NavLink href="/pool">
                                                <a
                                                    id={ `pool-nav-link` }
                                                    className={ `${navLinkStyle} ${routeTag === 'pool' || routeTag === 'find' || routeTag === 'stable-pool'
                                                        ? activeNavLinkStyle
                                                        : ''
                                                        }` }
                                                >
                                                    { i18n._( t`Pool` ) }
                                                </a>
                                            </NavLink>

                                            { chainId && featureEnabled( Feature.YIELD, chainId ) && (
                                                <NavLink href={ '/farm' }>
                                                    <a
                                                        id={ `yield-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'farm' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`Farms` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.LENDING, chainId ) && (
                                                <>
                                                    <NavLink href={ '/lending' }>
                                                        <a
                                                            id={ `lend-nav-link` }
                                                            className={ `${navLinkStyle} ${routeTag === 'lending' ? activeNavLinkStyle : ''
                                                                }` }
                                                        >
                                                            { i18n._( t`Lending` ) }
                                                        </a>
                                                    </NavLink>
                                                </>
                                            ) }

                                            { chainId && featureEnabled( Feature.STAKING, chainId ) && (
                                                <NavLink href={ '/stake' }>
                                                    <a
                                                        id={ `stake-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'stake' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`Stake` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.GEMO, chainId ) && (
                                                <NavLink href={ '/gemo' }>
                                                    <a
                                                        id={ `boost-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'gemo' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`GEMO` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.BOOST, chainId ) && (
                                                <NavLink href={ '/veEMO' }>
                                                    <a
                                                        id={ `boost-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'veEMO' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`veEMO` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.IFO, chainId ) && (
                                                <>
                                                    <NavLink href={ '/ieo' }>
                                                        <a
                                                            id={ `lend-nav-link` }
                                                            className={ `${navLinkStyle} ${routeTag === 'ieo' ? activeNavLinkStyle : ''
                                                                }` }
                                                        >
                                                            { i18n._( t`IEO` ) }
                                                        </a>
                                                    </NavLink>
                                                </>
                                            ) }

                                            { chainId && featureEnabled( Feature.GAMEFI, chainId ) && (
                                                <NavLink href={ '/gamefi' }>
                                                    <a
                                                        id={ `boost-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'gamefi' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`GameFi` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.FAUCET, chainId ) && (
                                                <NavLink href={ '/tools' }>
                                                    <a
                                                        id={ `bridge-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'tools' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`Faucet` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.BRIDGE, chainId ) && (
                                                <NavLink href={ '/bridge' }>
                                                    <a
                                                        id={ `bridge-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'bridge' ? activeNavLinkStyle : ''
                                                            }` }
                                                    >
                                                        { i18n._( t`Bridges` ) }
                                                    </a>
                                                </NavLink>
                                            ) }

                                            { chainId && featureEnabled( Feature.PRISALE, chainId ) && (
                                                <Link href={ '/privatesale' }>
                                                    <a
                                                        id={ `prisale-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'privatesale' ? activeNavLinkStyle : ''}` }
                                                    >
                                                        { ' ' }
                                                        { i18n._( t`Private sale` ) }
                                                    </a>
                                                </Link>
                                            ) }

                                            { chainId && featureEnabled( Feature.AIRDROP, chainId ) && (
                                                <Link href={ '/airdrops' }>
                                                    <a
                                                        id={ `airdrops-nav-link` }
                                                        className={ `${navLinkStyle} ${routeTag === 'airdrops' ? activeNavLinkStyle : ''}` }
                                                    >
                                                        { ' ' }
                                                        { i18n._( t`Airdrop` ) }
                                                    </a>
                                                </Link>
                                            ) }
                                        </div>
                                    </div>
                                </div>

                                <div className="fixed bottom-0 left-0 z-20 flex flex-row items-center justify-center w-full p-4 transition-all lg:w-auto bg-light-primary/90 dark:bg-dark-primary/90 backdrop-blur-lg lg:backdrop-filter-none lg:relative lg:p-0 lg:bg-transparent lg:dark:bg-transparent">
                                    <div className="flex items-center justify-center w-full gap-4 sm:justify-end">
                                        <div className="flex items-center w-auto mr-1 text-sm font-normal transition-all bg-transparent rounded-2xl cursor-pointer pointer-events-auto select-none hover:bg-dark-primary/10 text-primary dark:hover:bg-light-primary/5 whitespace-nowrap sm:block">
                                            <TokenStats token="EMO" />
                                        </div>
                                        {/* {library && library.provider.isMetaMask && (
                      <div className="hidden sm:inline-block">
                        <Web3Network />
                      </div>
                    )} */}

                                        <div className={ `flex w-auto text-sm transition-all  h-12 ${account ? 'rounded-xl border border-transparent border-gradient-r-blue-pink-special-light-primary dark:border-gradient-r-blue-pink-special-dark-primary p-0.5' : ''}` }>
                                            <div
                                                className={ `flex items-center justify-between h-full rounded-xl cursor-pointer pointer-events-auto select-none` }
                                            >
                                                { account && chainId && userEthBalance && (

                                                    <div className="pl-4 pr-2 py-2 text-sm font-bold text-light-text dark:text-dark-text whitespace-nowrap">
                                                        { userEthBalance?.toSignificant( 4 ) } { NATIVE[ chainId ].symbol }
                                                    </div>

                                                ) }
                                                <Web3Status />
                                            </div>
                                        </div>

                                        {/* <More /> */}
                                    </div>
                                </div>
                                <div className="flex -mr-2 sm:hidden">
                                    {/* Mobile menu button */ }

                                    <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-dark-primary dark:text-light-primary focus:outline-none">
                                        <span className="sr-only">{ i18n._( t`Open main menu` ) }</span>
                                        { open ? (
                                            <CloseIcon width="24px" height="24px" className='block' />
                                        ) : (
                                            <MenuAlt1Icon width="24px" height="24px" className='block' />
                                        ) }
                                    </Popover.Button>
                                </div>
                            </div>
                        </div>

                        <Popover.Panel className="sm:hidden">
                            <div className="flex flex-col px-4 pt-2 pb-3 space-y-1 bg-light-primary/50 dark:bg-dark-primary/50 backdrop-blur-lg">
                                <Link href={ '/swap' }>
                                    <a
                                        id={ `swap-nav-link` }
                                        className={ `${navLinkStyle} ${routeTag === 'swap' || routeTag === 'add' || routeTag === 'remove'
                                            ? activeNavLinkStyle
                                            : ''
                                            }` }
                                    >
                                        { i18n._( t`Swap` ) }
                                    </a>
                                </Link>
                                <Link href={ '/pool' }>
                                    <a
                                        id={ `pool-nav-link` }
                                        className={ `${navLinkStyle} ${routeTag === 'pool' || routeTag === 'find'
                                            ? activeNavLinkStyle
                                            : ''
                                            }` }
                                    >
                                        { i18n._( t`Pool` ) }
                                    </a>
                                </Link>

                                { chainId && featureEnabled( Feature.YIELD, chainId ) && (
                                    <Link href={ '/farm' }>
                                        <a
                                            id={ `yield-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'farm' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { ' ' }
                                            { i18n._( t`Farms` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.STAKING, chainId ) && (
                                    <Link href={ '/stake' }>
                                        <a
                                            id={ `stake-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'stake' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { i18n._( t`Stake` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.GEMO, chainId ) && (
                                    <Link href={ '/gemo' }>
                                        <a
                                            id={ `boost-nav-link` }
                                            className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                                        >
                                            { i18n._( t`GEMO` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.BOOST, chainId ) && (
                                    <Link href={ '/veEMO' }>
                                        <a
                                            id={ `boost-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'veEMO' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { i18n._( t`veEMO` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.IFO, chainId ) && (
                                    <Link href={ '/ieo' }>
                                        <a
                                            id={ `yield-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'ieo' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { ' ' }
                                            { i18n._( t`IEO` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.BRIDGE, chainId ) && (
                                    <Link href={ '/bridge' }>
                                        <a
                                            id={ `gamefi-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'bridge' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { i18n._( t`Bridges` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.PRISALE, chainId ) && (
                                    <Link href={ '/privatesale' }>
                                        <a
                                            id={ `prisale-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'privatesale' ? activeNavLinkStyle : ''
                                                }` }
                                        >
                                            { ' ' }
                                            { i18n._( t`Private sale` ) }
                                        </a>
                                    </Link>
                                ) }
                                { chainId && featureEnabled( Feature.AIRDROP, chainId ) && (
                                    <Link href={ '/airdrops' }>
                                        <a
                                            id={ `airdrops-nav-link` }
                                            className={ `${navLinkStyle} ${routeTag === 'privatesale' ? activeNavLinkStyle : ''}` }
                                        >
                                            { ' ' }
                                            { i18n._( t`Airdrop` ) }
                                        </a>
                                    </Link>
                                ) }

                                { chainId && featureEnabled( Feature.ANALYTICS, chainId ) && (
                                    <ExternalLink
                                        id={ `analytics-nav-link` }
                                        href={ ANALYTICS_URL[ chainId ] || 'https://analytics.x.com' }
                                        className={ navLinkStyle }
                                    >
                                        { i18n._( t`Analytics` ) }
                                    </ExternalLink>
                                ) }
                            </div>
                        </Popover.Panel>
                        <Divider className='mx-4 sm:mx-6 lg:mx-12' />
                    </>
                ) }

            </Popover>
        </header>
    )
}

export default AppBar
