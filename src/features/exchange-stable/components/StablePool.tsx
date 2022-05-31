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

const StablePool = ({ poolId }: { poolId: string }) => {
  const { chainId } = useActiveWeb3React()
  const pool = STABLE_POOLS[chainId][poolId]

  return (
    <div>
      <Accordion
        className="flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none w-full p-4 cursor-pointer text-dark-primary dark:text-light-primary transition-all"
        header={
          <div className="flex items-center space-x-4">
            <Logo srcs={[pool.lpToken.icon.src]} width={36} height={36} />
            <div className="flex flex-col text-left">
              <div className="text-base font-bold">{pool.name}</div>
              <div className="text-sm">{pool.title}</div>
            </div>
          </div>
        }
        toggle={i18n._(t`Manage`)}
      >
        <div className="grid mx-4 py-4 gap-2 border-t border-light-stroke dark:border-dark-stroke transition-all">
          <StablePoolInfo poolId={poolId} />

          {/** Action Buttons */}
          <div className={classNames('grid gap-4', 'grid-cols-2')}>
            <NavLink href={`/stable-pool/remove/${pool.slug}`}>
              <Button id="add-pool-button" size="lg" color="red" variant="outlined" className="text-sm font-bold">
                {i18n._(t`Remove`)}
              </Button>
            </NavLink>
            <NavLink href={`/stable-pool/add/${pool.slug}`}>
              <Button
                id="add-pool-button"
                color="gradient"
                size="lg"
                className="grid items-center text-sm font-bold justify-center grid-flow-col gap-2 whitespace-nowrap"
              >
                {i18n._(t`Add`)}
              </Button>
            </NavLink>
          </div>
        </div>
      </Accordion>
    </div>
  )
}

export default StablePool
