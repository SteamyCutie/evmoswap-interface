import React, { useMemo } from 'react'
import { injected } from '../../config/wallets'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'

import { AbstractConnector } from '@web3-react/abstract-connector'
import Image from 'next/image'
import Loader from '../Loader'
import { NetworkContextName } from '../../constants'
import { TransactionDetails } from '../../state/transactions/reducer'
import WalletModal from '../../modals/WalletModal'
import Web3Connect from '../Web3Connect'
import { shortenAddress } from '../../functions/format'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import useENSName from '../../hooks/useENSName'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useWeb3React } from '@web3-react/core'

const IconWrapper = styled.div<{ size?: number }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  & > * {
    height: ${( { size } ) => ( size ? size + 'px' : '32px' )};
    width: ${( { size } ) => ( size ? size + 'px' : '32px' )};
  }
`

// we want the latest one to come first, so return negative if a is after b
const newTransactionsFirst = ( a: TransactionDetails, b: TransactionDetails ) => {
    return b.addedTime - a.addedTime
}

// eslint-disable-next-line react/prop-types
const StatusIcon = ( { connector }: { connector: AbstractConnector } ) => {
    if ( connector === injected ) {
        return <Image src="/images/wallets/metamask.png" alt="Injected (MetaMask etc...)" width={ 20 } height={ 20 } />
        // return <Identicon />
    } else if ( connector.constructor.name === 'WalletConnectConnector' ) {
        return (
            <IconWrapper size={ 16 }>
                <Image src="/images/wallets/wallet-connect.svg" alt={ 'Wallet Connect' } width="16px" height="16px" />
            </IconWrapper>
        )
    } else if ( connector.constructor.name === 't' ) {
        //crypto defiwallet
        return (
            <IconWrapper size={ 16 }>
                <Image src="/images/wallets/cryptodefi.svg" alt={ 'Crypto DeFi Wallet' } width="16px" height="16px" />
            </IconWrapper>
        )
    }
    return null
}

const Web3StatusInner = () => {
    const { i18n } = useLingui()
    const { account, connector } = useWeb3React()

    const { ENSName } = useENSName( account ?? undefined )

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo( () => {
        const txs = Object.values( allTransactions )
        return txs.filter( isTransactionRecent ).sort( newTransactionsFirst )
    }, [ allTransactions ] )

    const pending = sortedRecentTransactions
        .filter( ( tx ) => {
            if ( tx.receipt ) {
                return false
            } else if ( tx.archer && tx.archer.deadline * 1000 - Date.now() < 0 ) {
                return false
            } else {
                return true
            }
        } )
        .map( ( tx ) => tx.hash )

    const hasPendingTransactions = !!pending.length

    const toggleWalletModal = useWalletModalToggle()

    if ( account ) {
        return (
            <div
                id="web3-status-connected"
                className="flex items-center px-2 sm:px-3 py-1 sm:py-2 m-0.5 text-sm rounded-lg bg-light-secondary dark:bg-dark-secondary transition-all text-dark-primary/80 dark:text-light-primary/80"
                onClick={ toggleWalletModal }
            >
                { hasPendingTransactions ? (
                    <div className="flex items-center justify-between">
                        <div className="pr-2">
                            { pending?.length } { i18n._( t`Pending` ) }
                        </div>{ ' ' }
                        <Loader stroke="white" />
                    </div>
                ) : (
                    <div className="mr-1 sm:mr-2 w-10 sm:w-auto overflow-hidden">{ ENSName || shortenAddress( account ) }</div>
                ) }
                { !hasPendingTransactions && connector && <StatusIcon connector={ connector } /> }
            </div>
        )
    } else {
        return <Web3Connect className="text-sm" size='sm' />
    }
}

const Web3Status = () => {
    const { active, account } = useWeb3React()
    const contextNetwork = useWeb3React( NetworkContextName )

    const { ENSName } = useENSName( account ?? undefined )

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo( () => {
        const txs = Object.values( allTransactions )
        return txs.filter( isTransactionRecent ).sort( newTransactionsFirst )
    }, [ allTransactions ] )

    const pending = sortedRecentTransactions.filter( ( tx ) => !tx.receipt ).map( ( tx ) => tx.hash )
    const confirmed = sortedRecentTransactions.filter( ( tx ) => tx.receipt ).map( ( tx ) => tx.hash )

    // if (!contextNetwork.active && !active) {
    //   return null
    // }

    return (
        <>
            <Web3StatusInner />
            <WalletModal ENSName={ ENSName ?? undefined } pendingTransactions={ pending } confirmedTransactions={ confirmed } />
        </>
    )
}

export default Web3Status
