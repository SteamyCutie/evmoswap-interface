import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Typography from 'app/components/Typography'
import { TridentBody, TridentHeader } from 'app/layouts/Trident'
import React from 'react'
import Head from 'next/head'
import AirdropCard from 'app/features/airdrops/AirdropCard'
import { airdrops } from 'app/constants/airdrops'
import { useEmoUsdcPrice } from 'app/features/farm/hooks'
import { formatBalance } from 'app/functions'

export default function Airdrops (): JSX.Element {

    const { i18n } = useLingui()
    const evmoPrice = useEmoUsdcPrice();

    return (
        <>
            <Head>
                <title>{ i18n._( t`Airdrops | EvmoSwap` ) }</title>
                <meta
                    key="description"
                    name="description"
                    content={ i18n._( t`Get free EMOS through EvmoSwap airdrops.` ) }
                />
            </Head>
            <TridentHeader className="sm:!flex-row justify-center items-center" pattern="bg-bubble">
                <Typography variant="h2" weight={ 700 }>
                    { i18n._( t`EMO Airdrops` ) }
                </Typography>
            </TridentHeader>
            <TridentBody className='z-[0] lg:pt-6'>
                <div className="grid md:grid-cols-2 w-full gap-6">
                    {
                        airdrops.map( ( airdrop, index ) => (
                            <AirdropCard airdrop={ airdrop } evmoPrice={ Number( formatBalance( evmoPrice ? evmoPrice : '0' ) ) } key={ index } />
                        ) )
                    }
                </div>
            </TridentBody>
        </>
    )
}
