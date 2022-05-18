import { Popover, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

import ExternalLink from '../ExternalLink'
import { I18n } from '@lingui/core'
import Image from 'next/image'
import { classNames } from '../../functions/styling'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NavLink from '../NavLink'

const items = (i18n: I18n) => [
  {
    name: i18n._(t`Docs`),
    description: i18n._(t`Documentation for users of EvmoSwap.`),
    href: 'https://docs.evmoswap.org',
    external: true,
  },
  {
    name: i18n._(t`Medium`),
    description: i18n._(t`News for users of EvmoSwap.`),
    href: 'https://evmoswap.medium.com',
    external: true,
  },
  {
    name: i18n._(t`Twitter`),
    description: i18n._(t`Follow our official Twitter.`),
    href: 'https://twitter.com/evmoswap',
    external: true,
  },
  {
    name: i18n._(t`Telegram`),
    description: i18n._(t`Join the community on Telegram.`),
    href: 'https://t.me/evmoswap',
    external: true,
  },
  {
    name: i18n._(t`Discord`),
    description: i18n._(t`Join the community on Discord.`),
    href: 'https://discord.gg/YXxega5vJG',
    external: true,
  },
  {
    name: i18n._(t`GitHub`),
    description: i18n._(t`EvmoSwap is a supporter of Open Source.`),
    href: 'https://github.com/evmoswap',
    external: true,
  },
  {
    name: i18n._(t`Audit`),
    description: i18n._(t`EvmoSwap audit by Certik.`),
    href: 'https://docs.evmoswap.org/security-audits',
    external: true,
  },
  {
    name: i18n._(t`Vesting`),
    description: i18n._(t`Daily unlocks from the vesting period.`),
    href: '/vesting',
    external: false,
  },
]

const Menu = () => {
  const { i18n } = useLingui()
  const solutions = items(i18n)
  const isDesktop = window.innerWidth > 1024

  return (
    <Popover className="relative ml-auto md:m-0">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              open
                ? 'text-dark-primary/80 dark:text-light-primary/80'
                : 'text-dark-primary/60 dark:text-light-primary/60',
              'focus:outline-none hover:text-dark-primary dark:hover:text-light-primary transition-all m-2 mr-1'
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.5 3.41667C0.5 1.22899 0.523424 0.5 3.41667 0.5C6.30991 0.5 6.33333 1.22899 6.33333 3.41667C6.33333 5.60434 6.34256 6.33333 3.41667 6.33333C0.490773 6.33333 0.5 5.60434 0.5 3.41667Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.66699 3.41667C9.66699 1.22899 9.69042 0.5 12.5837 0.5C15.4769 0.5 15.5003 1.22899 15.5003 3.41667C15.5003 5.60434 15.5096 6.33333 12.5837 6.33333C9.65776 6.33333 9.66699 5.60434 9.66699 3.41667Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.5 12.5833C0.5 10.3956 0.523424 9.66666 3.41667 9.66666C6.30991 9.66666 6.33333 10.3956 6.33333 12.5833C6.33333 14.771 6.34256 15.5 3.41667 15.5C0.490773 15.5 0.5 14.771 0.5 12.5833Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.66699 12.5833C9.66699 10.3956 9.69042 9.66666 12.5837 9.66666C15.4769 9.66666 15.5003 10.3956 15.5003 12.5833C15.5003 14.771 15.5096 15.5 12.5837 15.5C9.65776 15.5 9.66699 14.771 9.66699 12.5833Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Popover.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              static
              className={`absolute z-50 w-screen max-w-xs px-2 mt-3 transform -translate-x-full bottom-12 lg:top-12 left-full sm:px-0 ${
                isDesktop ? '' : 'overflow-y-scroll max-h-[480px]'
              }`}
            >
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative grid gap-6 px-5 py-6 transition-all bg-light-primary/50 dark:bg-dark-primary/50 backdrop-blur-lg sm:gap-8 sm:p-8">
                  {solutions.map((item) =>
                    item.external ? (
                      <ExternalLink
                        key={item.name}
                        href={item.href}
                        className="block p-3 -m-3 transition-all duration-150 ease-in-out rounded-md hover:bg-dark-primary/10 dark:hover:bg-light-primary/5"
                      >
                        <p className="text-base font-bold transition-all text-dark dark:text-light">{item.name}</p>
                        <p className="mt-1 text-sm transition-all text-dark/80 dark:text-light/80">
                          {item.description}
                        </p>
                      </ExternalLink>
                    ) : (
                      <NavLink key={item.name} href={item.href}>
                        <a className="block p-3 -m-3 transition-all duration-150 ease-in-out rounded-md hover:bg-dark-primary/10 dark:hover:bg-light-primary/5">
                          <p className="text-base font-bold transition-all text-dark dark:text-light">{item.name}</p>
                          <p className="mt-1 text-sm transition-all text-dark/80 dark:text-light/80">
                            {item.description}
                          </p>
                        </a>
                      </NavLink>
                    )
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default Menu
