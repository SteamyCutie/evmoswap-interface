import { AlertTriangle } from 'react-feather'
import { ChainId, Currency } from '@evmoswap/core-sdk'
import React, { FC } from 'react'
import { Trans, t } from '@lingui/macro'

import Button from '../../components/Button'
import CloseIcon from '../../components/CloseIcon'
import ExternalLink from '../../components/ExternalLink'
import Image from '../../components/Image'
import Lottie from 'lottie-react'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import { RowFixed } from '../../components/Row'
import { getExplorerLink } from '../../functions/explorer'
import loadingRollingCircleDark from '../../animation/loading-rolling-circle-dark.json'
import loadingRollingCircleLight from '../../animation/loading-rolling-circle-light.json'
import { useActiveWeb3React } from '../../services/web3'
import useAddTokenToMetaMask from '../../hooks/useAddTokenToMetaMask'
import { useLingui } from '@lingui/react'
import { CheckIcon } from '@heroicons/react/outline'

interface ConfirmationPendingContentProps {
    onDismiss: () => void
    pendingText: string
}

export const ConfirmationPendingContent: FC<ConfirmationPendingContentProps> = ( { onDismiss, pendingText } ) => {
    const { i18n } = useLingui()
    return (
        <div>
            <div className="flex justify-end">
                <CloseIcon onClick={ onDismiss } />
            </div>
            <div className="w-24 pb-4 m-auto">
                <Lottie animationData={ loadingRollingCircleLight } className="flex dark:hidden" autoplay loop />
                <Lottie animationData={ loadingRollingCircleDark } className="hidden dark:flex" autoplay loop />
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-md font-medium text-dark dark:text-light">{ i18n._( t`Waiting for Confirmation` ) }</div>
                <div className="text-xl font-semibold mt-2 mb-4">{ pendingText }</div>
                <div className="text-sm font-medim text-light-text dark:text-dark-text">{ i18n._( t`Confirm this transaction in your wallet` ) }</div>
            </div>
        </div>
    )
}

interface TransactionSubmittedContentProps {
    onDismiss: () => void
    hash: string | undefined
    chainId: ChainId
    currencyToAdd?: Currency | undefined
    inline?: boolean // not in modal
}

export const TransactionSubmittedContent: FC<TransactionSubmittedContentProps> = ( {
    onDismiss,
    chainId,
    hash,
    currencyToAdd,
} ) => {
    const { i18n } = useLingui()
    const { library } = useActiveWeb3React()
    const { addToken, success } = useAddTokenToMetaMask( currencyToAdd )
    return (
        <div>
            <div className="flex justify-end">
                <CloseIcon onClick={ onDismiss } />
            </div>
            <div className="w-24 pb-4 m-auto mb-8">
                <CheckIcon
                    strokeWidth={ 2 }
                    width={ 65 }
                    height={ 65 }
                    className="p-4 border-2 text-green-special border-green-special rounded-2.5xl"
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xl font-semibold text-dark dark:text-light">{ i18n._( t`Transaction Submitted` ) }</div>
                { chainId && hash && (
                    <ExternalLink href={ getExplorerLink( chainId, hash, 'transaction' ) }>
                        <div className="font-medium text-md text-blue my-2">View on explorer</div>
                    </ExternalLink>
                ) }
                { currencyToAdd && library?.provider?.isMetaMask && (
                    <Button size='default' color="gradient" onClick={ addToken } className="w-auto px-8 mt-4 font-extrabold !w-full">
                        { !success ? (
                            <RowFixed className="mx-auto space-x-2 items-center text-sm font-bold">
                                <span>{ i18n._( t`Add ${currencyToAdd.symbol} to MetaMask` ) }</span>
                                {/*<Image
                                    src="/images/wallets/metamask.png"
                                    alt={ i18n._( t`Add ${currencyToAdd.symbol} to MetaMask` ) }
                                    width={ 18 }
                                    height={ 18 }
                                    className="ml-1 rounded-none"
                        />*/}
                            </RowFixed>
                        ) : (
                            <RowFixed>
                                { currencyToAdd.symbol } { i18n._( t`added` ) }
                                {/* <CheckCircle className="ml-1.5 text-2xl text-green" size="16px" /> */ }
                            </RowFixed>
                        ) }
                    </Button>
                ) }
                {/* <Button color="gradient" className="font-extrabold" onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
          Close
        </Button> */}
            </div>
        </div>
    )
}

interface ConfirmationModelContentProps {
    title: string
    onDismiss: () => void
    topContent: () => React.ReactNode
    bottomContent: () => React.ReactNode
}

export const ConfirmationModalContent: FC<ConfirmationModelContentProps> = ( {
    title,
    bottomContent,
    onDismiss,
    topContent,
} ) => {
    return (
        <div className="grid gap-2">
            <ModalHeader title={ title } onClose={ onDismiss } />
            { topContent() }
            { bottomContent() }
        </div>
    )
}

interface TransactionErrorContentProps {
    message: string
    onDismiss: () => void
}

export const TransactionErrorContent: FC<TransactionErrorContentProps> = ( { message, onDismiss } ) => {
    const { i18n } = useLingui()

    return (
        <div className="grid gap-6">
            <div>
                <div className="flex justify-end">
                    <CloseIcon onClick={ onDismiss } />
                </div>
                <div className="w-24 pb-4 m-auto mb-8">
                    <CloseIcon
                        strokeWidth={ 2 }
                        width={ 65 }
                        height={ 65 }
                        className="p-4 border-2 text-red border-red rounded-2.5xl"
                    />
                </div>
                <div className="flex flex-col items-center justify-center gap-3">

                    <div className="text-xl font-semibold text-dark dark:text-light">{ message }</div>
                </div>
            </div>
            <div>
                <Button color="gradient" variant='outlined' size="default" className="font-bold w-full text-sm mt-4" onClick={ onDismiss }>
                    { i18n._( t`Back` ) }
                </Button>
            </div>
        </div>
    )
}

interface ConfirmationModalProps {
    isOpen: boolean
    onDismiss: () => void
    hash: string | undefined
    content: () => React.ReactNode
    attemptingTxn: boolean
    pendingText: string
    currencyToAdd?: Currency | undefined,
    className?: string
}

const TransactionConfirmationModal: FC<ConfirmationModalProps> = ( {
    isOpen,
    onDismiss,
    attemptingTxn,
    hash,
    pendingText,
    content,
    currencyToAdd,
    className,
} ) => {
    const { chainId } = useActiveWeb3React()

    if ( !chainId ) return null

    // confirmation screen
    return (
        <Modal isOpen={ isOpen } onDismiss={ onDismiss } maxHeight={ 90 } className={ `md:-mt-32 ${hash ? '' : ''} ${className}` }>
            { attemptingTxn ? (
                <div className="mb-2">
                    <ConfirmationPendingContent onDismiss={ onDismiss } pendingText={ pendingText } />
                </div>
            ) : hash ? (
                <div className="mb-2">
                    <TransactionSubmittedContent
                        chainId={ chainId }
                        hash={ hash }
                        onDismiss={ onDismiss }
                        currencyToAdd={ currencyToAdd }
                    />
                </div>
            ) : (
                content()
            ) }
        </Modal>
    )
}

export default TransactionConfirmationModal
