import { CurrencyLogo } from "app/components/CurrencyLogo";
import { useIncentive } from "./hooks";

const FarmIncentiveAmount = ( { incentive }: { incentive: string } ) => {

    const { rewardToken, rewardAmount } = useIncentive( incentive )

    return (
        <div className="flex items-start gap-2">
            <CurrencyLogo currency={ rewardToken } size={ 20 } />
            <div>{ rewardAmount?.toFixed( 2 ) } { rewardToken?.symbol }</div>
        </div>
    )
}

export default FarmIncentiveAmount;