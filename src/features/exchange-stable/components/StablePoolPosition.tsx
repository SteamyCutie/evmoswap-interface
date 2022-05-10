import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Dots from 'app/components/Dots'
import Empty from 'app/components/Empty'
import { RowBetween } from 'app/components/Row'
import { STABLE_POOLS } from 'app/constants/pools'
import { classNames, formatBalance, formatPercent } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { useStablePoolInfo, useStableTokensInfo } from '../hooks'

const FEE_DECIMALS = 10

const StablePoolInfo = ( {
    poolId,
    className = '',
}: {
    poolId: string
    showHeader?: boolean
    className?: string
} ) => {
    const { chainId } = useActiveWeb3React()
    const pool = STABLE_POOLS[ chainId ][ poolId ]

    const poolInfo = useStablePoolInfo( poolId )
    const virtualPrice = Number( formatBalance( poolInfo?.virtualPrice || 0, pool?.lpToken?.decimals || 0 ) )
    const poolTokensInfo = useStableTokensInfo( poolId, pool?.pooledTokens, virtualPrice )
    const isLoading = poolInfo?.isLoading
    const swapFee = Number( formatBalance( poolInfo.swapFee || '0', FEE_DECIMALS ) ) * 100
    const totalTvl = poolTokensInfo.tvl
    const poolTokenPercentage = totalTvl
    return (
        <>
            { isLoading && (
                <Empty>
                    <Dots>{ i18n._( t`Loading` ) }</Dots>
                </Empty>
            ) }

            { pool && (
                <div className={ classNames( 'px-4 py-4 space-y-1 text-sm rounded text-high-emphesis bg-dark-900', className ) }>
                    <RowBetween>
                        <div>{ i18n._( t`Your TVL` ) }:</div>
                        <div className="font-semibold">{ totalTvl ? totalTvl : '-' }</div>
                    </RowBetween>

                    <RowBetween>
                        <div>{ i18n._( t`Your pool share` ) }:</div>
                        <div className="font-semibold">{ poolTokenPercentage ? formatPercent( poolTokenPercentage ) : '-' }</div>
                    </RowBetween>
                </div>
            ) }
        </>
    )
}

export default StablePoolInfo
