import FarmIncentiveAmount from "./FarmIncentiveAmount";

const FarmIncentiveRewards = ( { incentives }: { incentives?: string[] } ) => {

    if ( !incentives ) return null;

    return (
        <div className="flex flex-col">
            {
                incentives && incentives.map( ( incentive, index ) => (
                    <FarmIncentiveAmount incentive={ incentive } key={ index } />
                ) )
            }
        </div>
    )
}

export default FarmIncentiveRewards;