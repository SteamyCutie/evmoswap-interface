import { Popover, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

import ExternalLink from '../ExternalLink'
import { I18n } from '@lingui/core'
import Image from 'next/image'
import { classNames } from '../../functions/styling'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NavLink from '../NavLink'

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
        href: '/vesting',
        external: false,
    },
]

const Menu = () => {
    const { i18n } = useLingui()
    const solutions = items( i18n )
    const isDesktop = window.innerWidth > 1024

    return (
        <Popover className="relative ml-auto md:m-0 z-10">
            { ( { open } ) => (
                <>
                    <Popover.Button
                        className={ classNames(
                            open
                                ? 'text-dark-primary/60 dark:text-light-primary/60'
                                : 'text-dark-primary dark:text-light-primary',
                            'focus:outline-none hover:text-dark-primary/60 dark:hover:text-light-primary/60 transition-all m-0 mr-1 flex justify-center items-center font-black'
                        ) }
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1 3.33333C1 1.58319 1.01874 1 3.33333 1C5.64793 1 5.66667 1.58319 5.66667 3.33333C5.66667 5.08348 5.67405 5.66667 3.33333 5.66667C0.992618 5.66667 1 5.08348 1 3.33333Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.33398 3.33333C8.33398 1.58319 8.35272 1 10.6673 1C12.9819 1 13.0007 1.58319 13.0007 3.33333C13.0007 5.08348 13.008 5.66667 10.6673 5.66667C8.3266 5.66667 8.33398 5.08348 8.33398 3.33333Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1 10.6667C1 8.91653 1.01874 8.33334 3.33333 8.33334C5.64793 8.33334 5.66667 8.91653 5.66667 10.6667C5.66667 12.4168 5.67405 13 3.33333 13C0.992618 13 1 12.4168 1 10.6667Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.33398 10.6667C8.33398 8.91653 8.35272 8.33334 10.6673 8.33334C12.9819 8.33334 13.0007 8.91653 13.0007 10.6667C13.0007 12.4168 13.008 13 10.6673 13C8.3266 13 8.33398 12.4168 8.33398 10.6667Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
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
                            className={ `absolute w-screen max-w-sm px-2 mt-[9px] transform -translate-x-full bottom-12 lg:top-12 left-full sm:px-0 ${isDesktop ? '' : 'overflow-y-scroll max-h-[480px]'
                                }` }
                        >
                            <div className="overflow-hidden border-0">
                                <div className="relative z-50 grid gap-4 px-5 py-6 transition-all bg-light-primary/70 dark:bg-dark-primary/80 sm:gap-6 sm:p-8">
                                    { solutions.map( ( item, idx ) =>
                                        item.external ? (
                                            <ExternalLink
                                                key={ item.name }
                                                href={ item.href }
                                                className={ `flex items-center justify-between p-3 -m-3 transition-all duration-150 ease-in-out hover:bg-dark-primary/10 dark:hover:bg-light-primary/5 ${idx > 0 ? 'border-t border-[#12121219] dark:border-[#FFFFFF19]' : ''
                                                    }` }
                                            >
                                                <div>
                                                    <p className="text-base font-bold transition-all text-dark dark:text-light">{ item.name }</p>
                                                    <p className="mt-1 text-sm transition-all text-dark/80 dark:text-light/80">
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
                                            </ExternalLink>
                                        ) : (
                                            <NavLink key={ item.name } href={ item.href }>
                                                <a
                                                    className={ `flex items-center justify-between p-3 -m-3 transition-all duration-150 ease-in-out hover:bg-dark-primary/10 dark:hover:bg-light-primary/5 ${idx > 0 ? 'border-t border-[#12121219] dark:border-[#FFFFFF19]' : ''
                                                        }` }
                                                >
                                                    <div>
                                                        <p className="text-base font-bold transition-all text-dark dark:text-light">{ item.name }</p>
                                                        <p className="mt-1 text-sm transition-all text-dark/80 dark:text-light/80">
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
                                        )
                                    ) }
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            ) }
        </Popover>
    )
}

export default Menu
