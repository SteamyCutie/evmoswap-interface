import React from 'react'

import { useActiveWeb3React } from 'app/services/web3'
import { STABLE_POOLS } from 'app/constants/stables'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'
import { classNames } from 'app/functions'
import Accordion from 'app/components/Accordion'
import NavLink from 'app/components/NavLink'
import { useStablePoolInfo } from '../hooks'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import StablePoolDetail from './StablePoolDetail'
import { Divider } from 'app/components/Divider/Divider'

const StablePoolItem = ( { poolId }: { poolId: string } ) => {
    const { chainId } = useActiveWeb3React()
    const pool = STABLE_POOLS[ chainId ][ poolId ]
    const poolInfo = useStablePoolInfo( poolId )

    return (
        <div className="bg-light-primary dark:bg-dark-primary transition-all border-2 rounded-2xl border-light-stroke dark:border-dark-stroke p-2">
            <Accordion
                className="flex bg-transparent justify-between items-center rounded w-full px-4 py-2 font-semibold text-dark dark:text-light"
                header={
                    <div className="flex items-center space-x-4">
                        <CurrencyLogo currency={ poolInfo.lpToken } size={ '54px' } />
                        <div className="flex flex-col text-left">
                            <div className="text-lg sm:text-base">{ pool.name }</div>
                            <div className="font-medium">{ pool.title }</div>
                        </div>
                    </div>
                }
                toggle={ i18n._( t`Manage` ) }
            >
                <div className='p-4'>
                    <Divider className='mb-4' />

                    <StablePoolDetail poolInfo={ poolInfo } showPosition={ true } className="py-4 pb-8" />

                    {/** Action Buttons */ }
                    <div className={ classNames( 'grid gap-4', 'grid-cols-2' ) }>
                        <NavLink href={ `/stable-pool/remove/${pool.slug}` }>
                            <Button id="add-pool-button" color="red" size='lg' variant='outlined'>
                                { i18n._( t`Remove` ) }
                            </Button>
                        </NavLink>
                        <NavLink href={ `/stable-pool/add/${pool.slug}` }>
                            <Button
                                id="add-pool-button"
                                color="gradient"
                                size='lg'
                                className="grid items-center justify-center grid-flow-col gap-2 whitespace-nowrap"
                            >
                                { i18n._( t`Add` ) }
                            </Button>
                        </NavLink>

                    </div>
                </div>
            </Accordion>
        </div>
    )
}

export default StablePoolItem
