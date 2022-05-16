// import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { getAddress } from '@ethersproject/address'
import { CurrencyLogoArray, CurrencyLogo } from 'app/components/CurrencyLogo'
// import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { classNames, formatNumber, formatPercent, formatBalance } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import React, { FC, ReactNode, useMemo } from 'react'
import { LockClosedIcon } from '@heroicons/react/solid'
import { WNATIVE, Token } from '@evmoswap/core-sdk'
import { useActiveWeb3React } from '../../services/web3'
import { EvmoSwap } from 'config/tokens'
import { usePendingReward } from 'app/features/farm/hooks'
import { useUserInfo } from 'features/farm/hooks'
import FarmIncentiveRewards from './FarmIncentiveRewards'

interface FarmListItem {
    farm: any
    onClick ( x: ReactNode ): void
}

export const TABLE_TBODY_TR_CLASSNAME = 'hover:bg-dark-900/40 hover:cursor-pointer'
// @ts-ignore TYPE NEEDS FIXING
export const TABLE_TBODY_TD_CLASSNAME = ( i, length ) =>
    classNames(
        'py-3 border-t border-dark-900 flex items-center',
        i === 0 ? 'pl-4 justify-start' : 'justify-end',
        i === length - 1 ? 'pr-4' : ''
    )

// @ts-ignore TYPE NEEDS FIXING
const FarmListItem: FC<FarmListItem> = ( { farm, onClick } ) => {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const token0 = useCurrency( farm.token0.id ) ?? undefined
    const token1 = useCurrency( farm.token1.id ) ?? undefined
    const tokens = farm.tokens;
    const currencies: Token[] | undefined = useMemo( () => {
        if ( !tokens ) return [ token0, token1 ];
        return tokens.map( ( token ) => {
            return new Token( chainId, token.id, token.decimals, token.symbol, token.name );
        } );
    }, [ tokens, chainId, token0, token1 ] )

    const pendingReward = usePendingReward( farm )
    const rewardToken = useCurrency( pendingReward?.tokens[ 0 ] )
    const rewardAmounts = formatBalance( pendingReward?.amounts[ 0 ] ? pendingReward?.amounts[ 0 ] : 0 )
    const nativeToken = useCurrency( EvmoSwap[ chainId ].address )
    const liquidityToken = new Token(
        // @ts-ignore TYPE NEEDS FIXING
        chainId,
        getAddress( farm.lpToken ),
        farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18,
        'SLP'
    )
    const { stakedAmount: userPoolBalance } = useUserInfo( farm, liquidityToken )

    // console.log('farm: ', farm)
    return (
        <div className={ classNames( TABLE_TBODY_TR_CLASSNAME, 'grid grid-cols-6' ) } onClick={ onClick }>
            <div className={ classNames( 'flex gap-2', TABLE_TBODY_TD_CLASSNAME( 0, 6 ) ) }>
                { token0 && token1 && <CurrencyLogoArray currencies={ currencies || [ token0, token1 ] } dense size={ 32 } /> }
                <div className="flex flex-col items-start">
                    <Typography weight={ 700 } className="flex gap-1 text-high-emphasis">
                        {
                            currencies.map( ( token, index ) => (
                                <span key={ index }>
                                    { token.address === WNATIVE[ chainId ].address ? 'WEVMOS' : token.symbol }
                                    { index !== ( currencies.length - 1 ) && <span className="text-low-emphasis">/</span> }
                                </span>
                            ) )
                        }
                    </Typography>
                </div>
            </div>
            <div className={ TABLE_TBODY_TD_CLASSNAME( 1, 6 ) }>
                <div className='flex flex-col items-start'>
                    <div className="flex items-center gap-2">
                        <CurrencyLogo currency={ nativeToken } size={ 20 } />
                        <div>{ `${Number( rewardAmounts ).toFixed( 2 )} ${rewardToken?.symbol}` }</div>
                    </div>
                    <FarmIncentiveRewards incentives={ farm.incentives } decimals={ 2 } />
                </div>
            </div>
            <div className={ TABLE_TBODY_TD_CLASSNAME( 2, 6 ) }>
                <Typography weight={ 700 } className="text-high-emphasis">
                    { formatNumber( farm.tvl, true ) }
                </Typography>
            </div>
            <div className={ TABLE_TBODY_TD_CLASSNAME( 3, 6 ) }>
                <Typography weight={ 700 } className="text-high-emphasis">
                    ${ ( Number( userPoolBalance?.toExact() ) * farm?.lpPrice ).toFixed( 2 ) }
                </Typography>
            </div>
            <div className={ classNames( 'flex flex-col !items-end !justify-center mr-2', TABLE_TBODY_TD_CLASSNAME( 4, 6 ) ) }>
                {/* @ts-ignore TYPE NEEDS FIXING */ }
                <Typography weight={ 700 } className="text-high-emphasis">
                    { farm.multiplier / 100 }x
                </Typography>
            </div>
            <div className={ classNames( 'flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME( 5, 6 ) ) }>
                <Typography weight={ 700 } className="text-high-emphasis">
                    <div className="flex items-center">
                        <LockClosedIcon className="h-4 text-yellow" />
                        <div className="text-xs font-bold md:text-base">
                            { formatPercent( farm.apr ) } → { formatPercent( farm.apr * 2.5 ) }
                        </div>
                    </div>
                </Typography>
            </div>
        </div>
    )
}

export default FarmListItem
