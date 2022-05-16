import React from 'react'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NavLink from 'app/components/NavLink'

const NAV_TABS = [
    {
        key: "standard",
        title: "Standard AMM",
        path: "/pool",
        alert: {
            title: "Standard AMM Liquidity Provider Rewards",
            description: "Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity",
        }
    },
    {
        key: "stable",
        title: "Stable AMM",
        path: "/stable-pool",
        alert: {
            title: "Stable AMM Liquidity Provider Rewards",
            description: "Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity",
        }
    }
];
const tabStyle = ' flex justify-center items-center w-auto h-8 rounded font-bold md:font-medium lg:text-lg text-sm rounded-lg p-6 bg-dark-800'
const activeTabStyle = `${tabStyle} text-white`
const inactiveTabStyle = `${tabStyle} bg-opacity-40 text-secondary`


export default function PoolsNav () {
    const { i18n } = useLingui()

    return (
        <div className="flex flex-row items-center justify-center rounded rounded p-3px h-[46px]">
            {
                NAV_TABS.map( ( tab, index ) => {
                    return (
                        <NavLink
                            activeClassName={ activeTabStyle }
                            href={ `${tab.path}` }
                            key={ index }
                        >
                            <button className={ inactiveTabStyle }>
                                { i18n._( t`${tab.title}` ) }
                            </button>
                        </NavLink>
                    )
                } )
            }
        </div>
    )
}
