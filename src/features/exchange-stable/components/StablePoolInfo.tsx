import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Dots from 'app/components/Dots'
import Empty from 'app/components/Empty'
import Logo from 'app/components/Logo'
import QuestionHelper from 'app/components/QuestionHelper'
import { RowBetween } from 'app/components/Row'
import { STABLE_POOLS } from 'app/constants/pools'
import { classNames, formatBalance, formatNumber, formatNumberPercentage, formatPercent } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { useStablePoolInfo } from '../hooks'

const StablePoolInfo = ({
  poolId,
  showHeader = false,
  className = '',
}: {
  poolId: string
  showHeader?: boolean
  className?: string
}) => {
  const { chainId } = useActiveWeb3React()
  const pool = STABLE_POOLS[chainId][poolId]

  const poolInfo = useStablePoolInfo(poolId)
  const poolTokensInfo = poolInfo.tokensInfo
  const balances = poolTokensInfo.balances
  const virtualPrice = poolInfo.virtualPrice
  const isLoading = poolInfo.isLoading
  const swapFee = poolInfo.swapFee
  const adminFee = poolInfo.adminFee
  const totalTvl = Number(poolTokensInfo.total) * Number(poolInfo.virtualPrice)

  return (
    <>
      {isLoading && (
        <Empty>
          <Dots>{i18n._(t`Loading`)}</Dots>
        </Empty>
      )}

      {pool && (
        <div className={classNames('grid gap-2 text-dark-primary dark:text-light-primary transition-all', className)}>
          {showHeader && (
            <RowBetween>
              <div className="flex items-center space-x-4">
                <Logo
                  srcs={[pool.lpToken.icon.src]}
                  width={pool.lpToken.icon.width}
                  height={pool.lpToken.icon.height}
                />
                <div className="flex flex-col text-left">
                  <div className="text-lg sm:text-2xl font-bold">{pool.name}</div>
                </div>
              </div>
              <div className="flex flex-row text-left items-center space-x-2">
                <div className="text-lg">{formatNumber(totalTvl, true, false)}</div>
                <div className="text-sm hidden md:flex">{i18n._(t`Total Liquidity`)}</div>
              </div>
            </RowBetween>
          )}
          <div className="text-base font-extrabold">{i18n._(t`Pool Info`)}</div>
          <div className="flex flex-col w-full p-3 space-y-2 text-sm">
            {balances &&
              balances.map((poolBalance, index) => {
                const tvl = Number(poolBalance?.toExact()) * virtualPrice

                return (
                  <RowBetween key={index}>
                    <div>{poolBalance?.currency?.symbol}</div>
                    <div className="font-bold">
                      {formatNumber(tvl, true, false, 4)}
                      <span> ({formatNumberPercentage(poolBalance?.toExact(), totalTvl)})</span>
                    </div>
                  </RowBetween>
                )
              })}
            <RowBetween>
              <span className="flex items-center">
                <div>{i18n._(t`Virtual Price`)}</div>
                {/* <QuestionHelper text={i18n._(t`Average dollar value of pool token.`)}/> */}
              </span>
              <div className="font-bold">{formatNumber(virtualPrice, false, false)}</div>
            </RowBetween>
            <RowBetween>
              <span className="flex items-center">
                <div>{i18n._(t`Amplification coefficient`)}</div>
                {/* <QuestionHelper text={i18n._(t`Higher values help widen the range of low-slippages swaps, while lower values help keep the pool's composition balanced`)}/> */}
              </span>
              <div className="font-bold">{formatNumber(poolInfo.a, false, false)}</div>
            </RowBetween>
            <RowBetween>
              <div>{i18n._(t`Swap Fee`)}</div>
              <div className="font-bold">{formatPercent(swapFee)}</div>
            </RowBetween>
            <RowBetween>
              <div>{i18n._(t`Admin Fee`)}</div>
              <div className="font-bold">
                {formatPercent(adminFee)} of {formatPercent(swapFee)}
              </div>
            </RowBetween>
          </div>
        </div>
      )}
    </>
  )
}

export default StablePoolInfo
