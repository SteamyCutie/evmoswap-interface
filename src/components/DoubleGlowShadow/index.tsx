// import { isMobile } from 'react-device-detect'
import { FC } from 'react'
import { classNames } from '../../functions'

const DoubleGlowShadow: FC<{ className?: string }> = ( { children, className } ) => {
    return (
        <div
            className={ classNames(
                className,
                'relative w-full max-w-2xl border rounded-3xl border-light-stroke/50 dark:border-dark-stroke/50 bg-light-secondary dark:bg-dark-secondary transition-all'
            ) }
        >
            {/* <div className="absolute top-1/4 -left-10 bg-blue bottom-4 w-3/5 rounded-full z-0 filter blur-[150px]" />
      <div className="absolute bottom-1/4 -right-10 bg-red top-4 w-3/5 rounded-full z-0  filter blur-[150px]" /> */}
            <div className="relative">{ children }</div>
        </div>
    )
}

export default DoubleGlowShadow
