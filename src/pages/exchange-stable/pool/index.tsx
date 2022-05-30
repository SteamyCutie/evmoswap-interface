import React from 'react'

import Alert from '../../../components/Alert'
import Back from '../../../components/Back'
import Container from '../../../components/Container'
import Head from 'next/head'
import Typography from '../../../components/Typography'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { STABLE_POOLS } from 'app/constants/pools'
import StablePool from 'app/features/exchange-stable/components/StablePool'
import PoolsNav from 'app/features/exchange-stable/components/StablePoolsNav'
import DoubleGlowShadow from 'app/components/DoubleGlowShadow'

const alert = {
  title: 'Stable AMM Liquidity Provider Rewards',
  description:
    'Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity',
}

export default function StablePools() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const pools = STABLE_POOLS[chainId]

  return (
    <Container id="pool-page" className="py-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Stable Pool | EvmoSwap</title>
        <meta
          key="description"
          name="description"
          content="EvmoSwap Stable liquidity pools are markets for trades between the two tokens, you can provide these tokens and become a liquidity provider to earn 0.25% of fees from trades."
        />
      </Head>

      <div className="py-4 mb-3 space-y-3">
        <Back />
        <div className="text-2xl font-extrabold text-dark-primary dark:text-light-primary transition-all">
          {i18n._(t`My Liquidity Positions`)}
        </div>
      </div>

      {/* <Alert
        title={i18n._(t`${alert.title}`)}
        message={i18n._(t`${alert.description}`)}
        type="information"
      /> */}

      <DoubleGlowShadow>
        <div className="gap-4 p-6 transition-all rounded-3xl z-0">
          <PoolsNav />

          {!account ? (
            <Web3Connect size="lg" color="gradient" className="w-full text-sm font-extrabold" />
          ) : (
            <div className="bg-light-primary dark:bg-dark-primary transition-all border-2 rounded-2xl border-light-stroke dark:border-dark-stroke p-2">
              {Object.keys(pools).map((pAddress, index) => (
                <StablePool key={index} poolId={pAddress} />
              ))}
            </div>
          )}
        </div>
      </DoubleGlowShadow>
      <div className="pb-40 text-base text-dark-primary/50 dark:text-light-primary/50 transition-all">
        <div className="font-extrabold">{alert.title}</div>
        <div>{alert.description}</div>
      </div>
    </Container>
  )
}
