import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'

import Image from 'next/image'
import NetworkModel from '../../modals/NetworkModal'
import React from 'react'
import { useActiveWeb3React } from '../../services/web3'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { ChainId } from '@evmoswap/core-sdk'

const Web3Network = () => {
  const { chainId } = useActiveWeb3React()

  const toggleNetworkModal = useNetworkModalToggle()

  if (!chainId) return null

  return (
    <div
      className="flex items-center text-sm font-bold transition-all bg-transparent rounded cursor-pointer pointer-events-auto select-none hover:bg-dark-primary/10 dark:hover:bg-light-primary/5 whitespace-nowrap"
      onClick={() => toggleNetworkModal()}
    >
      {ChainId.EVMOS === chainId ? (
        <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max hover:bg-dark-primary/10 text-dark-primary/80 dark:text-light-primary/80">
          <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
          <div className="text-primary">{NETWORK_LABEL[chainId]}</div>
        </div>
      ) : (
        <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-blue-special/50">
          <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
          <div className="text-white">{NETWORK_LABEL[chainId]}</div>
        </div>
      )}

      <NetworkModel />
    </div>
  )
}

export default Web3Network
