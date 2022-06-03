import React from 'react'
import { classNames } from '../../functions'

const SIZE = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-4 py-2 text-sm',
    default: 'px-4 py-3 text-base',
    lg: 'px-7 py-5 text-base',
    none: 'p-0 text-base',
}

const FILLED = {
    default: 'bg-transparent opacity-90 hover:opacity-100',
    red: 'bg-red bg-opacity-90 w-full rounded-md text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    blue: 'bg-blue bg-opacity-90 w-full rounded-md text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    'blue-special': 'bg-blue-special bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    pink: 'bg-gradient-to-r from-pink to-pink w-full rounded-md text-light-primary opacity-90 hover:opacity-100 disabled:bg-opacity-90',
    gray: 'rounded-xl shadow-sm focus:ring-2 focus:ring-offset-2 bg-opacity-90 w-full bg-grey-light dark:bg-light-text text-light hover:bg-opacity-100 focus:ring-offset-dark-700 focus:ring-dark-900 disabled:bg-opacity-90',
    green: 'bg-green bg-opacity-90 w-full rounded-md text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    gradient:
        'w-full text-light-primary bg-gradient-to-r from-blue-special to-pink-special opacity-100 hover:opacity-80 disabled:bg-opacity-80',
}

const OUTLINED = {
    default: 'bg-transparent opacity-90 hover:opacity-100',
    red: 'border border-red bg-opacity-40 outline-red rounded-md text-red opacity-100 hover:opacity-60 disabled:opacity-40 transition-all',
    blue: 'bg-transparent outline-blue border border-blue rounded-md text-blue',
    pink: 'bg-pink bg-opacity-20 outline-pink rounded-md text-pink hover:bg-opacity-40 disabled:bg-opacity-20',
    gray: 'bg-transparent border border-light-text dark:border-dark-text text-light-text dark:text-dark-text rounded-md',
    green:
        'bg-transparent border border-green-special/80 rounded-md text-green-special hover:border-green-specical disabled:border-green-special/80',
    gradient:
        'border border-transparent border-gradient-r-blue-pink-special-light-primary dark:border-gradient-r-blue-pink-special-dark-primary opacity-100 hover:opacity-60 disabled:bg-opacity-20 text-blue-special transition-all',
}

const EMPTY = {
    default:
        'flex bg-transparent justify-center items-center disabled:opacity-50 disabled:cursor-auto bg-opacity-90 hover:bg-opacity-100',
}

const LINK = {
    default: 'text-primary hover:text-light-primary focus:text-light-primary whitespace-nowrap focus:ring-0',
    blue: 'text-blue text-opacity-90 hover:text-opacity-100 focus:text-opacity-100 whitespace-nowrap focus:ring-0',
}

const VARIANT = {
    outlined: OUTLINED,
    filled: FILLED,
    empty: EMPTY,
    link: LINK,
}

export type ButtonColor = 'blue' | 'blue-special' | 'pink' | 'gradient' | 'gray' | 'default' | 'red' | 'green'

export type ButtonSize = 'xs' | 'sm' | 'lg' | 'default' | 'none'

export type ButtonVariant = 'outlined' | 'filled' | 'empty' | 'link'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    color?: ButtonColor
    size?: ButtonSize
    variant?: ButtonVariant
    ref?: React.Ref<HTMLButtonElement>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ( { children, className = '', color = 'default', size = 'default', variant = 'filled', ...rest }, ref ) => {
        return (
            <button
                ref={ ref }
                className={ classNames(
                    VARIANT[ variant ][ color ],
                    variant !== 'empty' && SIZE[ size ],
                    'rounded-md disabled:cursor-not-allowed focus:outline-none transition-all font-bold',
                    // 'rounded-md focus:outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed font-medium',
                    className
                ) }
                { ...rest }
            >
                { children }
            </button>
        )
    }
)

export default Button

export const ButtonConfirmed = ( {
    confirmed,
    disabled,
    ...rest
}: { confirmed?: boolean; disabled?: boolean } & ButtonProps ) => {
    if ( confirmed ) {
        return (
            <Button
                variant="outlined"
                color="green"
                size="lg"
                className={ classNames( disabled && 'cursor-not-allowed' ) }
                disabled={ disabled }
                { ...rest }
            />
        )
    } else {
        return <Button color={ disabled ? 'gray' : 'gradient' } variant="outlined" size="lg" disabled={ disabled } { ...rest } />
    }
}

export const ButtonError = ( {
    variant,
    color,
    error,
    disabled,
    ...rest
}: {
    variant?: string
    color?: string
    error?: boolean
    disabled?: boolean
} & ButtonProps ) => {
    if ( error ) {
        return <Button variant={ variant } color="red" size="lg" disabled={ disabled } { ...rest } />
    } else {
        return (
            <Button
                variant={ variant }
                color={ disabled ? 'gray' : color ? color : 'gradient' }
                disabled={ disabled }
                size="lg"
                { ...rest }
            />
        )
    }
}
