import React from 'react'

import { useActiveWeb3React } from 'app/services/web3'
import { STABLE_POOLS } from 'app/constants/pools'
import Logo from 'app/components/Logo'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'
import { classNames } from 'app/functions'
import Accordion from 'app/components/Accordion'
import StablePoolInfo from './StablePoolInfo'
import NavLink from 'app/components/NavLink'


const StablePool = ( { poolAddress }: { poolAddress: string } ) => {

    const { chainId } = useActiveWeb3React()
    const pool = STABLE_POOLS[ chainId ][ poolAddress ]

    return (
        <div className="rounded bg-dark-800">
            <Accordion
                className="flex bg-transparent justify-center items-center disabled:opacity-50 disabled:cursor-auto bg-opacity-90 hover:bg-opacity-100 rounded disabled:cursor-not-allowed focus:outline-none flex items-center justify-between w-full px-4 py-6 cursor-pointer bg-dark-800 hover:bg-dark-700 !bg-dark-700"
                header={
                    <div className="flex items-center space-x-4">
                        <Logo srcs={ [ pool.lpToken.icon.src ] } width={ pool.lpToken.icon.width } height={ pool.lpToken.icon.height } />
                        <div className="flex flex-col text-left">
                            <div className="text-lg sm:text-xl font-semibold">{ pool.name }</div>
                            <div className="text-sm">{ pool.title }</div>
                        </div>
                    </div>
                }
                toggle={
                    i18n._( t`Manage` )
                }
            >
                <div className='p-4 space-y-4'>
                    <StablePoolInfo poolAddress={ poolAddress } />
                </div>

                {/** Action Buttons */ }
                <div className={ classNames( 'grid gap-4', 'grid-cols-2' ) }>
                    <NavLink href={ `/stable-pool/add/${pool.name}` }>
                        <Button
                            id="add-pool-button"
                            color="blue"
                            className="grid items-center justify-center grid-flow-col gap-2 whitespace-nowrap"
                        >
                            { i18n._( t`Add` ) }
                        </Button>
                    </NavLink>
                    <NavLink href={ `/stable-pool/remove/${pool.name}` }>
                        <Button id="add-pool-button" color="gray">
                            { i18n._( t`Remove` ) }
                        </Button>
                    </NavLink>
                </div>

            </Accordion>
        </div>
    )
}

export default StablePool;