import React, { } from 'react'

import Alert from '../../../components/Alert'
import Back from '../../../components/Back'
import Container from '../../../components/Container'
import Head from 'next/head'
import Typography from '../../../components/Typography'
import Web3Connect from '../../../components/Web3Connect'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { STABLE_POOLS } from 'app/constants/stables'
import PoolsNav from 'app/features/exchange-stable/components/StablePoolsNav'
import Empty from 'app/components/Empty'
import StablePoolItem from 'app/features/exchange-stable/components/StablePoolItem'

const alert = {
    title: "Stable AMM Liquidity Provider Rewards",
    description: "Liquidity providers earn a 0.025% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity",
};


export default function StablePools () {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const pools = STABLE_POOLS[ chainId ];
    const poolIds = Object.keys( pools );

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

            <div className="p-4 mb-3 space-y-3">
                <Back />

                <Typography component="h1" variant="h2">
                    { i18n._( t`My Liquidity Positions` ) }
                </Typography>
            </div>

            <Alert
                title={ i18n._( t`${alert.title}` ) }
                message={ i18n._( t`${alert.description}` ) }
                type="information"
            />

            <div className="p-4 space-y-4 rounded bg-dark-900">
                <div className="flex flex-row items-center justify-center rounded rounded p-3px h-[46px]">
                    <PoolsNav />
                </div>

                { !account && <Web3Connect size="lg" color="blue" className="w-full" /> }
                {
                    !poolIds.length && <Empty className="flex text-lg text-center text-low-emphesis">
                        <div className="px-4 py-2">{ i18n._( t`No liquidity was found. ` ) }</div>
                    </Empty>
                }
                {
                    poolIds.map( ( pAddress, index ) => (
                        <StablePoolItem key={ index } poolId={ pAddress } />
                    ) )
                }
            </div>
        </Container>
    )
}
