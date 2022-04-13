import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import Typography from 'app/components/Typography'
// import { Chef, PairType } from 'app/features/farms/enum'
import FarmList from 'app/features/farm/FarmList'

// import OnsenFilter from 'app/features/farmv3/FarmMenu'
import useFuse from 'app/hooks/useFuse'
import { TridentBody, TridentHeader } from 'app/layouts/Trident'
// import { useActiveWeb3React } from 'app/services/web3'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import useFarms from 'app/features/farm/useFarms'
// import useMasterChef from 'app/features/farms/useMasterChef'

import SearchPools from 'app/components/SearchPools'

export default function Farms(): JSX.Element {
  const { i18n } = useLingui()
  // const [pendingTx, setPendingTx] = useState(false)
  // const addTransaction = useTransactionAdder()

  const router = useRouter()
  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  const query = useFarms()
  // const { harvestAll } = useMasterChef(Chef.MASTERCHEF_V2)

  let tokenPrice = 0
  let totalTvlInUSD = 0

  query?.farms.map((farm: any) => {
    tokenPrice = farm.tokenPrice
    totalTvlInUSD = farm.totalTvlInUSD
  })

  const FILTER = {
    all: (farm) => farm.multiplier !== 0,
    inactive: (farm) => farm.multiplier == 0,
  }

  const datas = query?.farms.filter((farm) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  // Search Setup
  const options = { keys: ['symbol', 'name', 'lpToken'], threshold: 0.4 }
  const { result, search, term } = useFuse({
    data: datas && datas.length > 0 ? datas : [],
    options,
  })

  return (
    <>
      <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
        <div>
          <Typography variant="h2" className="text-high-emphesis" weight={700}>
            {i18n._(t`Yield Farm`)}
          </Typography>
          <Typography variant="sm" weight={400}>
            {i18n._(t`Earn fees and rewards by depositing and staking your tokens to the platform.`)}
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button id="btn-create-new-pool" size="sm">
            <a href="#" target="_blank" rel="noreferrer">
              {i18n._(t`Apply for Yield Farm`)}
            </a>
          </Button>
        </div>
      </TridentHeader>
      <TridentBody>
        <div className="flex flex-col w-full gap-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <SearchPools search={search} term={term} />
            {/* <OnsenFilter /> */}
          </div>
          <FarmList farms={result} />
        </div>
      </TridentBody>
    </>
  )
}
