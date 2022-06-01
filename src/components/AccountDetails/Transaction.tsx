import { CheckCircleIcon, ExclamationIcon, XCircleIcon } from '@heroicons/react/outline'
import ExternalLink from '../ExternalLink'
import Loader from '../Loader'
import Typography from '../Typography'
import { classNames, getExplorerLink } from '../../functions'
import React, { FC } from 'react'
import { useActiveWeb3React } from '../../services/web3'
import { useAllTransactions } from '../../state/transactions/hooks'

const Transaction: FC<{ hash: string }> = ( { hash } ) => {
    const { chainId } = useActiveWeb3React()
    const allTransactions = useAllTransactions()

    const tx = allTransactions?.[ hash ]
    const summary = tx?.summary
    const pending = !tx?.receipt
    const success = !pending && tx && ( tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined' )
    const cancelled = tx?.receipt && tx.receipt.status === 1337

    if ( !chainId ) return null

    return (
        <div className="flex flex-col w-full gap-2 px-5 py-3 rounded-md bg-light-secondary dark:bg-dark-secondary transition-all">
            <ExternalLink href={ getExplorerLink( chainId, hash, 'transaction' ) } className="flex items-center space-x-2">
                <Typography variant="sm" className="flex items-center hover:underline py-0.5 font-extrabold">
                    { summary ?? hash } ↗
                </Typography>
                <div
                    className={ classNames(
                        pending
                            ? 'text-primary'
                            : success
                                ? 'text-green-special'
                                : cancelled
                                    ? 'text-pink-special'
                                    : 'text-pink-special'
                    ) }
                >
                    { pending ? (
                        <Loader />
                    ) : success ? (
                        <CheckCircleIcon width={ 16 } height={ 16 } />
                    ) : cancelled ? (
                        <XCircleIcon width={ 16 } height={ 16 } />
                    ) : (
                        <ExclamationIcon width={ 16 } height={ 16 } />
                    ) }
                </div>
            </ExternalLink>
        </div>
    )
}

export default Transaction
