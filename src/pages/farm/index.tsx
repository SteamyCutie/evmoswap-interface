import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import Typography from 'app/components/Typography'
import FarmList from 'app/features/farm/FarmList'

import useFuse from 'app/hooks/useFuse'
import { TridentBody, TridentHeader } from 'app/layouts/Trident'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useFarms from 'app/features/farm/useFarms'
import NavLink from 'app/components/NavLink'
import SearchPools from 'app/components/SearchPools'
import Head from 'next/head'

const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
const activeTabStyle = `${tabStyle} text-high-emphasis font-bold bg-dark-900`
const inactiveTabStyle = `${tabStyle} text-white`

const FILTER_TYPES = [
    { key: 'all', title: 'All Farms' },
    { key: 'stable', title: 'Stable Farms' },
    { key: 'double', title: 'Double Rewards' },
    { key: 'inactive', title: 'Inactive Farms' }
]

export default function Farms (): JSX.Element {
    const { i18n } = useLingui()
    const router = useRouter()
    const type = router.query.filter == null ? 'all' : ( router.query.filter as string )
    const [ selected, setSelected ] = useState( type )

    const query = useFarms()

    let tokenPrice = 0
    let totalTvlInUSD = 0

    query?.farms.map( ( farm: any ) => {
        tokenPrice = farm.tokenPrice
        totalTvlInUSD = farm.totalTvlInUSD
    } )

    const FILTER = {
        all: ( farm ) => farm.multiplier !== 0,
        stable: ( farm ) => farm.farmType == 'stable',
        double: ( farm ) => farm.farmType == 'double',
        inactive: ( farm ) => farm.multiplier == 0,
    }

    const datas = query?.farms.filter( ( farm ) => {
        return type in FILTER ? FILTER[ type ]( farm ) : true
    } )

    // Search Setup
    const options = { keys: [ 'symbol', 'name', 'lpToken' ], threshold: 0.4 }
    const { result, search, term } = useFuse( {
        data: datas && datas.length > 0 ? datas : [],
        options,
    } )

    return (
        <>
            <Head>
                <title>{ i18n._( t`Farm | EvmoSwap` ) }</title>
                <meta
                    key="description"
                    name="description"
                    content={ i18n._( t`Earn fees and rewards by depositing and staking your tokens to the platform.` ) }
                />
            </Head>
            <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
                <div>
                    <Typography variant="h2" className="text-high-emphesis" weight={ 700 }>
                        { i18n._( t`Yield Farm` ) }
                    </Typography>
                    <Typography variant="sm" weight={ 400 }>
                        { i18n._( t`Earn fees and rewards by depositing and staking your tokens to the platform.` ) }
                    </Typography>

                    <Typography variant="base" color="red" className="mt-4 text-red" weight={ 400 }>
                        1. Please go to <a className='text-yellow' href="https://legacy.evmoswap.org/farm" target="_blank" rel="noreferrer">https://legacy.evmoswap.org/farm</a>, Unstake your LPs.
                    </Typography>
                    <Typography variant="base" color="red" className="text-red" weight={ 400 }>
                        2. Staked your LPs in the below pools.
                    </Typography>
                </div>
                <div className="flex gap-3">
                    <Button id="btn-create-new-pool" size="sm">
                        <a href="https://forms.gle/rg2ac5xAQKR8d6Ff6" target="_blank" rel="noreferrer">
                            { i18n._( t`Apply for Yield Farm` ) }
                        </a>
                    </Button>
                </div>
            </TridentHeader>
            <TridentBody>
                <div className="flex flex-col w-full gap-6">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        {/* Select Tab */ }
                        <div className="flex m-auto mb-2 rounded h-11 md:m-0 md:w-8/12 bg-dark-800">
                            {
                                FILTER_TYPES.map( ( filter, index ) => (
                                    <div className="w-3/12 h-full p-1" onClick={ () => setSelected( filter.key ) } key={ index }>
                                        <NavLink href={ `/farm?filter=${filter.key}` }>
                                            <div className={ selected === filter.key ? activeTabStyle : inactiveTabStyle }>
                                                <p>{ i18n._( t`${filter.title}` ) }</p>
                                            </div>
                                        </NavLink>
                                    </div>
                                ) )
                            }
                        </div>
                        <SearchPools search={ search } term={ term } />
                    </div>
                    <FarmList farms={ result } />
                </div>
            </TridentBody>
        </>
    )
}
