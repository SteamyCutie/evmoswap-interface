import React, { useState, useRef } from 'react'
import Container from '../../components/Container'
import Dots from '../../components/Dots'
import Head from 'next/head'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useEmosVaultContract } from 'hooks/useContract'
import { ArrowRightIcon } from '@heroicons/react/outline'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { formatNumber, getBalanceAmount } from 'functions/formatBalance'
import { GetEMOPrice } from 'features/staking/useStaking'
import AutoPoolCard from 'app/features/staking/AutoPoolCard/AutoPoolCard'
import ManualPoolCard from 'app/features/staking/ManualPoolCard/ManualPoolCard'
import Typography from 'app/components/Typography'
import { formatNumberScale } from 'app/functions'
import Button from 'app/components/Button'
import IncentivePool from 'app/features/staking/IncentivePool/IncentivePool'
import QuestionHelper from 'app/components/QuestionHelper'
import NavLink from 'app/components/NavLink'
import { useRouter } from 'next/router'
import usePools from 'features/staking/IncentivePool/usePools'
import useFuse from '../../hooks/useFuse'
import useSortableData from '../../hooks/useSortableData'
import InfiniteScroll from 'react-infinite-scroll-component'
import IncentivePoolCardItem from 'features/staking/IncentivePool/IncentivePoolCardItem'
import { useInfiniteScroll } from 'app/features/farm/hooks'

const buttonStyle =
    'flex justify-center items-center w-full h-14 rounded font-bold md:font-medium md:text-lg mt-5 text-sm focus:outline-none focus:ring'

