import { MinusIcon, PlusIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SettingsTabControlled as Settings } from 'app/components/Settings'
import Switch from 'app/components/Switch'
import Typography from 'app/components/Typography'
import { classNames } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import React, { useMemo, useState } from 'react'
import { Percent } from '@evmoswap/core-sdk'
import { useUserSlippageToleranceWithDefault } from 'app/state/user/hooks'

import PoolAddLiquidity from './PoolAddLiquidity'
import PoolRemoveLiquidity from './PoolRemoveLiquidity'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent( 50, 10_000 )

// @ts-ignore TYPE NEEDS FIXING
const ManageSwapPair = ( { farm, handleDismiss } ) => {
    const { i18n } = useLingui()
    const [ toggle, setToggle ] = useState( true )
    const [ toggleSettings, setToggleSettings ] = useState( false )

    const token0 = useCurrency( farm.token0.id )
    const token1 = useCurrency( farm.token1.id )

    const allowedSlippage = useUserSlippageToleranceWithDefault( DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE ) // custom from users

    const navLinkStyle =
        'rounded-lg text-dark-text text-base hover:text-dark-text/60 dark:text-light-text dark:hover:text-light-text/60 transition-all font-bold'
    const activeNavLinkStyle = `${navLinkStyle} !text-dark dark:!text-light`

    const header = useMemo(
        () => (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex py-2 md:pt-4 space-x-8 rounded-md transition-all">
                        <button className={ `${toggle ? activeNavLinkStyle : navLinkStyle}` } onClick={ () => setToggle( true ) }>
                            { i18n._( t`Add liquidity` ) }
                        </button>
                        <button className={ `${!toggle ? activeNavLinkStyle : navLinkStyle}` } onClick={ () => setToggle( false ) }>
                            { i18n._( t`Remove liquidity` ) }
                        </button>
                    </div>
                    <Settings
                        isOpened={ toggleSettings }
                        toggle={ () => {
                            setToggleSettings( !toggleSettings )
                        } }
                        placeholderSlippage={ allowedSlippage }
                        direction="left"
                        className="!mr-5"
                    />
                </div>
            </div>
        ),
        [ i18n, toggle, toggleSettings ]
    )

    return (
        <>
            <div className={ classNames( toggle ? 'flex flex-col flex-grow gap-4 space-y-2' : 'hidden' ) }>
                <PoolAddLiquidity currencyA={ token0 } currencyB={ token1 } header={ header } handleDismiss={ handleDismiss } />
            </div>
            <div className={ classNames( !toggle ? 'flex flex-col flex-grow gap-4' : 'hidden' ) }>
                <PoolRemoveLiquidity currencyA={ token0 } currencyB={ token1 } header={ header } handleDismiss={ handleDismiss } />
            </div>
        </>
    )
}

export default ManageSwapPair
