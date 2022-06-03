import { Dialog, Transition } from '@headlessui/react'
import { classNames } from 'app/functions'
import React, { Fragment, useEffect } from 'react'
import { isMobile } from 'react-device-detect'

interface ModalProps {
    isOpen: boolean
    onDismiss: () => void
    minHeight?: number
    maxHeight?: number
    initialFocusRef?: React.RefObject<any>
    children?: React.ReactNode
    padding?: number
    maxWidth?: number
    className?: string
}

export default function Modal ( {
    isOpen,
    onDismiss,
    minHeight = 0,
    maxHeight = 90,
    initialFocusRef,
    children,
    padding = 5,
    maxWidth = 500,
    className = '',
}: ModalProps ) {

    //@TODO: reverse this and add  backdrop-blur-md to Dialog and Dialog.Overlay when 'backdrop-filter' is widely supported.
    useEffect( () => {
        if ( isOpen )
            document.documentElement.classList.add( 'modal-open' )
        else
            document.documentElement.classList.remove( 'modal-open' )
    }, [ isOpen ] )
    return (
        <>
            <Transition appear show={ isOpen } as={ Fragment }>
                <Dialog as="div" onClose={ onDismiss } className="fixed inset-0 z-10 overflow-y-hidden">
                    <Dialog.Overlay className="fixed inset-0 bg-light dark:bg-dark opacity-20" />
                    <div className="flex items-center justify-center h-screen px-4">
                        <Transition.Child
                            as={ Fragment }
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div
                                className="transition-all transform"
                                style={ {
                                    width: isMobile ? `100%` : '90vw',
                                    maxWidth: `${maxWidth}px`,
                                } }
                            >
                                {/* <div className="w-full p-px rounded bg-gradient-to-r from-blue to-red"> */ }
                                <div className={ classNames(
                                    "w-full p-px rounded-2.5xl bg-light-primary dark:bg-dark-primary border-2 border-light-stroke dark:border-dark-stroke transition-all",
                                    className ?? '',
                                ) }
                                >
                                    <div className="flex flex-col w-full h-full p-6 overflow-y-hidden rounded-2.5xl bg-light-primary dark:bg-dark-primary text-dark-primary dark:text-light-primary transition-all">
                                        <div style={ { minHeight: `${minHeight}vh`, maxHeight: `${maxHeight}vh` } }>{ children }</div>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
