import React from 'react'
import { classNames } from '../../functions'

const SIZE = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-4 py-2 text-base',
  default: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-base',
  none: 'p-0 text-base',
}

const FILLED = {
  default: 'bg-transparent opacity-90 hover:opacity-100',
  red: 'bg-red bg-opacity-90 w-full rounded text-high-emphesis hover:bg-opacity-100 disabled:bg-opacity-90',
  blue: 'bg-blue bg-opacity-90 w-full rounded text-high-emphesis hover:bg-opacity-100 disabled:bg-opacity-90',
  'blue-special': 'bg-blue-special bg-opacity-90 w-full text-light-primary hover:bg-opacity-100 disabled:bg-opacity-90',
  pink: 'bg-gradient-to-r from-pink to-opaque-pink w-full rounded text-high-emphesis opacity-90 hover:opacity-100 disabled:bg-opacity-90',
  gray: 'border rounded shadow-sm focus:ring-2 focus:ring-offset-2 bg-dark-700 bg-opacity-90 w-full text-primary border-dark-900 hover:bg-opacity-100 focus:ring-offset-dark-700 focus:ring-dark-900 disabled:bg-opacity-90',
  green: 'bg-green bg-opacity-90 w-full rounded text-high-emphesis hover:bg-opacity-100 disabled:bg-opacity-90',
  gradient:
    'w-full text-high-emphesis bg-gradient-to-r from-blue-special to-pink-special opacity-90 hover:opacity-100 disabled:bg-opacity-90',
}

const OUTLINED = {
  default: 'bg-transparent opacity-90 hover:opacity-100',
  red: 'bg-red bg-opacity-20 outline-red rounded text-red hover:bg-opacity-40 disabled:bg-opacity-20',
  blue: 'bg-blue bg-opacity-20 outline-blue rounded text-blue hover:bg-opacity-40 disabled:bg-opacity-20',
  'blue-special':
    'bg-blue-special bg-opacity-20 outline-blue-special rounded text-blue-special hover:bg-opacity-40 disabled:bg-opacity-20',
  pink: 'bg-pink bg-opacity-20 outline-pink rounded text-pink hover:bg-opacity-40 disabled:bg-opacity-20',
  gray: 'bg-dark-700 bg-opacity-20 outline-gray rounded text-gray hover:bg-opacity-40 disabled:bg-opacity-20',
  green: 'bg-green bg-opacity-20 border border-green rounded text-green hover:bg-opacity-40 disabled:bg-opacity-20',
  gradient:
    'border border-transparent border-gradient-r-blue-red-dark-900 opacity-90 hover:opacity-100 disabled:bg-opacity-20',
}

const EMPTY = {
  default:
    'flex bg-transparent justify-center items-center disabled:opacity-50 disabled:cursor-auto bg-opacity-90 hover:bg-opacity-100',
}

const LINK = {
  default: 'text-primary hover:text-high-emphesis focus:text-high-emphesis whitespace-nowrap focus:ring-0',
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
  ({ children, className = '', color = 'default', size = 'default', variant = 'filled', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          VARIANT[variant][color],
          variant !== 'empty' && SIZE[size],
          'rounded disabled:cursor-not-allowed focus:outline-none transition-all',
          // 'rounded focus:outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed font-medium',
          className
        )}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

export default Button

export const ButtonConfirmed = ({
  confirmed,
  disabled,
  ...rest
}: { confirmed?: boolean; disabled?: boolean } & ButtonProps) => {
  if (confirmed) {
    return (
      <Button
        variant="outlined"
        color="green"
        size="lg"
        className={classNames(disabled && 'cursor-not-allowed', 'border opacity-50')}
        disabled={disabled}
        {...rest}
      />
    )
  } else {
    return <Button color={disabled ? 'gray' : 'blue'} size="lg" disabled={disabled} {...rest} />
  }
}

export const ButtonError = ({
  error,
  disabled,
  ...rest
}: {
  error?: boolean
  disabled?: boolean
} & ButtonProps) => {
  if (error) {
    return <Button color="red" size="lg" disabled={disabled} {...rest} />
  } else {
    return <Button color={disabled ? 'gray' : 'blue'} disabled={disabled} size="lg" {...rest} />
  }
}
