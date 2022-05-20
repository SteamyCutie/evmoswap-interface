import { CurrencyAmount, Token } from '@evmoswap/core-sdk'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Dots from 'app/components/Dots'
import Empty from 'app/components/Empty'
import QuestionHelper from 'app/components/QuestionHelper'
import { RowBetween } from 'app/components/Row'
import { StablePoolInfo } from 'app/constants/pools'
import { classNames, formatNumber, formatNumberPercentage } from 'app/functions'
import { useTotalSupply } from 'app/hooks/useTotalSupply'
import { useActiveWeb3React } from 'app/services/web3'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { useMemo } from 'react'
import { useStableTokenToReceive } from '../hooks'

const StablePoolPosition = ( { poolInfo, className = '' }: { poolInfo: StablePoolInfo, className?: string } ) => {

    const { account, chainId } = useActiveWeb3React()
    const poolId = poolInfo?.pid;

    const isLoading = poolInfo?.isLoading
    const tokens = poolInfo?.pooledTokensInfo?.tokens

    const balance = useTokenBalance( account, poolInfo.lpTokenInstance );

    const totalLpSupply = useTotalSupply( balance?.currency )

    const estimatedSLPs = useStableTokenToReceive( poolId, balance );
    const liquidityTokensValue = useMemo( () => {

        if ( !estimatedSLPs || !tokens ) return;

        return estimatedSLPs.map( ( estimate, index ) => {
            return CurrencyAmount.fromRawAmount( tokens[ index ], estimate ?? "0" )
        } )

    }, [ estimatedSLPs, tokens ] )


    return (
        <>
            { isLoading && (
                <Empty>
                    <Dots>{ i18n._( t`Loading` ) }</Dots>
                </Empty>
            ) }

            { !isLoading && (
                <div className={ classNames( 'px-4 py-4 space-y-1 text-sm rounded text-high-emphesis bg-dark-900', className ) }>
                    <RowBetween>
                        <div>{ i18n._( t`Your total pool tokens` ) }:</div>
                        <div className="font-semibold">{ formatNumber( balance?.toExact(), false, false, 6 ) }</div>
                    </RowBetween>

                    {
                        liquidityTokensValue && liquidityTokensValue.map( ( token, index ) =>
                            <RowBetween key={ index }>
                                <div className='flex items-center space-x-4'>
                                    { i18n._( t`Pooled ${token?.currency?.symbol}` ) }
                                    <div className='mx-1'>
                                        <QuestionHelper
                                            text={ i18n._( t`Estimated from liquidity token` ) }
                                        />
                                    </div>:
                                </div>
                                <div className="font-semibold">{ formatNumber( token?.toExact(), false, false, 6 ) }</div>
                            </RowBetween>
                        )
                    }

                    <RowBetween>
                        <div>{ i18n._( t`Your pool share` ) }:</div>
                        <div className="font-semibold">{ formatNumberPercentage( balance?.toExact(), totalLpSupply?.toExact() ) }</div>
                    </RowBetween>
                </div>
            ) }
        </>
    )
}

export default StablePoolPosition;