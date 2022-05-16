import { CurrencyLogo } from "app/components/CurrencyLogo";
import { useIncentive } from "./hooks";

const FarmIncentiveAmount = ( { incentive, decimals = 0 }: { incentive: string, decimals?: number } ) => {

    const { rewardToken, rewardAmount } = useIncentive( incentive )

    return (
        <div className="flex items-start gap-2">
            <CurrencyLogo currency={ rewardToken } size={ 20 } />
            <div>{ decimals ? rewardAmount?.toFixed( 2 ) : rewardAmount?.toExact() } { rewardToken?.symbol }</div>
        </div>
    )
}

export default FarmIncentiveAmount;