import { Popover, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

import ExternalLink from '../ExternalLink'
import { I18n } from '@lingui/core'
import Image from 'next/image'
import { classNames } from '../../functions/styling'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NavLink from '../NavLink'
import LanguageSwitch from '../LanguageSwitch'
import { MenuIcon } from '../Icon'
import { Divider } from '../Divider/Divider'

const items = ( i18n: I18n ) => [
    {
        name: i18n._( t`Docs` ),
        description: i18n._( t`Documentation for users of EvmoSwap.` ),
        href: 'https://docs.evmoswap.org',
        external: true,
    },
    {
        name: i18n._( t`Medium` ),
        description: i18n._( t`News for users of EvmoSwap.` ),
        href: 'https://evmoswap.medium.com',
        external: true,
    },
    {
        name: i18n._( t`Twitter` ),
        description: i18n._( t`Follow our official Twitter.` ),
        href: 'https://twitter.com/evmoswap',
        external: true,
    },
    {
        name: i18n._( t`Telegram` ),
        description: i18n._( t`Join the community on Telegram.` ),
        href: 'https://t.me/evmoswap',
        external: true,
    },
    {
        name: i18n._( t`Discord` ),
        description: i18n._( t`Join the community on Discord.` ),
        href: 'https://discord.gg/YXxega5vJG',
        external: true,
    },
    {
        name: i18n._( t`GitHub` ),
        description: i18n._( t`EvmoSwap is a supporter of Open Source.` ),
        href: 'https://github.com/evmoswap',
        external: true,
    },
    {
        name: i18n._( t`Audit` ),
        description: i18n._( t`EvmoSwap audit by Certik.` ),
        href: 'https://docs.evmoswap.org/security-audits',
        external: true,
    },
    {
        name: i18n._( t`Vesting` ),
        description: i18n._( t`Daily unlocks from the vesting period.` ),
        href: '/veEMO',
        external: false,
    },
]

const Menu = () => {
    const { i18n } = useLingui()
    const solutions = items( i18n )
    const isDesktop = window.innerWidth > 1024

    return (
        <Popover className="relative ml-auto md:m-0 z-10">
            { ( { open, close } ) => (
                <>
                    <Popover.Button
                        className={ classNames(
                            open
                                ? 'text-dark/60 dark:text-light/60'
                                : 'text-dark dark:text-light',
                            'focus:outline-none hover:text-dark/60 dark:hover:text-light/60 transition-all m-0 mr-1 flex justify-center items-center font-black'
                        ) }
                    >
                        <MenuIcon width="14" height="14" />
                    </Popover.Button>

                    <Transition
                        show={ open }
                        as={ Fragment }
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel
                            static
                            className={ classNames(
                                'absolute w-screen md:max-w-sm h-screen  z-10  overflow-y-scroll',
                                'top-8 md:-top-8 mt-2 -mr-3 md:-mr-0 md:mt-0 -right-1 md:-right-5',
                                'md:border-l md:border-0.5 md:border-dark/10 md:dark:border-light/10',
                                '-translate-y-full md:translate-y-0',
                                'bg-light dark:bg-dark md:bg-transparent md:dark:bg-transparent',
                            ) }
                        >
                            <div className="flex justify-between py-3 md:py-4 mb-1 mt-2 bg-light dark:bg-dark px-8 md:px-6">
                                <LanguageSwitch />
                                <button className='text-dark dark:text-light hover:text-dark dark:hover:text-light' onClick={ () => { close() } }>
                                    <MenuIcon width="14" height="14" />
                                </button>
                            </div>
                            <Divider className='md:hidden' />
                            <div className="overflow-hidden md:px-0 bg-light dark:bg-dark">
                                <div className="relative grid gap-4 py-3 transition-all px-8 md:px-6">

                                    { solutions.map( ( item, idx ) =>
                                    ( <>
                                        { idx > 0 && <Divider /> }
                                        <NavLink key={ item.name } href={ item.href }>
                                            <a
                                                className={ `flex items-center justify-between transition-all duration-150 ease-in-out hover:bg-dark/10 dark:hover:bg-light/5}` }
                                                target={ item.external ? '_blank' : '' }
                                            >
                                                <div>
                                                    <p className="text-base font-semibold transition-all text-dark dark:text-light">{ item.name }</p>
                                                    <p className="mt-1 text-sm transition-all text-light-text dark:text-dark-text">
                                                        { item.description }
                                                    </p>
                                                </div>
                                                <div className="text-dark dark:text-light">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M14.8125 8.79425H3.5625"
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M10.2754 4.27596L14.8129 8.79396L10.2754 13.3127"
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </div>
                                            </a>
                                        </NavLink>
                                    </>
                                    )
                                    ) }
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )
            }
        </Popover >
    )
}

export default Menu
