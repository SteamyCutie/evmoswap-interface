import { ChevronLeftIcon, XIcon } from '@heroicons/react/outline'

import React, { FC } from 'react'
import { Divider } from '../Divider/Divider'
import Typography from '../Typography'

interface ModalHeaderProps {
    title?: string
    className?: string
    onClose?: () => void
    onBack?: () => void
}

const ModalHeader: FC<ModalHeaderProps> = ( {
    title = undefined,
    onClose = undefined,
    className = '',
    onBack = undefined,
} ) => {
    return (
        <>
            <div
                className={ `flex items-center justify-between pb-2 ${className}` }
            >
                { onBack && <ChevronLeftIcon onClick={ onBack } width={ 24 } height={ 24 } className="cursor-pointer" /> }
                { title && <div className="text-lg font-semibold">{ title }</div> }
                <div
                    className="flex items-center justify-center transition-all cursor-pointer text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80"
                    onClick={ onClose }
                >
                    <XIcon width={ 24 } height={ 24 } />
                </div>
            </div>
            <Divider className='mb-4' />
        </>
    )
}

export default ModalHeader
