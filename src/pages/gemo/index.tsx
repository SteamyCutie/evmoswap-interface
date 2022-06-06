import Container from '../../components/Container'
import Head from 'next/head'

import React, { useState } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChevronRightIcon, ExclamationIcon } from '@heroicons/react/solid'
import Typography from '../../components/Typography'
import GEmoControl from 'app/features/gemo/GEmoControl'
import GEmoUtility from 'app/features/gemo/GEmoUtility'
import GEmoFlow from 'app/features/gemo/GEmoFlow'
import Alert from 'app/components/Alert'

export default function GEmo (): JSX.Element {
    const { i18n } = useLingui()

    return (
        <Container id="gemo" className="grid h-full px-2 py-4 mx-auto md:py-8 lg:py-12 gap-9" maxWidth="5xl">
            <Head>
                <title>GEMO | EvmoSwap</title>
                <meta key="description" name="description" content="Farm EvmoSwap" />
            </Head>

            <div className="col-span-4 space-y-6 lg:col-span-3">
                {/* Hero */ }
                <div
                    className="flex-row items-center justify-between w-full p-8 space-y-2 bg-center bg-no-repeat bg-cover md:p-16 rounded-2xl md:flex bg-light dark:bg-dark"
                    style={ { backgroundImage: "url('/images/gemo/gnana-night.png')" } }
                >
                    <div className="gap-8 md:block">
                        <Typography className="text-[24px] text-high-emphesis md:text-[40px]" weight={ 700 }>
                            { i18n._( t`Gem EMO` ) }
                        </Typography>
                        <a href="" target="_blank" rel="noreferrer">
                            <div className="flex items-center gap-2 mt-2 text-sm font-bold md:mt-4 font-Poppins">
                                <div className="text-light-blue">{ i18n._( t`Learn more` ) }</div>
                                <ChevronRightIcon height={ 14 } className="" />
                            </div>
                        </a>
                    </div>
                </div>
                {/* <div className="flex items-center justify-between gap-2 p-2 px-4 md:p-4 md:px-6 md:gap-6 bg-yellow/30 rounded-2xl">
          <ExclamationIcon className="w-1/3 md:w-auto" height={64} />
          <div className="flex-row">
            <div className="text-base font-extrabold text-center uppercase md:text-xl">Warning</div>
            <div className="text-sm text-center md:text-sm">
              Converting GEMO involves paying a 28% burn fee and a 2% reflect fee for a total cost of 30%. This means
              that for every 1 EMO you trade in, you will receive 0.7 GEMO
            </div>
          </div>
          <ExclamationIcon className="w-1/3 md:w-auto" height={64} />
        </div> */}

                <Alert
                    title={ i18n._( t`Gem EMO mechanism` ) }
                    message={ i18n._( t`Converting GEMO involves paying a 28% burn fee and a 2% reflect fee for a total cost of 30%. This means that for every 1 EMO you trade in, you will receive 0.7 GEMO.` ) }
                    type="information"
                />
                <GEmoControl />
                {/* <GEmoUtility /> */ }
                <GEmoFlow />
            </div>
        </Container>
    )
}
