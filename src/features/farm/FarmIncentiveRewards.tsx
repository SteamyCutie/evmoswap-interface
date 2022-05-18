import FarmIncentiveAmount from "./FarmIncentiveAmount";

const FarmIncentiveRewards = ( { incentives, decimals, className = '' }: { incentives?: string[], decimals?: number, className?: string } ) => {

    if ( !incentives ) return null;

    return (
        <div className="flex flex-col">
            {
                incentives && incentives.map( ( incentive, index ) => (
                    <FarmIncentiveAmount incentive={ incentive } decimals={ decimals } key={ index } className={ className } />
                ) )
            }
        </div>
    )
}

export default FarmIncentiveRewards;