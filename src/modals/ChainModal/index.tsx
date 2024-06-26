import { BridgeContextName } from '../../constants'
import { ChainId } from '@evmoswap/core-sdk'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import React from 'react'
import cookie from 'cookie-cutter'
import { useWeb3React } from '@web3-react/core'
import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'
import { Chain } from '../../entities/Chain'
import { bridgeInjected } from 'app/config/wallets'

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

    [ ChainId.BSC_TESTNET ]: {
        chainId: '0x61',
        chainName: 'BSC Testnet',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrls: [ 'https://data-seed-prebsc-1-s1.binance.org:8545' ],
        blockExplorerUrls: [ 'https://testnet.bscscan.com' ],
    },

    [ ChainId.EVMOS ]: {
        chainId: '0x2329',
        chainName: 'Evmos Mainnet',
        nativeCurrency: {
            name: 'Evmos',
            symbol: 'EVMOS',
            decimals: 18,
        },
        rpcUrls: [ 'https://eth.bd.evmos.org:8545' ],
        // rpcUrls: [ 'https://evmos-mainnet.gateway.pokt.network/v1/lb/62c4395e578dfa0039949cfa'],
        
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
}

interface ChainModalProps {
    availableChains: number[]
    title?: string
    chain?: Chain
    isOpen: boolean
    onDismiss: () => void
    onSelect: ( chain: Chain ) => void
    switchOnSelect: boolean
}

export default function ChainModal ( {
    availableChains,
    title,
    chain,
    isOpen,
    onDismiss,
    onSelect,
    switchOnSelect,
}: ChainModalProps ): JSX.Element | null {
    const { chainId, library, account, activate } = useWeb3React( BridgeContextName )

    const goToRelay = () => {
        window.open( 'https://app.relaychain.com/transfer', '_blank' ).focus()
    }

    return (
        <Modal isOpen={ isOpen } onDismiss={ onDismiss } maxWidth={ 400 }>
            <ModalHeader onClose={ onDismiss } title={ title } />
            <div className="grid grid-flow-row-dense grid-cols-1 gap-3 overflow-y-auto mt-4">
                { availableChains.map( ( key: ChainId, i: number ) => {
                    if ( chain.id === key ) {
                        return (
                            <button key={ i } className="w-full col-span-1 p-px rounded bg-gradient-to-r from-yellow to-yellow">
                                <div className="flex items-center w-full h-full p-3 space-x-3 rounded bg-dark-1000">
                                    <Image
                                        src={ NETWORK_ICON[ key ] }
                                        alt={ `Select ${NETWORK_LABEL[ key ]} Network` }
                                        className="rounded-md"
                                        width="32px"
                                        height="32px"
                                    />
                                    <div className="font-bold text-primary">{ NETWORK_LABEL[ key ] }</div>
                                </div>
                            </button>
                        )
                    }
                    return (
                        <button
                            key={ i }
                            onClick={ () => {
                                onSelect( { id: key, icon: NETWORK_ICON[ key ], name: NETWORK_LABEL[ key ] } )
                                onDismiss()
                                if ( switchOnSelect ) {
                                    activate( bridgeInjected )
                                    const params = SUPPORTED_NETWORKS[ key ]
                                    cookie.set( 'chainId', key )
                                    if ( key === ChainId.ETHEREUM ) {
                                        library?.send( 'wallet_switchEthereumChain', [ { chainId: '0x1' }, account ] )
                                    } else {
                                        library?.send( 'wallet_addEthereumChain', [ params, account ] )
                                    }
                                }
                            } }
                            className="flex items-center w-full col-span-1 p-3 space-x-3 rounded cursor-pointer bg-light-secondary dark:bg-dark-secondary hover:bg-light dark:bg-dark"
                        >
                            <Image src={ NETWORK_ICON[ key ] } alt="Switch Network" className="rounded-md" width="32px" height="32px" />
                            <div className="font-bold text-primary">{ NETWORK_LABEL[ key ] }</div>
                        </button>
                    )
                } ) }

                {/* Redirect to relay bridge while implementing UI integration */ }
                {/* <button className="w-full col-span-1 p-px rounded bg-light-secondary dark:bg-dark-secondary hover:bg-light dark:bg-dark" onClick={() => goToRelay()}>
          <div className="flex items-center w-full h-full p-3 space-x-3 rounded">
            <Image
              src={NETWORK_ICON[ChainId.AVALANCHE]}
              alt={`Select ${NETWORK_LABEL[ChainId.AVALANCHE]} Network`}
              className="rounded-md"
              width="32px"
              height="32px"
            />
            <div className="font-bold text-primary">{NETWORK_LABEL[ChainId.AVALANCHE]}</div>
            <ExternalLinkIcon style={{ width: '26px', height: '26px', marginLeft: 'auto' }} />
          </div>
        </button>

        <button className="w-full col-span-1 p-px rounded bg-light-secondary dark:bg-dark-secondary hover:bg-light dark:bg-dark" onClick={() => goToRelay()}>
          <div className="flex items-center w-full h-full p-3 space-x-3 rounded">
            <Image
              src={NETWORK_ICON[ChainId.MATIC]}
              alt={`Select ${NETWORK_LABEL[ChainId.MATIC]} Network`}
              className="rounded-md"
              width="32px"
              height="32px"
            />
            <div className="font-bold text-primary">{NETWORK_LABEL[ChainId.MATIC]}</div>
            <ExternalLinkIcon style={{ width: '26px', height: '26px', marginLeft: 'auto' }} />
          </div>
        </button> */}
            </div>
        </Modal>
    )
}
