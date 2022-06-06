import React, { useState } from 'react'
import { useActiveWeb3React } from 'app/services/web3'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import { useCurrency } from 'app/hooks/Tokens'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import {
    classNames,
    formatNumber,
    formatPercent,
    formatNumberScale,
    getExplorerLink,
    tryParseAmount,
} from 'app/functions'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
import IncentivePoolItemDetail from './IncentivePoolItemDetail'
import { usePendingReward, usePoolsInfo, useUserInfo } from './hooks'
import { CalculatorIcon } from '@heroicons/react/solid'
import ROICalculatorModal from 'app/components/ROICalculatorModal'
import NumericalInput from 'app/components/NumericalInput'
import Button from 'app/components/Button'
import Dots from 'app/components/Dots'
import { getAddress } from '@ethersproject/address'
import { SUSHI, ZERO } from '@evmoswap/core-sdk'
import { useTokenBalance } from 'state/wallet/hooks'
import useSmartChef from './useSmartChef'
import Typography from 'app/components/Typography'
import { ExternalLink as LinkIcon } from 'react-feather'
import ExternalLink from 'app/components/ExternalLink'
import QuestionHelper from 'app/components/QuestionHelper'

const IncentivePoolCardItem = ( { pool, ...rest } ) => {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    let stakingToken = useCurrency( pool.stakingToken?.id )
    let earningToken = useCurrency( pool.earningToken?.id )

    const { apr, endInBlock, bonusEndBlock, totalStaked, stakingTokenPrice, earningTokenPrice } = usePoolsInfo( pool )

    const pendingReward = usePendingReward( pool, earningToken )
    const emoBalance = useTokenBalance( account ?? undefined, SUSHI[ chainId ] )
    // const balance = Number(emoBalance?.toSignificant(8))
    const balance = useTokenBalance( account, SUSHI[ chainId ] )
    const [ showCalc, setShowCalc ] = useState( false )
    const [ withdrawValue, setWithdrawValue ] = useState( '' )

    const [ pendingTx, setPendingTx ] = useState( false )
    const [ depositValue, setDepositValue ] = useState( '' )
    const [ activeTab, setActiveTab ] = useState( 0 )

    const tabStyle =
        'flex justify-center items-center text-center h-full w-full rounded-lg px-2 py-1 cursor-pointer text-sm text-sm'
    const activeTabStyle = `${tabStyle} text-high-emphesis font-bold bg-blue/80`
    const inactiveTabStyle = `${tabStyle} text-secondary`

    const typedDepositValue = tryParseAmount( depositValue, stakingToken )
    const typedWithdrawValue = tryParseAmount( withdrawValue, stakingToken )

    const addTransaction = useTransactionAdder()
    const { deposit, withdraw, emergencyWithdraw, harvest } = useSmartChef( pool )
    const { amount } = useUserInfo( pool, stakingToken )
    const [ approvalState, approve ] = useApproveCallback( typedDepositValue, pool.smartChef )

    const userMaxStake = tryParseAmount( '30000', stakingToken ).subtract(
        tryParseAmount( amount && amount?.greaterThan( 0 ) ? amount.toFixed( stakingToken?.decimals ) : '0.000001', stakingToken )
    )

    return (
        // <Disclosure>
        //   {({ open }) => (
        //     <div>
        //       <Disclosure.Button
        //         className={classNames(
        //           open && 'rounded-b-none',
        //           'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-light dark:bg-dark text-primary text-sm md:text-lg'
        //         )}
        //       >
        //         <div className="flex gap-x-2">
        //           {/* Token logo */}
        //           <div className="flex items-center w-1/2 col-span-2 space-x-4 lg:gap-5 lg:w-3/12 lg:col-span-1">
        //             {/* <DoubleLogo currency0={token0} currency1={token1} size={window.innerWidth > 768 ? 40 : 24} /> */}
        //             {stakingToken && earningToken && (
        //               <CurrencyLogoArray
        //                 currencies={[earningToken, stakingToken]}
        //                 dense
        //                 size={window.innerWidth > 968 ? 40 : 28}
        //               />
        //             )}
        //             <div className="flex flex-col justify-center">
        //               <div className="text-sm font-bold md:text-base">Earn {earningToken?.symbol}</div>
        //               {formatNumber(pendingReward?.toFixed(earningToken?.decimals)) != '0' ? (
        //                 <div className="text-sm text-blue">{i18n._(t`STAKING EMO`)}</div>
        //               ) : (
        //                 <div className="text-sm text-gray">{i18n._(t`Stake EMO`)}</div>
        //               )}
        //             </div>
        //           </div>

        //           {/* Earned */}
        //           <div className="flex flex-col justify-center w-2/12 space-y-1">
        //             <div className="text-sm md:text-[14px] text-secondary">{i18n._(t`Earned`)}</div>
        //             <div className="text-sm font-bold md:text-base">
        //               {formatNumber(pendingReward?.toFixed(earningToken?.decimals))}
        //             </div>
        //           </div>

        //           {/* Total staked */}
        //           <div className="flex-col justify-center hidden space-y-1 lg:w-2/12 lg:block">
        //             <div className="text-sm md:text-[14px] text-secondary">{i18n._(t`Total staked`)}</div>
        //             <div className="text-sm font-bold md:text-base">
        //               {formatNumber(totalStaked?.toFixed(stakingToken?.decimals))} {stakingToken?.symbol}
        //             </div>
        //           </div>

        //           {/* APR */}
        //           <div className="flex flex-col justify-center w-3/12 space-y-1 lg:w-2/12">
        //             <div className="text-sm md:text-[14px] text-secondary">APR</div>
        //             <div className="flex items-center" onClick={() => setShowCalc(true)}>
        //               <div className="text-sm font-bold md:text-base">{formatPercent(apr)} </div>
        //               <CalculatorIcon className="w-5 h-5" />
        //             </div>
        //             <ROICalculatorModal
        //               isfarm={false}
        //               isOpen={showCalc}
        //               onDismiss={() => setShowCalc(false)}
        //               showBoost={false}
        //               showCompound={false}
        //               name={'EMO'}
        //               apr={apr}
        //               Lpbalance={balance}
        //               earningTokenPrice={Number(earningTokenPrice?.toFixed(18))}
        //               earningTokenName={earningToken?.symbol}
        //             />
        //           </div>

        //           {/* Ends in */}
        //           <div className="flex-col justify-center hidden space-y-1 lg:w-2/12 lg:block">
        //             <div className="flex items-center text-sm md:text-[14px] text-secondary">{i18n._(t`Ends in`)}</div>
        //             <div className="text-sm font-bold md:text-base">{formatNumber(endInBlock)} blocks</div>
        //           </div>

        //           <div className="flex flex-col items-center justify-center lg:w-1/12">
        //             <ChevronDownIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`} />
        //           </div>
        //         </div>
        //       </Disclosure.Button>

        //       {open && (
        //         <IncentivePoolItemDetail
        //           pool={pool}
        //           pendingReward={pendingReward}
        //           stakingTokenPrice={stakingTokenPrice}
        //           earningTokenPrice={earningTokenPrice}
        //           endInBlock={endInBlock}
        //           bonusEndBlock={bonusEndBlock}
        //         />
        //       )}
        //     </div>
        //   )}
        // </Disclosure>
        <div className="grid select-none bg-light dark:bg-dark text-[#C3C6C7] rounded text-left text-sm">
            <div className="grid p-6 pb-3 gap-y-2">
                <div className="flex items-center justify-between">
                    <p>
                        { i18n._( t`Pool` ) } #<b>{ stakingToken?.symbol }</b>-<b>{ earningToken?.symbol }</b>
                    </p>
                    <p className="flex gap-2">
                        APR <b className="text-white">{ formatPercent( apr ) }</b>
                    </p>
                </div>
                <div className="flex gap-2 items-center text-base">
                    { stakingToken && earningToken && (
                        <CurrencyLogoArray currencies={ [ earningToken, stakingToken ] } dense size={ 36 } />
                    ) }
                    { i18n._( t`Stake` ) } <b>{ stakingToken?.symbol }</b> { i18n._( t`to Earn` ) } <b>{ earningToken?.symbol }</b>
                </div>
                <div className="flex items-center justify-between">
                    <div className="grid">
                        <p>
                            <b>{ earningToken?.symbol }</b> { i18n._( t`Earned` ) }
                        </p>
                        <div className="flex items-center gap-1">
                            <div className="text-xl font-bold">{ formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) }</div>
                            <div className="text-sm">
                                (~
                                { formatNumber(
                                    Number( pendingReward?.toFixed( earningToken?.decimals ) ) * Number( earningTokenPrice?.toFixed( 18 ) ),
                                    true
                                ) }
                                )
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-5/12 pl-4 align-middle gap-y-1">
                        <Button
                            color={ Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 ? 'blue' : 'gradient' }
                            size="sm"
                            className="w-full"
                            variant={
                                Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 ? 'outlined' : 'filled'
                            }
                            disabled={ Number( formatNumber( pendingReward?.toFixed( earningToken?.decimals ) ) ) <= 0 }
                            onClick={ async () => {
                                setPendingTx( true )
                                try {
                                    const tx = await harvest()
                                    addTransaction( tx, {
                                        summary: `${i18n._( t`Harvest` )} ${earningToken?.symbol}`,
                                    } )
                                } catch ( error ) {
                                    console.error( error )
                                }
                                setPendingTx( false )
                            } }
                        >
                            { i18n._( t`Harvest` ) }
                        </Button>
                    </div>
                </div>
            </div>
            <hr className="w-full border-[#303336]" />
            <div className="grid p-6 py-3 gap-y-2 mb-1">
                <div className="flex m-auto mb-2 rounded md:m-0 w-full h-12 bg-light-secondary dark:bg-dark-secondary">
                    <div className="w-6/12 h-full p-1" onClick={ () => setActiveTab( 0 ) }>
                        <div className={ activeTab === 0 ? activeTabStyle : inactiveTabStyle }>
                            <p>Staking</p>
                        </div>
                    </div>
                    <div className="w-6/12 h-full p-1" onClick={ () => setActiveTab( 1 ) }>
                        <div className={ activeTab === 1 ? activeTabStyle : inactiveTabStyle }>
                            <p>Withdraw</p>
                        </div>
                    </div>
                </div>
                <div className={ `text-center ${activeTab === 0 ? 'grid' : 'hidden'}` }>
                    { account && (
                        <div className="flex flex-row justify-start items-center mb-2 text-secondary">
                            <div className="pr-2 text-left cursor-pointer">
                                { i18n._( t`Balance` ) }: { formatNumberScale( balance?.toSignificant( 6, undefined, 2 ) ?? 0, false, 4 ) }
                                { stakingTokenPrice && balance
                                    ? ` (` +
                                    formatNumberScale( stakingTokenPrice.toFixed( 18 ) * Number( balance?.toFixed( 18 ) ?? 0 ), true ) +
                                    `)`
                                    : `` }
                            </div>
                            { pool.pid === 0 && (
                                <QuestionHelper text={ `Max stake per user: ${userMaxStake?.toFixed( 2 )} ${stakingToken.symbol}s` } />
                            ) }
                        </div>
                    ) }
                    <div className="relative flex items-center mb-2 w-full">
                        <NumericalInput
                            className="w-full px-3 py-2 pr-4 rounded-lg bg-dark-700 focus:ring focus:ring-dark-purple"
                            value={ depositValue }
                            onUserInput={ setDepositValue }
                        />
                        { account && (
                            <Button
                                variant="outlined"
                                color="blue"
                                size="xs"
                                onClick={ () => {
                                    if ( !balance?.equalTo( ZERO ) ) {
                                        setDepositValue(
                                            pool.pid === 0
                                                ? Number( balance?.toFixed( stakingToken?.decimals ) ?? 0 ) < 30000
                                                    ? balance?.toFixed( stakingToken?.decimals )
                                                    : userMaxStake?.toFixed( stakingToken?.decimals )
                                                : balance?.toFixed( stakingToken?.decimals )
                                        )
                                    }
                                } }
                                className="absolute border-0 right-2 rounded focus:ring focus:ring-light-purple"
                            >
                                { i18n._( t`MAX` ) }
                            </Button>
                        ) }
                    </div>
                    { approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING ? (
                        <Button
                            className="w-full"
                            style={ { paddingTop: '0.5rem', paddingBottom: '0.5rem' } }
                            color="gradient"
                            disabled={ approvalState === ApprovalState.PENDING }
                            onClick={ approve }
                        >
                            { approvalState === ApprovalState.PENDING ? <Dots>{ i18n._( t`Approving` ) }</Dots> : i18n._( t`Approve` ) }
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            style={ { paddingTop: '0.5rem', paddingBottom: '0.5rem' } }
                            color="blue"
                            disabled={
                                pendingTx ||
                                !typedDepositValue ||
                                ( pool.pid === 0 && Number( depositValue ) > 30000 ) ||
                                balance?.lessThan( typedDepositValue )
                            }
                            onClick={ async () => {
                                setPendingTx( true )
                                try {
                                    // KMP decimals depend on asset, SLP is always 18
                                    const tx = await deposit( depositValue.toBigNumber( stakingToken?.decimals ) )

                                    addTransaction( tx, {
                                        summary: `${i18n._( t`Deposit` )} ${stakingToken?.symbol}`,
                                    } )
                                } catch ( error ) {
                                    console.error( error )
                                }
                                setPendingTx( false )
                            } }
                        >
                            { i18n._( t`Stake` ) }
                        </Button>
                    ) }
                </div>
                <div className={ `text-center ${activeTab === 1 ? 'grid' : 'hidden'}` }>
                    { account && (
                        <div className="pr-4 mb-2 text-left cursor-pointer text-secondary">
                            { i18n._( t`Your Staked` ) }: { formatNumberScale( amount?.toSignificant( 6 ) ?? 0, false, 4 ) }
                            { stakingTokenPrice && amount
                                ? ` (` +
                                formatNumberScale( stakingTokenPrice.toFixed( 18 ) * Number( amount?.toSignificant( 18 ) ?? 0 ), true ) +
                                `)`
                                : `` }
                        </div>
                    ) }
                    <div className="relative flex items-center w-full mb-2">
                        <NumericalInput
                            className="w-full px-3 py-2 pr-4 rounded-lg bg-dark-700 focus:ring focus:ring-light-purple"
                            value={ withdrawValue }
                            onUserInput={ setWithdrawValue }
                        />
                        { account && (
                            <Button
                                variant="outlined"
                                color="blue"
                                size="xs"
                                onClick={ () => {
                                    if ( !amount?.equalTo( ZERO ) ) {
                                        setWithdrawValue( amount?.toFixed( stakingToken?.decimals ) )
                                    }
                                } }
                                className="absolute border-0 right-2 focus:ring focus:ring-light-purple"
                            >
                                { i18n._( t`MAX` ) }
                            </Button>
                        ) }
                    </div>
                    <Button
                        className="w-full"
                        style={ { paddingTop: '0.5rem', paddingBottom: '0.5rem' } }
                        color="blue"
                        disabled={ pendingTx || !typedWithdrawValue || amount?.lessThan( typedWithdrawValue ) }
                        onClick={ async () => {
                            setPendingTx( true )
                            try {
                                const tx = pool.isFinished
                                    ? await emergencyWithdraw()
                                    : await withdraw( withdrawValue.toBigNumber( stakingToken?.decimals ) )
                                addTransaction( tx, {
                                    summary: `${i18n._( t`Withdraw` )} ${stakingToken?.symbol}`,
                                } )
                            } catch ( error ) {
                                console.error( error )
                            }
                            setPendingTx( false )
                        } }
                    >
                        { i18n._( t`Unstake` ) }
                    </Button>
                </div>
            </div>
            <hr className="w-full border-[#303336]" />
            <div className="grid p-6 pt-3 gap-y-1">
                <div className="flex items-center justify-between">
                    <p>{ i18n._( t`Ends in` ) }</p>
                    <p className="text-primary">
                        <b>{ formatNumber( endInBlock ) }</b> blocks
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <p>{ i18n._( t`Total Staked` ) }</p>
                    <p className="text-primary">
                        <b>{ formatNumber( totalStaked?.toFixed( stakingToken?.decimals ) ) }</b> { stakingToken?.symbol }
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <ExternalLink
                        startIcon={ <LinkIcon size={ 16 } /> }
                        href={ chainId && getExplorerLink( chainId, pool.smartChef, 'address' ) }
                    >
                        <Typography variant="sm">{ i18n._( t`View Contract` ) }</Typography>
                    </ExternalLink>
                    <ExternalLink startIcon={ <LinkIcon size={ 16 } /> } href={ pool.projectLink }>
                        <Typography variant="sm">View Project Site</Typography>
                    </ExternalLink>
                </div>
            </div>
        </div>
    )
}

export default IncentivePoolCardItem
