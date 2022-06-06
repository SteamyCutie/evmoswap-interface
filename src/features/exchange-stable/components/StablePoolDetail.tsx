import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import { Divider } from 'app/components/Divider/Divider'
import Dots from 'app/components/Dots'
import Empty from 'app/components/Empty'
import QuestionHelper from 'app/components/QuestionHelper'
import { RowBetween } from 'app/components/Row'
import { StablePoolInfo } from 'app/constants/stables'
import { classNames, formatNumber, formatNumberPercentage, formatPercent } from 'app/functions'
import StablePoolPosition from './StablePoolPosition'

const StablePoolDetail = ( {
    poolInfo,
    showHeader = false,
    showPosition = false,
    className = '',
}: {
    poolInfo: StablePoolInfo
    showHeader?: boolean
    showPosition?: boolean
    className?: string
} ) => {
    const poolTokensInfo = poolInfo.pooledTokensInfo
    const balances = poolTokensInfo.balances
    const virtualPrice = poolInfo.virtualPrice
    const isLoading = poolInfo.isLoading
    const swapFee = poolInfo.swapFee
    const adminFee = poolInfo.adminFee
    const totalTvl = Number( poolTokensInfo.total ) * Number( poolInfo.virtualPrice )

    return (
        <>
            { isLoading && (
                <Empty>
                    <Dots>{ i18n._( t`Loading` ) }</Dots>
                </Empty>
            ) }

            { poolInfo && (
                <div className={ classNames( 'text-dark dark:text-light', className ) }>
                    { showPosition && <StablePoolPosition poolInfo={ poolInfo } /> }

                    <div className="text-lg font-semibold mt-8 mb-4">{ i18n._( t`Pool Info` ) }</div>
                    { showHeader && (
                        <RowBetween>
                            <div className="flex items-center space-x-4 mb-4">
                                <CurrencyLogo currency={ poolInfo.lpToken } />
                                <div className="flex flex-col text-left">
                                    <div className="text-lg sm:text-2xl font-bold text-dark dark:text-white">{ poolInfo.name }</div>
                                </div>
                            </div>
                            <div className="flex flex-row text-left items-center space-x-2">
                                <div className="text-lg">{ formatNumber( totalTvl, true, false ) }</div>
                                <div className="text-sm text-secondary hidden md:flex">{ i18n._( t`Total Liquidity` ) }</div>
                            </div>
                        </RowBetween>
                    ) }

                    <div className="flex flex-col w-full text-sm font-medium">
                        <div className='space-y-2'>
                            { balances &&
                                balances.map( ( poolBalance, index ) => {
                                    const tvl = Number( poolBalance?.toExact() ) * virtualPrice

                                    return (
                                        <RowBetween key={ index }>
                                            <div>{ poolBalance?.currency?.symbol }</div>
                                            <div className="font-bold">
                                                { formatNumber( tvl, true, false, 4 ) }
                                                <span> ({ formatNumberPercentage( poolBalance?.toExact(), totalTvl ) })</span>
                                            </div>
                                        </RowBetween>
                                    )
                                } ) }

                            <RowBetween>
                                <span className="flex">
                                    <div>{ i18n._( t`Virtual Price` ) }</div>
                                    <div className="ml-1 flex">
                                        <QuestionHelper text={ i18n._( t`Average dollar value of pool token.` ) } />
                                    </div>
                                </span>
                                <div className="font-semibold">{ formatNumber( virtualPrice, false, false ) }</div>
                            </RowBetween>
                            <RowBetween>
                                <span className="flex">
                                    <div>{ i18n._( t`Amplification coefficient` ) }</div>
                                    <div className="ml-1 flex">
                                        <QuestionHelper
                                            text={ i18n._(
                                                t`Higher values help widen the range of low-slippages swaps, while lower values help keep the pool's composition balanced`
                                            ) }
                                        />
                                    </div>
                                </span>
                                <div className="font-semibold">{ formatNumber( poolInfo.a, false, false ) }</div>
                            </RowBetween>
                            <RowBetween>
                                <div>{ i18n._( t`Swap Fee` ) }</div>
                                <div className="font-semibold">{ formatPercent( swapFee ) }</div>
                            </RowBetween>
                            <RowBetween>
                                <div>{ i18n._( t`Admin Fee` ) }</div>
                                <div className="font-semibold">
                                    { formatPercent( adminFee ) } of { formatPercent( swapFee ) }
                                </div>
                            </RowBetween>
                        </div>
                    </div>
                </div>
            ) }
        </>
    )
}

export default StablePoolDetail
