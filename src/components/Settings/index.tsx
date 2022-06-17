import { Percent } from '@evmoswap/core-sdk'
import React, { useRef, useState } from 'react'
import { useExpertModeManager, useUserSingleHopOnly } from '../../state/user/hooks'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'

import { ApplicationModal } from '../../state/application/actions'
import Button from '../Button'
import ModalHeader from '../ModalHeader'
import QuestionHelper from '../QuestionHelper'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'
import Typography from '../Typography'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { CogIcon } from '../Icon'
import { Divider } from '../Divider/Divider'
import CloseIcon from '../CloseIcon'
import HeadlessUiModal from '../Modal/HeadlessUIModal'

export default function SettingsTab ( {
    placeholderSlippage,
    direction = 'right',
}: {
    placeholderSlippage?: Percent
    direction?: string
    disableOutsideClick?: boolean
    externalControl?: {
        open: boolean
        toggle: () => any
    }
} ) {

    const node = useRef<HTMLDivElement>( null )
    const open = useModalOpen( ApplicationModal.SETTINGS )
    const toggle = useToggleSettingsMenu()

    useOnClickOutside( node, open ? toggle : undefined )

    return (
        <div className="relative flex" ref={ node }>
            <div
                className="flex items-center justify-end w-8 h-8 rounded cursor-pointer text-dark-primary hover:text-dark-primary/80 active:text-dark-primary dark:text-light-primary dark:hover:text-light-primary/80 dark:active:text-light-primary/80 transition-all"
                onClick={ toggle }
                id="open-settings-dialog-button"
            >
                <CogIcon className="w-[20px] h-[20px] transform rotate-90" />
            </div>

            <SettingsTabContent
                placeholderSlippage={ placeholderSlippage }
                direction={ direction }
                toggle={ toggle }
                open={ open }
            />

        </div>
    )
}

/**
 * 
 * use this for case where the setting panel is in another modal 
 * or when there is unpreventable rerendering that could malformed outsideclick hook
 */
export function SettingsTabControlled ( {
    placeholderSlippage,
    direction = 'right',
    isOpened,
    toggle,
    className
}: {
    placeholderSlippage?: Percent
    direction?: string
    isOpened: boolean
    toggle: () => any
    className?: string
} ) {

    return (
        <>
            {/** simulate outside click */ }
            <div className={ `inset-0 bg-transparent z-[1] ${isOpened ? '' : 'hidden'}` } onClick={ toggle }></div>

            {/** main content */ }
            <div className="relative flex z-10">
                <div
                    className="flex items-center justify-end w-8 h-8 rounded cursor-pointer text-dark-primary hover:text-dark-primary/80 active:text-dark-primary dark:text-light-primary dark:hover:text-light-primary/80 dark:active:text-light-primary/80 transition-all"
                    onClick={ toggle }
                    id="open-settings-dialog-button-controlled"
                >
                    { isOpened && <CloseIcon className="w-[20px] h-[20px] transform rotate-90" /> }
                    { !isOpened && <CogIcon className="w-[20px] h-[20px] transform rotate-90" /> }
                </div>


                <SettingsTabContent
                    placeholderSlippage={ placeholderSlippage }
                    direction={ direction }
                    toggle={ toggle }
                    className={ className }
                    open={ isOpened }
                    disableBackdrop={ true }
                />
            </div>
        </>
    )
}


export function SettingsTabContent ( {
    placeholderSlippage,
    direction = 'right',
    toggle,
    open,
    className = '',
    disableBackdrop = false
}: {
    placeholderSlippage?: Percent
    direction?: string
    toggle: () => any
    open: boolean
    className?: string
    disableBackdrop?: boolean
} ) {
    const { i18n } = useLingui()

    const [ expertMode, toggleExpertMode ] = useExpertModeManager()

    const [ singleHopOnly, setSingleHopOnly ] = useUserSingleHopOnly()

    // show confirmation view before turning on
    const [ showConfirmation, setShowConfirmation ] = useState( false )

    const directions = {
        right: 'md:left-0',
        left: '',
    }

    return (
        <>
            { open && <div
                className={ `${directions?.[ direction ]} ${className} absolute z-50 -mr-3 md:ml-0 md:-mr-5 min-w-20 md:m-w-22 right-2 bg-white dark:bg-dark-primary border-2 border-light-stroke dark:border-dark-stroke rounded-xl w-[250px] shadow-lg` }
            >
                <div className="p-4 space-y-2">
                    <Typography className="text-dark-primary dark:text-light-primary pb-1 font-semibold transition-all">
                        { i18n._( t`Transaction Settings` ) }
                    </Typography>
                    <Divider />

                    <TransactionSettings placeholderSlippage={ placeholderSlippage } />

                    <Typography className="text-dark-primary dark:text-light-primary pb-1 font-semibold transition-all pt-6">
                        { i18n._( t`Interface Settings` ) }
                    </Typography>
                    <Divider />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center w-[70%]">
                            <Typography variant="xs" className="text-dark-primary dark:text-light-primary transition-all">
                                { i18n._( t`Toggle Expert Mode` ) }
                            </Typography>
                            <QuestionHelper
                                text={ i18n._( t`Bypasses confirmation modals and allows high slippage trades. Use at your own risk.` ) }
                            />
                        </div>
                        <div className='w-[26%]'>
                            <Toggle
                                id="toggle-expert-mode-button"
                                isActive={ expertMode }
                                toggle={
                                    expertMode
                                        ? () => {
                                            toggleExpertMode()
                                            setShowConfirmation( false )
                                        }
                                        : () => {
                                            toggle()
                                            setShowConfirmation( true )
                                        }
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center w-[70%]">
                            <Typography variant="xs" className="text-dark-primary dark:text-light-primary transition-all">
                                { i18n._( t`Disable Multihops` ) }
                            </Typography>
                            <QuestionHelper text={ i18n._( t`Restricts swaps to direct pairs only.` ) } />
                        </div>
                        <div className='w-[26%]'>
                            <Toggle
                                id="toggle-disable-multihop-button"
                                isActive={ singleHopOnly }
                                toggle={ () => ( singleHopOnly ? setSingleHopOnly( false ) : setSingleHopOnly( true ) ) }
                            />
                        </div>
                    </div>
                </div>
            </div> }

            <HeadlessUiModal.Controlled isOpen={ showConfirmation } onDismiss={ () => setShowConfirmation( false ) } afterLeave={ () => setShowConfirmation( false ) } disableBackdrop={ disableBackdrop }>
                <div className="space-y-4">
                    <ModalHeader title={ i18n._( t`Are you sure?` ) } onClose={ () => setShowConfirmation( false ) } />
                    <Typography variant="base">
                        { i18n._( t`Expert mode turns off the confirm transaction prompt and allows high slippage trades
                                that often result in bad rates and lost funds.`) }
                    </Typography>
                    <Typography variant="sm" className="font-medium">
                        { i18n._( t`ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.` ) }
                    </Typography>
                    <Button
                        color="red"
                        size="lg"
                        onClick={ () => {
                            // if (window.prompt(i18n._(t`Please type the word "confirm" to enable expert mode.`)) === 'confirm') {
                            //   toggleExpertMode()
                            //   setShowConfirmation(false)
                            // }
                            toggleExpertMode()
                            setShowConfirmation( false )
                        } }
                    >
                        <Typography variant="sm" id="confirm-expert-mode">
                            { i18n._( t`Turn On Expert Mode` ) }
                        </Typography>
                    </Button>
                </div>
            </HeadlessUiModal.Controlled>
        </>
    )
}
