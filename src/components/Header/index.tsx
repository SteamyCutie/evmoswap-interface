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

// import { ExternalLink, NavLink } from "./Link";
// import { ReactComponent as Burger } from "../assets/images/burger.svg";

const AppBar: React.FC<JSX.Element> = () => {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  const navLinkStyle =
    'p-2 text-base font-bold transition-all text-dark/80 hover:text-dark active:text-dark/90 focus:text-dark dark:text-light/80 dark:hover:text-light dark:active:text-light/90 dark:focus:text-light md:p-3 whitespace-nowrap'

  const routeTag: any = useRouter().asPath.split('/')[1].split('?')[0]

  return (
    <header className="flex-shrink-0 w-full">
      <Popover as="nav" className="z-10 w-full bg-transparent header-border-b">
        {({ open }) => (
          <>
            <div className="px-4 py-4 border-b border-dark-primary/10 dark:border-light-primary/10 bg-light-primary/50 dark:bg-dark-primary/50 lg:backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="grid dark:hidden">
                    <Image src="/logo.png" alt="light logo" width="191px" height="33px" />
                  </div>
                  <div className="hidden dark:grid">
                    <Image src="/logo-dark.png" alt="dark logo" width="191px" height="33px" />
                  </div>
                  <div className="hidden sm:block sm:ml-4">
                    <div className="flex space-x-2">
                      {/* <Buy /> */}
                      <NavLink href="/swap">
                        <a
                          id={`swap-nav-link`}
                          className={`${navLinkStyle} ${
                            routeTag === 'swap' || routeTag === 'add' || routeTag === 'remove'
                              ? 'text-dark dark:text-light'
                              : ''
                          }`}
                        >
                          {i18n._(t`Swap`)}
                        </a>
                      </NavLink>
                      <NavLink href="/pool">
                        <a
                          id={`pool-nav-link`}
                          className={`${navLinkStyle} ${routeTag === 'pool' ? 'text-dark dark:text-light' : ''}`}
                        >
                          {i18n._(t`Pool`)}
                        </a>
                      </NavLink>

                      {chainId && featureEnabled(Feature.YIELD, chainId) && (
                        <NavLink href={'/farm'}>
                          <a
                            id={`yield-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'farm' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`Farms`)}
                          </a>
                        </NavLink>
                      )}

                      {chainId && featureEnabled(Feature.LENDING, chainId) && (
                        <>
                          <NavLink href={'/lending'}>
                            <a
                              id={`lend-nav-link`}
                              className={`${navLinkStyle} ${routeTag === 'lending' ? 'text-dark dark:text-light' : ''}`}
                            >
                              {i18n._(t`Lending`)}
                            </a>
                          </NavLink>
                        </>
                      )}

                      {chainId && featureEnabled(Feature.STAKING, chainId) && (
                        <NavLink href={'/stake'}>
                          <a
                            id={`stake-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'stake' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`Stake`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.BOOST, chainId) && (
                        <NavLink href={'/veEMO'}>
                          <a
                            id={`boost-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'veEMO' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`veEMO`)}
                          </a>
                        </NavLink>
                      )}

                      {chainId && featureEnabled(Feature.IFO, chainId) && (
                        <>
                          <NavLink href={'/ieo'}>
                            <a
                              id={`lend-nav-link`}
                              className={`${navLinkStyle} ${routeTag === 'ieo' ? 'text-dark dark:text-light' : ''}`}
                            >
                              {i18n._(t`IEO`)}
                            </a>
                          </NavLink>
                        </>
                      )}

                      {chainId && featureEnabled(Feature.GAMEFI, chainId) && (
                        <NavLink href={'/gamefi'}>
                          <a
                            id={`boost-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'gamefi' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`GameFi`)}
                          </a>
                        </NavLink>
                      )}

                      {chainId && featureEnabled(Feature.FAUCET, chainId) && (
                        <NavLink href={'/tools'}>
                          <a
                            id={`bridge-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'tools' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`Faucet`)}
                          </a>
                        </NavLink>
                      )}

                      {chainId && featureEnabled(Feature.BRIDGE, chainId) && (
                        <NavLink href={'/bridge'}>
                          <a
                            id={`bridge-nav-link`}
                            className={`${navLinkStyle} ${routeTag === 'bridge' ? 'text-dark dark:text-light' : ''}`}
                          >
                            {i18n._(t`Bridges`)}
                          </a>
                        </NavLink>
                      )}

                      {chainId && featureEnabled(Feature.PRISALE, chainId) && (
                        <Link href={'/privatesale'}>
                          <a
                            id={`prisale-nav-link`}
                            className={`${navLinkStyle} ${
                              routeTag === 'privatesale' ? 'text-dark dark:text-light' : ''
                            }`}
                          >
                            {' '}
                            {i18n._(t`Private sale 🚀`)}
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fixed bottom-0 left-0 z-20 flex flex-row items-center justify-center w-full p-4 transition-all lg:w-auto bg-light-primary/30 dark:bg-dark-primary/50 backdrop-blur-lg lg:backdrop-filter-none lg:relative lg:p-0 lg:bg-transparent lg:dark:bg-transparent">
                  <div className="flex items-center justify-center w-full gap-4 sm:justify-end">
                    <div className="flex items-center w-auto mr-1 text-xs font-bold transition-all bg-transparent rounded cursor-pointer pointer-events-auto select-none hover:bg-dark-primary/10 text-primary dark:hover:bg-light-primary/5 whitespace-nowrap sm:block">
                      <TokenStats token="EMO" />
                    </div>
                    {library && library.provider.isMetaMask && (
                      <div className="hidden sm:inline-block">
                        <Web3Network />
                      </div>
                    )}

                    <div className="flex w-auto text-sm font-bold transition-all rounded-2xl bg-gradient-to-r p-0.5 from-blue-special/80 to-pink-special/80">
                      <div className="flex items-center justify-between h-full rounded-[14px] cursor-pointer pointer-events-auto select-none text-dark-primary dark:text-light-primary bg-light-primary/90 dark:bg-dark-primary/90 transition-all whitespace-nowrap">
                        {account && chainId && userEthBalance && (
                          <>
                            <div className="pl-4 pr-2 py-2 text-[16px] font-extrabold">
                              {userEthBalance?.toSignificant(4)} {NATIVE[chainId].symbol}
                            </div>
                          </>
                        )}
                        <Web3Status />
                      </div>
                    </div>
                    {/* <div className="hidden md:block">
                      <LanguageSwitch />
                    </div> */}
                    <More />
                  </div>
                </div>
                <div className="flex -mr-2 sm:hidden">
                  {/* Mobile menu button */}
                  {/* <div className="block mr-2 md:hidden">
                    <LanguageSwitch />
                  </div> */}
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-dark dark:text-light focus:outline-none">
                    <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                    {open ? (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      // <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      // <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel className="sm:hidden">
              <div className="flex flex-col px-4 pt-2 pb-3 space-y-1 bg-light-primary/50 dark:bg-dark-primary/50 backdrop-blur-lg">
                <Link href={'/swap'}>
                  <a
                    id={`swap-nav-link`}
                    className={`${navLinkStyle} ${
                      routeTag === 'swap' || routeTag === 'add' || routeTag === 'remove'
                        ? 'text-dark dark:text-light'
                        : ''
                    }`}
                  >
                    {i18n._(t`Swap`)}
                  </a>
                </Link>
                <Link href={'/pool'}>
                  <a
                    id={`pool-nav-link`}
                    className={`${navLinkStyle} ${routeTag === 'pool' ? 'text-dark dark:text-light' : ''}`}
                  >
                    {i18n._(t`Pool`)}
                  </a>
                </Link>

                {chainId && featureEnabled(Feature.YIELD, chainId) && (
                  <Link href={'/farm'}>
                    <a
                      id={`yield-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'farm' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {' '}
                      {i18n._(t`Farms`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.STAKING, chainId) && (
                  <Link href={'/stake'}>
                    <a
                      id={`stake-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'stake' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {i18n._(t`Stake`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.BOOST, chainId) && (
                  <Link href={'/veEMO'}>
                    <a
                      id={`boost-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'veEMO' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {i18n._(t`veEMO`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.IFO, chainId) && (
                  <Link href={'/ieo'}>
                    <a
                      id={`yield-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'ieo' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {' '}
                      {i18n._(t`IEO`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.BRIDGE, chainId) && (
                  <Link href={'/bridge'}>
                    <a
                      id={`gamefi-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'bridge' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {i18n._(t`Bridges`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.PRISALE, chainId) && (
                  <Link href={'/privatesale'}>
                    <a
                      id={`prisale-nav-link`}
                      className={`${navLinkStyle} ${routeTag === 'privatesale' ? 'text-dark dark:text-light' : ''}`}
                    >
                      {' '}
                      {i18n._(t`Private sale`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.ANALYTICS, chainId) && (
                  <ExternalLink
                    id={`analytics-nav-link`}
                    href={ANALYTICS_URL[chainId] || 'https://analytics.x.com'}
                    className={navLinkStyle}
                  >
                    {i18n._(t`Analytics`)}
                  </ExternalLink>
                )}
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </header>
  )
}

export default AppBar
