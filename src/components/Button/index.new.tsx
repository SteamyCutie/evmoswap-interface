import { classNames } from 'app/functions'
import React, { FC, ReactNode } from 'react'

import Dots from '../Dots'
import Loader from '../Loader'

export type ButtonColor = 'red' | 'blue' | 'pink' | 'purple' | 'gradient' | 'gray' | 'green'
export type ButtonSize = 'xs' | 'sm' | 'lg' | 'default' | 'none'
export type ButtonVariant = 'outlined' | 'filled' | 'empty' | 'link'

const DIMENSIONS = {
    xs: 'px-2 h-[28px] !border',
    sm: 'px-3 h-[40px]',
    md: 'px-4 h-[50px]',
    lg: 'px-6 h-[60px]',
}

const SIZE = {
    xs: 'text-xs rounded',
    sm: 'text-sm rounded',
    md: 'rounded',
    lg: 'text-lg rounded',
}

const FILLED = {
    default: 'bg-transparent opacity-90 hover:opacity-100',
    red: 'bg-red bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    blue: 'bg-blue bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    'blue-special': 'bg-blue-special bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    pink: 'bg-gradient-to-r from-pink to-pink w-full text-light-primary opacity-90 hover:opacity-100 disabled:bg-opacity-90',
    gray: 'shadow-sm focus:ring-2 focus:ring-offset-2 bg-opacity-90 w-full bg-grey-light dark:bg-light-text text-light hover:bg-opacity-100 focus:ring-offset-dark-700 focus:ring-dark-900 disabled:bg-opacity-90',
    green: 'bg-green bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
    gradient:
        'w-full text-light-primary bg-gradient-to-r from-blue-light to-pink-light opacity-100 hover:opacity-80 disabled:bg-opacity-80',
}

const OUTLINED = {
    default: 'bg-transparent opacity-90 hover:opacity-100',
    red: 'border border-red bg-opacity-40 outline-red text-red opacity-100 hover:opacity-60 disabled:opacity-40 transition-all',
    blue: 'bg-transparent outline-blue border border-blue text-blue',
    pink: 'bg-pink bg-opacity-20 outline-pink text-pink hover:bg-opacity-40 disabled:bg-opacity-20',
    gray: 'bg-transparent border border-light-text/40 dark:border-dark-text/40 text-light-text/40 dark:text-dark-text/40 rounded-xl',
    green:
        'bg-transparent border border-green-special/80 text-green-special hover:border-green-specical disabled:border-green-special/80',
    gradient:
        'border border-transparent border-gradient-r-blue-pink-special-light-primary dark:border-gradient-r-blue-pink-special-dark-primary opacity-100 hover:opacity-60 disabled:bg-opacity-20 text-blue-special transition-all',
}

const EMPTY = {
    default:
        'flex bg-transparent justify-center items-center disabled:opacity-50 disabled:cursor-auto bg-opacity-80 hover:bg-opacity-100',
    // blue: 'text-blue',
    // red: 'text-red',
    // pink: 'text-pink',
    // purple: 'text-purple',
    // gray: 'text-higher-emphesis',
    // gradient:
    //   '!bg-gradient-to-r from-blue to-pink-600 hover:from-blue/80 hover:to-pink-600/80 focus:from-blue/80 focus:to-pink-600/80 active:from-blue/70 active:to-pink-600/70',
}

const LINK = {
    default: 'text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap focus:ring-0',
    blue: 'text-blue text-opacity-80 hover:text-opacity-100 focus:text-opacity-100 whitespace-nowrap focus:ring-0',
}

const VARIANT = {
    outlined: OUTLINED,
    filled: FILLED,
    empty: EMPTY,
    link: LINK,
}

type Button = React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> & {
    Dotted: FC<DottedButtonProps>
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    startIcon?: ReactNode
    endIcon?: ReactNode
    color?: ButtonColor
    size?: ButtonSize
    variant?: ButtonVariant
    fullWidth?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className = '',
            color = 'blue',
            size = 'md',
            variant = 'filled',
            startIcon = undefined,
            endIcon = undefined,
            fullWidth = false,
            loading,
            ...rest
        },
        ref
    ) => {
        return (
            <button
                ref={ ref }
                className={ classNames(
                    // @ts-ignore TYPE NEEDS FIXING
                    VARIANT[ variant ][ color ?? 'default' ],
                    // @ts-ignore TYPE NEEDS FIXING
                    SIZE[ size ],
                    // @ts-ignore TYPE NEEDS FIXING
                    variant !== 'empty' ? DIMENSIONS[ size ] : '',
                    fullWidth ? 'w-full' : '',
                    'font-bold flex items-center justify-center gap-1',
                    className
                ) }
                { ...rest }
            >
                { loading ? (
                    <Loader stroke="currentColor" />
                ) : (
                    <>
                        { startIcon && startIcon }
                        { children }
                        { endIcon && endIcon }
                    </>
                ) }
            </button>
        )
    }
)

export function ButtonConfirmed ( {
    confirmed,
    disabled,
    ...rest
}: { confirmed?: boolean; disabled?: boolean } & ButtonProps ) {
    if ( confirmed ) {
        return (
            <Button
                variant="outlined"
                color="green"
                size="lg"
                className={ classNames( disabled && 'cursor-not-allowed', 'border opacity-50' ) }
                disabled={ disabled }
                { ...rest }
            />
        )
    } else {
        return <Button color={ disabled ? 'gray' : 'blue' } size="lg" disabled={ disabled } { ...rest } />
    }
}

export function ButtonError ( {
    error,
    disabled,
    ...rest
}: {
    error?: boolean
    disabled?: boolean
} & ButtonProps ) {
    if ( error ) {
        return <Button color="red" size="lg" disabled={ disabled } { ...rest } />
    } else {
        return <Button color="gradient" disabled={ disabled } size="lg" { ...rest } />
    }
}

interface DottedButtonProps extends ButtonProps {
    pending: boolean
}

export const ButtonDotted: FC<DottedButtonProps> = ( { pending, children, ...rest } ) => {
    const buttonText = pending ? <Dots>{ children }</Dots> : children
    return (
        <Button { ...rest } { ...( pending && { disabled: true } ) }>
            { buttonText }
        </Button>
    )
}

export default Button
