import React from 'react'
import { classNames } from '../../functions'

export type TypographyWeight = 400 | 500 | 600 | 700

const WEIGHTS = {
    400: 'font-normal',
    500: 'font-medium',
    600: 'font-semibold',
    700: 'font-bold',
}

export type TypographyVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'lg' | 'base' | 'sm' | 'xs' | 'xxs'

const VARIANTS = {
    hero: 'text-hero',
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl',
    lg: 'text-lg',
    base: 'text-base',
    sm: 'text-sm',
    xs: 'text-sm',
    xxs: 'text-[0.625rem] leading-[1.2]',
}

export interface TypographyProps {
    variant?: TypographyVariant
    weight?: TypographyWeight
    component?: keyof React.ReactHTML
    className?: string
    clickable?: boolean
}

function Typography ( {
    variant = 'base',
    weight = 400,
    component = 'div',
    className = 'currentColor',
    clickable = false,
    children = [],
    onClick = undefined,
    ...rest
}: React.HTMLAttributes<React.ReactHTML> & TypographyProps ): JSX.Element {
    return React.createElement(
        component,
        {
            className: classNames( VARIANTS[ variant ], WEIGHTS[ weight ], onClick ? 'cursor-pointer select-none' : '', className ),
            onClick,
            ...rest,
        },
        children
    )
}

export default Typography
