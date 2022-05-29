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
  gray: 'rounded shadow-sm focus:ring-2 focus:ring-offset-2 bg-opacity-90 w-full bg-light-border dark:bg-[#4B4B4B] text-dark-primary dark:text-light-primary hover:bg-opacity-100 focus:ring-offset-dark-700 focus:ring-dark-900 disabled:bg-opacity-90',
  green: 'bg-green bg-opacity-90 w-full rounded text-high-emphesis hover:bg-opacity-100 disabled:bg-opacity-90',
  gradient:
    'w-full text-high-emphesis bg-gradient-to-r from-blue-special to-pink-special opacity-90 hover:opacity-100 disabled:bg-opacity-90',
}

const OUTLINED = {
  default: 'bg-transparent opacity-90 hover:opacity-100',
  red: 'bg-red bg-opacity-40 outline-red rounded text-light-primary hover:bg-opacity-80 disabled:bg-opacity-40 transition-all',
  blue: 'bg-blue bg-opacity-20 outline-blue rounded text-blue hover:bg-opacity-40 disabled:bg-opacity-20',
  'blue-special':
    'bg-blue-special bg-opacity-20 outline-blue-special rounded text-blue-special hover:bg-opacity-40 disabled:bg-opacity-20',
  pink: 'bg-pink bg-opacity-20 outline-pink rounded text-pink hover:bg-opacity-40 disabled:bg-opacity-20',
  gray: 'bg-transparent border border-light-border dark:border-dark-border rounded text-gray hover:bg-opacity-40 disabled:bg-opacity-20',
  green:
    'bg-transparent border border-green-special/80 rounded text-green-special hover:border-green-specical disabled:border-green-special/80',
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
    return <Button color={disabled ? 'gray' : 'gradient'} size="lg" disabled={disabled} {...rest} />
  }
}

export const ButtonError = ({
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
} & ButtonProps) => {
  if (error) {
    return <Button variant={variant} color="red" size="lg" disabled={disabled} {...rest} />
  } else {
    return (
      <Button
        variant={variant}
        color={disabled ? 'gray' : color ? color : 'gradient'}
        disabled={disabled}
        size="lg"
        {...rest}
      />
    )
  }
}
