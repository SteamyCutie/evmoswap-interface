import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'

import { ApplicationModal } from '../../state/application/actions'
import { ChainId } from '@evmoswap/core-sdk'
import Image from 'next/image'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import React from 'react'
import cookie from 'cookie-cutter'
import { useActiveWeb3React } from '../../services/web3'

export const SUPPORTED_NETWORKS: {
    [ chainId in ChainId ]?: {
        chainId: string
        chainName: string
        nativeCurrency: {
            name: string
            symbol: string
            decimals: number
        }
        rpcUrls: string[]
        blockExplorerUrls: string[]
    }
} = {
    [ ChainId.ETHEREUM ]: {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: [ 'https://mainnet.infura.io/v3' ],
        blockExplorerUrls: [ 'https://etherscan.com' ],
    },

    [ ChainId.EVMOS ]: {
        chainId: '0x2329',
        chainName: 'Evmos Mainnet',
        nativeCurrency: {
            name: 'Evmos',
            symbol: 'EVMOS',
            decimals: 18,
        },
        // rpcUrls: [ 'https://eth.bd.evmos.org:8545' ],
        rpcUrls: [ 'https://evmos-mainnet.gateway.pokt.network/v1/lb/62c4395e578dfa0039949cfa'],
        blockExplorerUrls: [ 'https://evm.evmos.org' ],
    },
    [ ChainId.EVMOS_TESTNET ]: {
        chainId: '0x2328',
        chainName: 'Evmos Testnet',
        nativeCurrency: {
            name: 'Evmos',
            symbol: 'EVMOS',
            decimals: 18,
        },
        rpcUrls: [ 'https://eth.bd.evmos.dev:8545' ],
        blockExplorerUrls: [ 'https://evm.evmos.dev/' ],
    },
    [ ChainId.BSC_TESTNET ]: {
        chainId: '0x61',
        chainName: 'BSC Testnet',
        nativeCurrency: {
            name: 'tBNB',
            symbol: 'TBNB',
            decimals: 18,
        },
        rpcUrls: [ 'https://data-seed-prebsc-1-s1.binance.org:8545' ],
        blockExplorerUrls: [ 'https://testnet.bscscan.com' ],
    },
}

export default function NetworkModal (): JSX.Element | null {
    const { chainId, library, account } = useActiveWeb3React()
    const networkModalOpen = useModalOpen( ApplicationModal.NETWORK )
    const toggleNetworkModal = useNetworkModalToggle()

    // if (!chainId) return null

    return (
        <Modal isOpen={ networkModalOpen } onDismiss={ toggleNetworkModal } maxWidth={ 572 }>
            <ModalHeader onClose={ toggleNetworkModal } title="Select a Network" />
            <div className="mb-6 text-base text-primary">
                You are currently browsing <span className="font-bold text-pink-special">EMO</span> on the{ ' ' }
                <span className="font-bold text-blue">{ NETWORK_LABEL[ chainId ] }</span> network
            </div>

            <div className="grid grid-flow-row-dense grid-cols-1 gap-5 overflow-y-auto md:grid-cols-2">
                { [ ChainId.EVMOS, ChainId.EVMOS_TESTNET ].map( ( key: ChainId, i: number ) => {
                    // {[ChainId.BSC_TESTNET, ChainId.EVMOS_TESTNET].map((key: ChainId, i: number) => {
                    if ( chainId === key ) {
                        return (
                            <button
                                key={ i }
                                className="w-full col-span-1 p-px rounded-2.5xl bg-gradient-to-r from-blue-special to-pink-special"
                            >
                                <div className="flex items-center w-full h-full px-3 py-2 space-x-3 rounded-2.5xl bg-light-secondary/90 dark:bg-dark-secondary/90 transition-all">
                                    <Image
                                        src={ NETWORK_ICON[ key ] }
                                        alt={ `Switch to ${NETWORK_LABEL[ key ]} Network` }
                                        className="rounded-md"
                                        width="32px"
                                        height="32px"
                                    />
                                    <div className="font-extrabold text-primary text-base">{ NETWORK_LABEL[ key ] }</div>
                                </div>
                            </button>
                        )
                    }
                    return (
                        <button
                            key={ i }
                            onClick={ () => {
                                toggleNetworkModal()
                                const params = SUPPORTED_NETWORKS[ key ]
                                cookie.set( 'chainId', key )
                                if ( key === ChainId.ETHEREUM ) {
                                    library?.send( 'wallet_switchEthereumChain', [ { chainId: '0x1' }, account ] )
                                } else {
                                    library?.send( 'wallet_addEthereumChain', [ params, account ] )
                                }
                            } }
                            className="flex items-center w-full col-span-1 px-3 py-2 space-x-3 rounded-2.5xl cursor-pointer border border-dark-primary/10 dark:border-light-primary/10 bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/80 dark:hover:bg-dark-secondary/80 transition-all"
                        >
                            <Image src={ NETWORK_ICON[ key ] } alt="Switch Network" className="rounded-md" width="32px" height="32px" />
                            <div className="font-extrabold text-primary text-base">{ NETWORK_LABEL[ key ] }</div>
                        </button>
                    )
                } ) }
                {/* {['Clover', 'Telos', 'Optimism'].map((network, i) => (
          <button
            key={i}
            className="flex items-center w-full col-span-1 p-3 space-x-3 rounded-2.5xl cursor-pointer border border-dark-primary/10 dark:border-light-primary/10 bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/80 dark:hover:bg-dark-secondary/80 transition-all"
          >
            <Image
              src="/images/tokens/unknown.png"
              alt="Switch Network"
              className="rounded-md"
              width="32px"
              height="32px"
            />
            <div className="font-bold text-primary">{network} (Coming Soon)</div>
          </button>
        ))} */}
            </div>
        </Modal>
    )
}
