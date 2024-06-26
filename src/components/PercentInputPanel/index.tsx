import Input from '../Input'
import React from 'react'

interface PercentInputPanelProps {
    value: string
    onUserInput: ( value: string ) => void
    id: string
    className?: string
}

export default function PercentInputPanel ( { value, onUserInput, id, className }: PercentInputPanelProps ) {
    return (
        <div
            id={ id }
            className={ `p-5 rounded-2xl text-dark-primary dark:text-light-primary bg-light-primary dark:bg-dark-primary transition-all ${className ?? ''}` }
        >
            <div className="grid gap-3">
                <div className="w-full text-base">Your rewards</div>
                <div className="flex items-center justify-between px-4 py-3 text-xl font-bold rounded bg-light-secondary dark:bg-dark-secondary transition-all">
                    <Input.Percent
                        className="token-amount-input"
                        value={ value }
                        onUserInput={ ( val ) => {
                            onUserInput( val )
                        } }
                    />
                    <div className="pl-2 text-xl">%</div>
                </div>
            </div>
        </div>
    )
}
