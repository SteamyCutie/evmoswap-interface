import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { FARMS } from '../../constants/farms'
import { useDashboardContract } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../services/web3'

// Todo: Rewrite in terms of web3 as opposed to subgraph
const useFarms = () => {
    const { chainId } = useActiveWeb3React()

    const [ farms, setFarms ] = useState<any | undefined>()
    const dashboardContract = useDashboardContract()

    const fetchAllFarms = useCallback( async () => {
        // Reset pools list
        const farmingPools = Object.keys( FARMS[ chainId ] ).map( ( key ) => {
            return { ...FARMS[ chainId ][ key ], lpToken: key }
        } )

        // Array Pids
        const poolPids = farmingPools.map( ( pool: any ) => {
            return pool.pid
        } )
        const { tokenPrice, totalTvlInUSD, allocPoint, apy, tvl, tvlInUSD } = await dashboardContract?.infoOfPools( poolPids )
        const farms = farmingPools.map( ( pool: any ) => {
            return {
                ...pool,
                chef: 0,
                type: 'ELP',
                tokenPrice: tokenPrice / 1e18,
                totalTvlInUSD: totalTvlInUSD / 1e18,
                flpBalance: tvl[ pool.id ] / 1e18,
                tvl: tvlInUSD[ pool.id ] / 1e18,
                apr: apy[ pool.id ] / 1e16,
                lpPrice: tvlInUSD[ pool.id ] / tvl[ pool.id ],
                multiplier: Number( allocPoint[ pool.id ] ),
            }
        } )

        // console.log('farms:', farms)
        const sorted = _.orderBy( farms, [ 'multiplier' ], [ 'desc' ] )

        setFarms( { farms: sorted, userFarms: [], stakeFarms: [] } )
    }, [ chainId, dashboardContract ] )

    useEffect( () => {
        fetchAllFarms()
    }, [ fetchAllFarms ] )

    return farms
}

export default useFarms
