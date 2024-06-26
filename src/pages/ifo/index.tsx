import Container from '../../components/Container'
import Head from 'next/head'
import NavLink from '../../components/NavLink'

import React, { useState } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ArrowRightIcon } from '@heroicons/react/outline'
import Typography from '../../components/Typography'
import { IfoQuestions } from 'app/features/ifo/IfoQuestions'
import { IfoCurrentCard } from 'app/features/ifo/IfoCurrentCard'
import ifos from 'app/constants/ifo'
import { useGetPublicIfoData, useGetWalletIfoData } from 'app/features/ifo/hooks'
import Button from 'app/components/Button'
import { IfoInfoCard } from 'app/features/ifo/IfoInfoCard'
import { IfoIdeaCard } from 'app/features/ifo/IfoIdeaCard'

export default function Ifo (): JSX.Element {
    const { i18n } = useLingui()

    const activeIfo = ifos.find( ( ifo ) => ifo.isActive )

    const publicIfoData = useGetPublicIfoData( activeIfo )
    const walletIfoData = useGetWalletIfoData( activeIfo )

    const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
    const activeTabStyle = `${tabStyle} text-high-emphesis font-bold bg-light dark:bg-dark`
    const inactiveTabStyle = `${tabStyle} text-secondary`

    const [ activeTab, setActiveTab ] = useState( 0 )

    return (
        <Container id="farm-page" className="grid h-full px-2 py-4 mx-auto md:py-8 lg:py-12 gap-9" maxWidth="5xl">
            <Head>
                <title>IEO | EvmoSwap</title>
                <meta key="description" name="description" content="Farm EvmoSwap" />
            </Head>

            <div className="col-span-4 space-y-6 lg:col-span-3">
                {/* Hero */ }
                <div className="flex-row items-center justify-between w-full p-8 space-y-2 md:flex bg-light-secondary dark:bg-dark-secondary">
                    <div className="space-y-2 md:block">
                        <Typography variant="h2" className="" weight={ 700 }>
                            { i18n._( t`Initial Evmos Offerings` ) }
                        </Typography>
                        <Typography variant="sm" weight={ 400 }>
                            { i18n._( t`Buy new tokens launching on Evmos Chain.` ) }
                        </Typography>
                        <a href="https://forms.gle/rg2ac5xAQKR8d6Ff6" target="_blank" rel="noreferrer">
                            <div className="flex items-center gap-4 mt-2 text-sm font-bold font-Poppins">
                                <div className="text-blue">{ i18n._( t`Apply for IEO` ) }</div>
                                <ArrowRightIcon height={ 14 } className="" />
                            </div>
                        </a>
                    </div>

                    {/* <div className="flex gap-3">
            <Button id="btn-create-new-pool" color="blue" variant="outlined" size="sm">
              <a href="https://forms.gle/rg2ac5xAQKR8d6Ff6" target="_blank" rel="noreferrer">
                {i18n._(t`Apply for IEO`)}
              </a>
            </Button>
          </div> */}

                    {/* tab */ }
                    {/* <div className="flex m-auto mb-2 rounded item-center md:m-0 md:w-3/12 h-14 bg-light-secondary dark:bg-dark-secondary">
            <div className="w-6/12 h-full p-1">
              <NavLink href="/ieo">
                <div className={activeTab === 0 ? activeTabStyle : inactiveTabStyle}>
                  <p>Current</p>
                </div>
              </NavLink>
            </div>
            <div className="w-6/12 h-full p-1">
              <NavLink href="/ieo/history">
                <div className={activeTab === 1 ? activeTabStyle : inactiveTabStyle}>
                  <p>Past</p>
                </div>
              </NavLink>
            </div>
          </div> */}
                </div>

                {/* ifo body */ }
                <IfoCurrentCard ifo={ activeIfo } publicIfoData={ publicIfoData } walletIfoData={ walletIfoData } />

                <IfoInfoCard />

                <IfoIdeaCard />

                {/* faq */ }
                {/* <IfoQuestions ifo={activeIfo} publicIfoData={publicIfoData} /> */ }
            </div>
        </Container>
    )
}
