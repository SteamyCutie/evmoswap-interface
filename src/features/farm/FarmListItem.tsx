// import { t } from '@lingui/macro'
import { getAddress } from '@ethersproject/address'
import { CurrencyLogoArray, CurrencyLogo } from 'app/components/CurrencyLogo'
import Typography from 'app/components/Typography'
import { classNames, formatNumber, formatPercent } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import React, { FC, ReactNode, useMemo } from 'react'
import { LockClosedIcon } from '@heroicons/react/solid'
import { WNATIVE, Token } from '@evmoswap/core-sdk'
import { useActiveWeb3React } from '../../services/web3'
import { useFarmPendingRewardsAmount, useFarmRewardApr, useFarmRewardsApr } from 'app/features/farm/hooks'
import { useUserInfo } from 'features/farm/hooks'
import { Divider } from 'app/components/Divider/Divider'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

interface FarmListItem {
  farm: any
  onClick(x: ReactNode): void
}

const BG =
  'bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/50 dark:hover:bg-dark-secondary/50 md:!bg-transparent md:dark:!bg-transparent'
const SPACING = 'rounded-2xl my-4 md:my-0'
export const TABLE_TBODY_TR_CLASSNAME = `flex flex-col md:flex-row p-4 md:p-0 w-auto md:width-full overflow-hidden hover:cursor-pointer ${BG} ${SPACING}`

// @ts-ignore TYPE NEEDS FIXING
export const TABLE_TBODY_TD_CLASSNAME = (i, length) =>
  classNames(
    'py-3 flex items-center justify-between md:justify-start',
    i === length - 1 ? 'w-auto' : 'md:w-[13%]',
    i === 0 ? 'md:!w-[24%]' : '',
    i === 1 ? 'md:!w-[18%]' : ''
  )

// @ts-ignore TYPE NEEDS FIXING
const FarmListItem: FC<FarmListItem> = ({ farm, onClick }) => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const token0 = useCurrency(farm.token0.id) ?? undefined
  const token1 = useCurrency(farm.token1.id) ?? undefined

  const tokens = farm.tokens
  const currencies: Token[] | undefined = useMemo(() => {
    if (!tokens) return [token0, token1]
    return tokens.map((token) => {
      return new Token(chainId, token.id, token.decimals, token.symbol, token.name)
    })
  }, [tokens, chainId, token0, token1])

  const pendingRewards = useFarmPendingRewardsAmount(farm)
  const pendingRewardTokens = useMemo(() => {
    return pendingRewards.map((r) => r?.currency)
  }, [pendingRewards])
  const pendingRewardsTokenApr = useFarmRewardsApr(farm, pendingRewardTokens)

  const liquidityToken = chainId
    ? new Token(chainId, getAddress(farm.lpToken), farm.token1 ? 18 : farm.token0 ? farm.token0.decimals : 18, 'ELP')
    : undefined

  const { stakedAmount: userPoolBalance } = useUserInfo(farm, liquidityToken)

  return (
    <div className={classNames(TABLE_TBODY_TR_CLASSNAME)} onClick={onClick}>
      <div className={classNames('flex gap-2', TABLE_TBODY_TD_CLASSNAME(0, 6))}>
        {token0 && token1 && <CurrencyLogoArray currencies={currencies || [token0, token1]} dense size={32} />}
        <div className="flex flex-col items-start">
          <Typography weight={600} className="text-high-emphasis">
            {currencies.map((token, index) => (
              <span key={index}>
                {token?.address === WNATIVE[chainId].address ? 'WEVMOS' : token?.symbol}
                {index !== currencies.length - 1 && <span className="text-low-emphasis">/</span>}
              </span>
            ))}
          </Typography>
        </div>
      </div>
      <div className={TABLE_TBODY_TD_CLASSNAME(1, 6)}>
        <Typography weight={500} className="mr-4 inline md:hidden">
          {i18n._(t`Rewards`)}
        </Typography>
        <div className="flex flex-row items-center space-x-2">
          <CurrencyLogoArray currencies={pendingRewardTokens} dense size={24} />
          <div className="flex flex-col font-semibold">
            {pendingRewards.map((reward, index) => (
              <div key={index}>{`${reward?.toFixed(2)} ${reward?.currency?.symbol}`}</div>
            ))}
          </div>
        </div>
      </div>
      <div className={TABLE_TBODY_TD_CLASSNAME(2, 6)}>
        <Typography weight={500} className="mr-4 inline md:hidden">
          {i18n._(t`TVL`)}
        </Typography>
        <Typography weight={600} className="text-high-emphasis">
          {formatNumber(farm.tvl, true)}
        </Typography>
      </div>
      <div className={TABLE_TBODY_TD_CLASSNAME(3, 6)}>
        <Typography weight={500} className="mr-4 inline md:hidden">
          {i18n._(t`Deposits`)}
        </Typography>
        <Typography weight={600} className="text-high-emphasis">
          {formatNumber(Number(userPoolBalance?.toExact()) * Number(farm?.lpPrice), true, false, 2)}
        </Typography>
      </div>
      <div className={classNames(TABLE_TBODY_TD_CLASSNAME(4, 6))}>
        {/* @ts-ignore TYPE NEEDS FIXING */}
        <Typography weight={500} className="mr-4 inline md:hidden">
          {i18n._(t`Multiplier`)}
        </Typography>
        <Typography weight={600} className="text-high-emphasis">
          {farm.multiplier / 100}x
        </Typography>
      </div>
      <div className={classNames(TABLE_TBODY_TD_CLASSNAME(5, 6))}>
        <Typography weight={500} className="mr-4 inline md:hidden">
          {i18n._(t`APR -> Boost APR`)}
        </Typography>
        <Typography weight={600} className="text-high-emphasis">
          {pendingRewardTokens?.length < 2 && (
            <div className="flex items-center justify-start">
              <LockClosedIcon className="h-4 text-yellow" />
              <div className="text-sm font-bold md:text-base">
                {formatPercent(farm.apr)} → {formatPercent(farm.apr * 2.5)}
              </div>
            </div>
          )}
          {pendingRewardTokens?.length > 1 &&
            pendingRewardsTokenApr.map((apr, index) => (
              <div className="flex items-center justify-start" key={index}>
                <LockClosedIcon className="h-4 text-yellow" />
                <div className="text-sm font-bold md:text-base">
                  {formatPercent(apr)} → {formatPercent(apr * 2.5)}
                </div>
              </div>
            ))}
        </Typography>
      </div>
    </div>
  )
}

export default FarmListItem
