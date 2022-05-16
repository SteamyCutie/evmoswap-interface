import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Dots from 'app/components/Dots'
import Empty from 'app/components/Empty'
import { RowBetween } from 'app/components/Row'
import { STABLE_POOLS } from 'app/constants/pools'
import { classNames, formatPercent } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { useStablePoolInfo } from '../hooks'

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
    const poolTokensInfo = poolInfo.tokensInfo
    const isLoading = poolInfo?.isLoading
    const totalTvl = Number( poolTokensInfo?.total ) * Number( poolInfo?.virtualPrice )
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
