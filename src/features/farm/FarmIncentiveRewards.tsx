import FarmIncentiveAmount from "./FarmIncentiveAmount";

const FarmIncentiveRewards = ( { incentives, decimals }: { incentives?: string[], decimals?: number } ) => {

    if ( !incentives ) return null;

    return (
        <div className="flex flex-col">
            {
                incentives && incentives.map( ( incentive, index ) => (
                    <FarmIncentiveAmount incentive={ incentive } decimals={ decimals } key={ index } />
                ) )
            }
        </div>
    )
}

export default FarmIncentiveRewards;