export default function Stake () {
    const { i18n } = useLingui()
    const addTransaction = useTransactionAdder()

    const emovaultContract = useEmosVaultContract()

    const autoemoBountyValue = useRef( 0 )

    const tabStyle =
        'flex justify-center items-center text-center h-full w-full rounded-lg cursor-pointer text-sm md:text-sm lg:text-base'
    const activeTabStyle = `${tabStyle} text-white font-bold bg-blue`
    const inactiveTabStyle = `${tabStyle} text-secondary`

    const router = useRouter()
    const type = router.query.filter == null ? 'all' : ( router.query.filter as string )

    const query = usePools()

    const FILTER = {
        all: ( pool ) => !pool.isFinished,
        inactive: ( pool ) => pool.isFinished,
    }

    const datas = query?.pools.filter( ( pool ) => {
        return type in FILTER ? FILTER[ type ]( pool ) : true
    } )

    // Search Setup
    const options = { keys: [ 'symbol', 'name' ], threshold: 0.4 }
    const { result, search, term } = useFuse( {
        data: datas && datas.length > 0 ? datas : [],
        options,
    } )

    const flattenSearchResults = result.map( ( a: { item: any } ) => ( a.item ? a.item : a ) )

    // Sorting Setup
    const { items, requestSort, sortConfig } = useSortableData( flattenSearchResults )
    const [ numDisplayed, setNumDisplayed ] = useInfiniteScroll( items )

    const [ activeTab, setActiveTab ] = useState( 0 )

    // const getEmoVault = async () => {
    //   const autoemoBounty = await emovaultContract.calculateHarvestEmoRewards()
    //   autoemoBountyValue.current = getBalanceAmount(autoemoBounty._hex, 18).toNumber()
    // }
    // getEmoVault()

    const emoPrice = GetEMOPrice()
    const [ pendingBountyTx, setPendingBountyTx ] = useState( false )
    const handleBountyClaim = async () => {
        setPendingBountyTx( true )
        try {
            const gasLimit = await emovaultContract.estimateGas.harvest()
            const tx = await emovaultContract.harvest( { gasLimit: gasLimit.mul( 120 ).div( 100 ) } )
            addTransaction( tx, {
                summary: `${i18n._( t`Claim` )} EMO`,
            } )
            setPendingBountyTx( false )
        } catch ( error ) {
            console.error( error )
            setPendingBountyTx( false )
        }
    }

    return (
        <Container id="bar-page" className="py-4 md:py-8 lg:py-12" maxWidth="6xl">
            <Head>
                <title key="title">Stake | EvmoSwap</title>
                <meta key="description" name="description" content="Stake EvmoSwap" />
            </Head>
            <div className="w-11/12 m-auto">
                <div className="grid w-full space-y-2 md:flex justify-center m-auto md:justify-between items-center">
                    <div className="text-white flex flex-wrap md:grid m-auto md:ml-0">
                        <div className="text-2xl">Staking Pool</div>
                        <div className="text-sm md:text-base">{ i18n._( t`Just stake some tokens to earn. High APR, low risk.` ) }</div>
                    </div>

                    {/* select tab */ }
                    <div className="flex m-auto mb-2 rounded md:m-0 w-full md:w-4/12 h-14 bg-light-secondary dark:bg-dark-secondary">
                        <div className="w-6/12 h-full p-1" onClick={ () => setActiveTab( 0 ) }>
                            <NavLink href="/stake?filter=all">
                                <div className={ activeTab === 0 ? activeTabStyle : inactiveTabStyle }>
                                    <p>All Pools</p>
                                </div>
                            </NavLink>
                        </div>
                        <div className="w-6/12 h-full p-1" onClick={ () => setActiveTab( 1 ) }>
                            <NavLink href="/stake?filter=inactive">
                                <div className={ activeTab === 1 ? activeTabStyle : inactiveTabStyle }>
                                    <p>Inactive Pools</p>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>

                {/* Hero */ }
                {/* <div className="flex-row items-center justify-between w-full px-8 py-6 space-y-2 rounded md:flex bg-cyan-blue bg-opacity-20">
          <div className="w-8/12 mb-5 space-y-2 gap-y-10 md:mb-0">
            <Typography variant="h2" className="mb-2 text-high-emphesis" weight={700}>
              {i18n._(t`Emo Stake`)}
            </Typography>
            <Typography variant="sm" weight={400}>
              {i18n._(t`Looking for a less resource-intensive alternative to mining?`)}
            </Typography>
            <Typography variant="sm" weight={400}>
              {i18n._(t`Use your EMO tokens to earn more tokens,for Free.`)}
            </Typography>
            <a href="https://forms.gle/4MTpS6NquqWUVSZw8" target="_blank" rel="noreferrer">
              <div className="flex items-center gap-2 mt-2 text-sm font-bold font-Poppins">
                <div className="text-light-blue">{i18n._(t`Apply to Launch`)}</div>
                <ArrowRightIcon height={14} className="" />
              </div>
            </a>
          </div>

          <div className="w-full px-4 py-4 m-auto rounded-lg md:w-4/12 md:px-6 bg-cyan-blue bg-opacity-30">
            <div className="flex flex-row items-center text-lg font-bold text-white">
              {i18n._(t`Auto Emo Bounty`)}
              <QuestionHelper text="This bounty is given as a reward for providing a service to other users. Whenever you successfully claim the bounty, you’re also helping out by activating the Auto EMO Pool’s compounding function for everyone.Auto-Compound Bounty: 0.25% of all Auto EMO pool users pending yield" />
            </div>
            <div className="flex items-center justify-between space-x-10">
              <div>
                <div className="text-xl font-bold text-white">{Number(autoemoBountyValue.current).toFixed(3)}</div>
                <div className="text-base text-light-blue">
                  {' '}
                  {Number(autoemoBountyValue.current * emoPrice).toFixed(3)} USD
                </div>
              </div>
              <div>
                <Button
                  id="btn-create-new-pool"
                  color="gradient"
                  variant="outlined"
                  size="sm"
                  disabled={!autoemoBountyValue.current || pendingBountyTx}
                  onClick={handleBountyClaim}
                >
                  {pendingBountyTx ? <Dots>{i18n._(t`Claiming`)} </Dots> : i18n._(t`Claim`)}
                </Button>
              </div>
            </div>
          </div>
        </div> */}

                {/* <div className="mt-5 text-2xl font-bold text-high-emphesis">Staking Pools</div> */ }
                {/* <div className="w-full mt-3 md:mt-6 space-y-4">
          <AutoPoolCard />
          <ManualPoolCard />
        </div> */}

                {/* Incentive pool */ }
                <div className="w-full mt-6 md:flex">
                    <div className="w-full col-span-4 space-y-6 lg:col-span-3">
                        { items && items.length > 0 ? (
                            <InfiniteScroll
                                dataLength={ numDisplayed }
                                next={ () => setNumDisplayed( numDisplayed + 5 ) }
                                hasMore={ true }
                                loader={ null }
                            >
                                <div className="gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                    { items.slice( 0, numDisplayed ).map( ( pool, index ) => (
                                        <IncentivePoolCardItem key={ index } pool={ pool } />
                                    ) ) }
                                </div>
                            </InfiniteScroll>
                        ) : (
                            <div className="w-full py-6 text-center">{ term ? <span>No Results.</span> : <Dots>Loading</Dots> }</div>
                        ) }
                    </div>
                </div>
            </div>
        </Container>
    )
}
