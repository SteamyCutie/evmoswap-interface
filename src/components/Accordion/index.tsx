import { ChevronUpIcon } from '@heroicons/react/solid'
import { classNames } from 'app/functions'
import React, { useState } from 'react'

function Accordion ( {
    header,
    toggle = '',
    showIcon = true,
    children,
    className = '',
}: { header: any; toggle?: any; showIcon?: boolean } & React.HTMLAttributes<HTMLDivElement> ): JSX.Element {
    const [ isActive, setIsActive ] = useState( false )

    return (
        <React.Fragment>
            <button className={ classNames( 'accordion-item', className ) } onClick={ () => setIsActive( !isActive ) }>
                <div>{ header }</div>
                <div className="flex items-center space-x-4 font-medium">
                    { toggle }
                    { showIcon && (
                        <ChevronUpIcon
                            width={ 16 }
                            height={ 16 }
                            className="transition-all"
                            style={ { transform: `rotate(${isActive ? '0deg' : '180deg'})` } }
                        />
                    ) }
                </div>
            </button>
            { isActive && <div className="accordion-content">{ children }</div> }
        </React.Fragment>
    )
}

export default Accordion
