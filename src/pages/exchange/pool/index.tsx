import { CurrencyAmount, NATIVE, Pair } from '@evmoswap/core-sdk'
import React, { useMemo } from 'react'
import { classNames, currencyId } from '../../../functions'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../../state/user/hooks'

import Alert from '../../../components/Alert'
import Back from '../../../components/Back'
import Button from '../../../components/Button'
import Container from '../../../components/Container'
import Dots from '../../../components/Dots'
import Empty from '../../../components/Empty'
import FullPositionCard from '../../../components/PositionCard'
import Head from 'next/head'
import { MigrationSupported } from '../../../features/migration'
import Typography from '../../../components/Typography'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useETHBalances } from '../../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTokenBalancesWithLoadingIndicator } from '../../../state/wallet/hooks'
import { useV2Pairs } from '../../../hooks/useV2Pairs'
import PoolsNav from 'app/features/exchange-stable/components/StablePoolsNav'
import DoubleGlowShadow from 'app/components/DoubleGlowShadow'

export default function Pool() {
  const { i18n } = useLingui()
  const router = useRouter()
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map((tokens) => ({
        liquidityToken: toV2LiquidityToken(tokens),
        tokens,
      })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens]
  )
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = useV2Pairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // TODO: Replicate this!
  // show liquidity even if its deposited in rewards contract
  // const stakingInfo = useStakingInfo()
  // const stakingInfosWithBalance = stakingInfo?.filter((pool) =>
  //   JSBI.greaterThan(pool.stakedAmount.quotient, BIG_INT_ZERO)
  // )
  // const stakingPairs = useV2Pairs(stakingInfosWithBalance?.map((stakingInfo) => stakingInfo.tokens))

  // // remove any pairs that also are included in pairs with stake in mining pool
  // const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter((v2Pair) => {
  //   return (
  //     stakingPairs
  //       ?.map((stakingPair) => stakingPair[1])
  //       .filter((stakingPair) => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
  //   )
  // })
  const migrationSupported = chainId in MigrationSupported
  return (
    <Container id="pool-page" className="py-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Pool | EvmoSwap</title>
        <meta
          key="description"
          name="description"
          content="Evmoswap liquidity pools are markets for trades between the two tokens, you can provide these tokens and become a liquidity provider to earn 0.25% of fees from trades."
        />
      </Head>

      <div className="py-4 mb-3 space-y-3">
        <Back />
        <div className="text-2xl font-extrabold text-dark-primary dark:text-light-primary transition-all">
          {i18n._(t`My Liquidity Positions`)}
        </div>
      </div>

      <DoubleGlowShadow>
        <div className="gap-4 p-6 transition-all rounded-3xl z-0">
          <PoolsNav />
          <div className="grid grid-flow-row gap-3 ">
            {!account ? (
              <Web3Connect size="lg" color="gradient" className="w-full" />
            ) : v2IsLoading ? (
              <Empty className="text-base">
                <Dots>{i18n._(t`Loading`)}</Dots>
              </Empty>
            ) : allV2PairsWithLiquidity?.length > 0 ? (
              <>
                {/* <div className="flex items-center justify-center">
                  <ExternalLink
                    href={"https://analytics.sushi.com/user/" + account}
                  >
                    Account analytics and accrued fees <span> ↗</span>
                  </ExternalLink>
                </div> */}
                <div className="bg-light-primary dark:bg-dark-primary transition-all border-2 rounded-2xl border-light-stroke dark:border-dark-stroke p-2">
                  {allV2PairsWithLiquidity.map((v2Pair) => (
                    <FullPositionCard
                      key={v2Pair.liquidityToken.address}
                      pair={v2Pair}
                      stakedBalance={CurrencyAmount.fromRawAmount(v2Pair.liquidityToken, '0')}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Empty className="flex text-base text-center text-dark-primary/80 dark:text-light-primary/80 transition-all">
                <div className="px-4 py-2">{i18n._(t`No liquidity was found. `)}</div>
              </Empty>
            )}
            <div
              className={classNames(
                'grid gap-4 pt-2 transition-all',
                migrationSupported ? 'grid-cols-3' : 'grid-cols-2'
              )}
            >
              <Button
                id="add-pool-button"
                size="lg"
                color="gradient"
                className="grid items-center justify-center grid-flow-col gap-2 whitespace-nowrap font-extrabold"
                onClick={() => router.push(`/add/${currencyId(NATIVE[chainId])}`)}
              >
                {i18n._(t`Add`)}
              </Button>
              <Button
                id="add-pool-button"
                variant="outlined"
                color="gradient"
                size="lg"
                onClick={() => router.push(`/find`)}
                className="font-extrabold"
              >
                {i18n._(t`Import`)}
              </Button>

              {migrationSupported && (
                <Button id="create-pool-button" color="gray" size="lg" onClick={() => router.push(`/migrate`)}>
                  {i18n._(t`Migrate`)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DoubleGlowShadow>

      <div className="text-dark-primary/80 dark:text-light-primary/80 transition-all text-base">
        {i18n._(t`Liquidity providers earn a 0.25% fee on all trades proportional to their share of
                        the pool. Fees are added to the pool, accrue in real time and can be claimed by
                        withdrawing your liquidity`)}
      </div>
    </Container>
  )
}
