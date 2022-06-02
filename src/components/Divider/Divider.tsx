import { classNames } from 'app/functions'

export const Divider = ( { color = 'grey', size = 1, className = '' }: { color?: string; size?: number, className?: string } ) => {
    const COLORS = { grey: 'grey-linear-gradient dark:grey-linear-gradient-dark' }
    return <div className={ classNames( COLORS[ color ], className ) } style={ { height: `${size}px` } }></div>
}
