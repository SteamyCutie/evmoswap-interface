import { Ifo, PoolIds } from 'app/constants/types'
import { formatNumber } from 'app/functions'
import { getBalanceNumber } from 'app/functions/formatBalance'
import { PublicIfoData, WalletIfoData } from '../hooks/types'

export interface IfoCardDetailsProps {
    poolId: PoolIds
    ifo: Ifo
    publicIfoData: PublicIfoData
    walletIfoData: WalletIfoData
}

const IfoCardDetails: React.FC<IfoCardDetailsProps> = ( { poolId, ifo, publicIfoData, walletIfoData } ) => {
    const { status, offerToken } = publicIfoData
    const raiseToken = publicIfoData[ poolId ].raiseToken
    const raiseTokenPriceInUSD = publicIfoData[ poolId ].raiseTokenPriceInUSD

    const poolCharacteristic = publicIfoData[ poolId ]
    const walletCharacteristic = walletIfoData[ poolId ]
    const taxRate = `${poolCharacteristic.taxRate}%`

    const totalCommittedPercent = poolCharacteristic.totalAmountPool
        .div( poolCharacteristic.raisingAmountPool )
        .times( 100 )
        .toFixed( 2 )

    // totalCommited
    const totalLPCommitted = getBalanceNumber( poolCharacteristic.totalAmountPool, raiseToken.decimals )
    const totalLPCommittedInUSD = raiseTokenPriceInUSD.times( totalLPCommitted )
    const totalCommitted = `~$${formatNumber( totalLPCommittedInUSD.toNumber() )} ${poolId == 'poolBasic' ? `(${totalLPCommitted} EMO)` : ''
        } (${totalCommittedPercent === 'NaN' ? 0 : totalCommittedPercent}%)`

    // yourCommited
    const yourLPCommitted = getBalanceNumber( walletCharacteristic.amountTokenCommittedInLP, raiseToken.decimals )
    const yourLPCommittedInUSD = raiseTokenPriceInUSD.times( yourLPCommitted )
    const yourCommitted = `~$${formatNumber( yourLPCommittedInUSD.toNumber() )} ${poolId == 'poolBasic' ? `(${yourLPCommitted} EMO)` : ''
        }`

    // pricePerTokenWithFee
    const sumTaxesOverflow = poolCharacteristic.totalAmountPool.times( poolCharacteristic.taxRate ).times( 0.01 )
    const pricePerTokenWithFeeToOriginalRatio = sumTaxesOverflow
        .plus( poolCharacteristic.raisingAmountPool )
        .div( poolCharacteristic.offeringAmountPool )
        .div( poolCharacteristic.raisingAmountPool.div( poolCharacteristic.offeringAmountPool ) )

    const pricePerTokenWithFee = `~$${formatNumber(
        pricePerTokenWithFeeToOriginalRatio.times( ifo.tokenOfferingPrice ).toNumber()
    )}`

    const renderBasedOnIfoStatus = () => {
        if ( status === 'idle' ) {
            return (
                <>
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Funds to raise:</div>
                        <div className="text-sm text-high-emphesis">{ ifo[ poolId ].raiseAmount }</div>
                    </div>
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm text-pink-red">EMO to burn:</div>
                        <div className="text-sm text-pink-red">{ ifo[ poolId ].emoToBurn }</div>
                    </div>
                </>
            )
        }

        if ( status === 'coming_soon' ) {
            return (
                <>
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Funds to raise:</div>
                        <div className="text-sm text-high-emphesis">{ ifo[ poolId ].raiseAmount }</div>
                    </div>

                    { ifo[ poolId ].emoToBurn !== '$0.00' && (
                        <div className="flex justify-between gap-0.5">
                            <div className="text-sm text-pink-red">EMO to burn:</div>
                            <div className="text-sm text-pink-red">{ ifo[ poolId ].emoToBurn }</div>
                        </div>
                    ) }
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Price per { offerToken.symbol }:</div>
                        <div className="text-sm text-high-emphesis">${ ifo.tokenOfferingPrice }</div>
                    </div>
                </>
            )
        }

        if ( status === 'live' ) {
            return (
                <>
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Funds to raise:</div>
                        <div className="text-sm text-high-emphesis">{ ifo[ poolId ].raiseAmount }</div>
                    </div>

                    { ifo[ poolId ].emoToBurn !== '$0.00' && (
                        <div className="flex justify-between gap-0.5">
                            <div className="text-sm text-pink-red">EMO to burn:</div>
                            <div className="text-sm text-pink-red">{ ifo[ poolId ].emoToBurn }</div>
                        </div>
                    ) }

                    { poolId === PoolIds.poolBasic && (
                        <div className="flex justify-between gap-0.5">
                            <div className="text-sm">Price per { offerToken.symbol }:</div>
                            <div className="text-sm text-high-emphesis">${ ifo.tokenOfferingPrice }</div>
                        </div>
                    ) }

                    { poolId === PoolIds.poolUnlimited && (
                        <>
                            <div className="flex justify-between gap-0.5">
                                <div className="text-sm">Additional fee:</div>
                                <div className="text-sm text-high-emphesis">{ taxRate }</div>
                            </div>
                            <div className="flex justify-between gap-0.5">
                                <div className="text-sm">Price per { offerToken.symbol } with fee:</div>
                                <div className="text-sm text-high-emphesis">{ pricePerTokenWithFee }</div>
                            </div>
                        </>
                    ) }

                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Your committed:</div>
                        <div className="text-sm text-high-emphesis">{ yourCommitted }</div>
                    </div>

                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Total committed:</div>
                        <div className="text-sm text-high-emphesis">{ totalCommitted }</div>
                    </div>
                </>
            )
        }

        if ( status === 'finished' ) {
            return (
                <>
                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Funds to raise:</div>
                        <div className="text-sm text-high-emphesis">{ ifo[ poolId ].raiseAmount }</div>
                    </div>

                    { ifo[ poolId ].emoToBurn !== '$0.00' && (
                        <div className="flex justify-between gap-0.5">
                            <div className="text-sm text-pink-red">EMO to burn:</div>
                            <div className="text-sm text-pink-red">{ ifo[ poolId ].emoToBurn }</div>
                        </div>
                    ) }

                    { poolId === PoolIds.poolUnlimited && (
                        <>
                            <div className="flex justify-between gap-0.5">
                                <div className="text-sm">Additional fee:</div>
                                <div className="text-sm text-high-emphesis">{ taxRate }</div>
                            </div>
                            <div className="flex justify-between gap-0.5">
                                <div className="text-sm">Price per { offerToken.symbol } with fee:</div>
                                <div className="text-sm text-high-emphesis">{ pricePerTokenWithFee }</div>
                            </div>
                        </>
                    ) }

                    { poolId === PoolIds.poolBasic && (
                        <div className="flex justify-between gap-0.5">
                            <div className="text-sm">Price per { offerToken.symbol }:</div>
                            <div className="text-sm text-high-emphesis">${ ifo.tokenOfferingPrice }</div>
                        </div>
                    ) }

                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Your committed:</div>
                        <div className="text-sm text-high-emphesis">{ yourCommitted }</div>
                    </div>

                    <div className="flex justify-between gap-0.5">
                        <div className="text-sm">Total committed:</div>
                        <div className="text-sm text-high-emphesis">{ totalCommitted }</div>
                    </div>
                </>
            )
        }
        // return <SkeletonCardDetails />
    }

    return <div className="flex flex-col flex-grow px-4 pb-4 space-y-2">{ renderBasedOnIfoStatus() }</div>
}

export default IfoCardDetails
