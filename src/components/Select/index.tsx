import React, { FC, MouseEvent, useRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import useToggle from '../../hooks/useToggle'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

interface NeonSelectProps {
    value
    children: React.ReactElement<NeonSelectItemProps> | React.ReactElement<NeonSelectItemProps>[]
}

const NeonSelect: FC<NeonSelectProps> = ( { value, children } ) => {
    const [ open, toggle ] = useToggle( false )
    const node = useRef<HTMLDivElement>()
    useOnClickOutside( node, open ? toggle : undefined )

    return (
        <div className="relative" ref={ node } onClick={ toggle }>
            <div className="z-[2] relative flex bg-light-secondary dark:bg-dark-secondary transition-all px-3 h-9 rounded-lg">
                <div className="text-sm flex items-center min-w-[80px] font-bold">{ value }</div>
                <div className="flex items-center justify-start font-bold">
                    <ChevronDownIcon width={ 16 } height={ 16 } strokeWidth={ 2 } />
                </div>
            </div>
            <div
                className={ `z-[1] w-full absolute top-0 pt-10 py-1.5 ${open ? 'flex flex-col' : 'hidden'
                    } bg-light-secondary dark:bg-dark-secondary opacity-90 transition-all rounded-lg` }
            >
                { children }
            </div>
        </div>
    )
}

interface NeonSelectItemProps {
    onClick: ( e: MouseEvent<HTMLDivElement>, idx: number | string ) => void
    value: number | string
}

export const NeonSelectItem: FC<NeonSelectItemProps> = ( { onClick, value, children } ) => {
    return (
        <div
            onClick={ ( e ) => onClick( e, value ) }
            className="text-dark-primary dark:text-light-primary transition-all flex w-full cursor-pointer hover:opacity-60 px-3 py-1.5 text-sm"
        >
            { children }
        </div>
    )
}

export default NeonSelect
