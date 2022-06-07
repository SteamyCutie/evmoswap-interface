import Input from '../Input'
import React from 'react'

interface RemovePercentInputProps {
    value: string
    onUserInput: ( value: string ) => void
    id: string
    className?: string
    inputClassName?: string
    label?: any,
    showPercent?: boolean
}

export default function RemovePercentInput ( { value, onUserInput, id, className = '', label = 'Amount', inputClassName = '', showPercent = true }: RemovePercentInputProps ) {
    return (
        <div id={ id } className={ `p-6 bg-light dark:bg-dark  ${className}` }>
            <div className="flex flex-col gap-3 justify-between space-y-3 sm:space-y-0">
                <div className="w-full text-dark dark:text-light font-medium">
                    { label }
                </div>
                <div className="flex items-center w-full p-3 space-x-3 text-3xl font-medium rounded-md bg-light-secondary dark:bg-dark-secondary">
                    <Input.Percent
                        id="token-amount-input"
                        className={ `text-light-text dark:text-dark-text pl-2 ${inputClassName}` }
                        value={ value }
                        onUserInput={ ( val ) => {
                            onUserInput( val )
                        } }
                    />
                    { showPercent && <div className="text-3xl font-medium">%</div> }
                </div>
            </div>
        </div>
    )
}
