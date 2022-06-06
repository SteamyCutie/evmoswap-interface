import React from 'react'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NavLink from 'app/components/NavLink'

const NAV_TABS = [
    {
        key: 'standard',
        title: 'Standard AMM',
        path: '/pool',
        alert: {
            title: 'Standard AMM Liquidity Provider Rewards',
            description:
                'Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity',
        },
    },
    {
        key: 'stable',
        title: 'Stable AMM',
        path: '/stable-pool',
        alert: {
            title: 'Stable AMM Liquidity Provider Rewards',
            description:
                'Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity',
        },
    },
]

const tabStyle = 'flex justify-center items-center w-auto h-8 rounded text-base pr-6'
const activeTabStyle = `${tabStyle} text-dark-primary dark:text-light-primary font-extrabold`
const inactiveTabStyle = `${tabStyle} bg-opacity-40`

export default function PoolsNav () {
    const { i18n } = useLingui()

    return (
        <div className="flex flex-row items-center justify-start px-1.5 pb-4 h-14 text-light-text dark:text-dark-text hover:text-dark-primary dark:hover:text-light-primary transition-all">
            { NAV_TABS.map( ( tab, index ) => {
                return (
                    <NavLink activeClassName={ activeTabStyle } href={ `${tab.path}` } key={ index }>
                        <button className={ inactiveTabStyle }>{ i18n._( t`${tab.title}` ) }</button>
                    </NavLink>
                )
            } ) }
        </div>
    )
}
