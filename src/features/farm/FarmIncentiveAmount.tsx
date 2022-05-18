import { CurrencyLogo } from "app/components/CurrencyLogo";
import { classNames } from "app/functions";
import { useIncentive } from "./hooks";

const FarmIncentiveAmount = ( { incentive, decimals = 0, className = '' }: { incentive: string, decimals?: number, className?: string } ) => {

    const { rewardToken, rewardAmount } = useIncentive( incentive )

    return (
        <div className={ classNames( "flex items-start gap-2", className ) }>
            <CurrencyLogo currency={ rewardToken } size={ 20 } />
            <div>{ decimals ? rewardAmount?.toFixed( 2 ) : rewardAmount?.toExact() } { rewardToken?.symbol }</div>
        </div>
    )
}

export default FarmIncentiveAmount;