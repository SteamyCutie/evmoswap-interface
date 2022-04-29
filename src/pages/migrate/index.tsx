import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'

import Image from 'next/image'
import React, { useEffect } from 'react'
import { useActiveWeb3React } from 'app/services/web3'
import { useNetworkModalToggle } from 'app/state/application/hooks'
import { ChainId } from '@evmoswap/core-sdk'
import { BscNetworkModal } from 'app/modals/NetworkModal/indexBsc'
import { useFaucetContract } from 'app/hooks'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import Button from 'app/components/Button'
import { useTokenBalance } from 'state/wallet/hooks'
import QuestionHelper from 'app/components/QuestionHelper'

// const ZERO = JSBI.BigInt(0)

// const AmountInput = ({ state }: { state: MigrateState }) => {
//   const { i18n } = useLingui()
//   const onPressMax = useCallback(() => {
//     if (state.selectedLPToken) {
//       let balance = state.selectedLPToken.balance.quotient
//       if (state.selectedLPToken.address === AddressZero) {
//         // Subtract 0.01 ETH for gas fee
//         const fee = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))
//         balance = JSBI.greaterThan(balance, fee) ? JSBI.subtract(balance, fee) : ZERO
//       }

//       state.setAmount(formatUnits(balance.toString(), state.selectedLPToken.decimals))
//     }
//   }, [state])

//   useEffect(() => {
//     if (!state.mode || state.lpTokens.length === 0 || !state.selectedLPToken) {
//       state.setAmount('')
//     }
//   }, [state])

//   if (!state.lpTokens.length) {
//     return null
//   }

//   if (!state.mode || !state.selectedLPToken) {
//     return (
//       <>
//         <Typography variant="sm" className="text-secondary">
//           Amount of Tokens
//         </Typography>
//         <div className="p-3 text-center rounded cursor-not-allowed bg-dark-800">
//           <Typography variant="lg" className="text-secondary">
//             {state.mode && state.lpTokens.length === 0 ? 'No LP tokens found' : 'Select an LP Token'}
//           </Typography>
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Typography variant="sm" className="text-secondary">
//         {i18n._(t`Amount of Tokens`)}
//       </Typography>

//       <div className="relative flex items-center w-full mb-4">
//         <Input.Numeric
//           className="w-full p-3 rounded bg-dark-700 focus:ring focus:ring-pink"
//           value={state.amount}
//           onUserInput={(val: string) => state.setAmount(val)}
//         />
//         <Button
//           variant="outlined"
//           color="pink"
//           size="xs"
//           onClick={onPressMax}
//           className="absolute right-4 focus:ring focus:ring-pink"
//         >
//           {i18n._(t`MAX`)}
//         </Button>
//       </div>
//     </>
//   )
// }

// interface PositionCardProps {
//   lpToken: LPToken
//   onToggle: (lpToken: LPToken) => void
//   isSelected: boolean
//   updating: boolean
//   exchange: string | undefined
// }

// const LPTokenSelect = ({ lpToken, onToggle, isSelected, updating, exchange }: PositionCardProps) => {
//   return (
//     <div
//       key={lpToken.address}
//       className="flex items-center justify-between px-3 py-5 rounded cursor-pointer bg-dark-800 hover:bg-dark-700"
//       onClick={() => onToggle(lpToken)}
//     >
//       <div className="flex items-center space-x-3">
//         <DoubleCurrencyLogo currency0={lpToken.tokenA} currency1={lpToken.tokenB} size={20} />
//         <Typography
//           variant="lg"
//           className="text-primary"
//         >{`${lpToken.tokenA.symbol}/${lpToken.tokenB.symbol}`}</Typography>
//         {lpToken.version && <Chip color="purple" label={lpToken.version} />}
//       </div>
//       {isSelected ? <XIcon width={16} height={16} /> : <ChevronDownIcon width={16} height={16} />}
//     </div>
//   )
// }

// const MigrateModeSelect = ({ state }: { state: MigrateState }) => {
//   const { i18n } = useLingui()
//   function toggleMode(mode = undefined) {
//     state.setMode(mode !== state.mode ? mode : undefined)
//   }

//   const items = [
//     {
//       key: 'permit',
//       text: i18n._(t`Non-hardware Wallet`),
//       description: i18n._(t`Migration is done in one-click using your signature (permit)`),
//     },
//     {
//       key: 'approve',
//       text: i18n._(t`Hardware Wallet`),
//       description: i18n._(t`You need to first approve LP tokens and then migrate it`),
//     },
//   ]

//   return (
//     <>
//       {items.reduce((acc: any, { key, text, description }: any) => {
//         if (state.mode === undefined || key === state.mode)
//           acc.push(
//             <div
//               key={key}
//               className="flex items-center justify-between p-3 rounded cursor-pointer bg-dark-800 hover:bg-dark-700"
//               onClick={() => toggleMode(key)}
//             >
//               <div>
//                 <div>
//                   <Typography variant="sm">{text}</Typography>
//                 </div>
//                 <div>
//                   <Typography variant="sm" className="text-secondary">
//                     {description}
//                   </Typography>
//                 </div>
//               </div>
//               {key === state.mode ? <XIcon width={16} height={16} /> : <ChevronDownIcon width={16} height={16} />}
//             </div>
//           )
//         return acc
//       }, [])}
//     </>
//   )
// }

// const MigrateButtons = ({ state, exchange }: { state: MigrateState; exchange: string | undefined }) => {
//   const { i18n } = useLingui()

//   const [error, setError] = useState<MetamaskError>({})
//   const sushiRollContract = useSushiRollContract(
//     state.selectedLPToken?.version ? state.selectedLPToken?.version : undefined
//   )
//   // console.log(
//   //   'sushiRollContract address',
//   //   sushiRollContract?.address,
//   //   state.selectedLPToken?.balance,
//   //   state.selectedLPToken?.version
//   // )

//   const [approval, approve] = useApproveCallback(state.selectedLPToken?.balance, sushiRollContract?.address)
//   const noLiquidityTokens = !!state.selectedLPToken?.balance && state.selectedLPToken?.balance.equalTo(ZERO)
//   const isButtonDisabled = !state.amount

//   useEffect(() => {
//     setError({})
//   }, [state.selectedLPToken])

//   if (!state.mode || state.lpTokens.length === 0 || !state.selectedLPToken || !state.amount) {
//     return (
//       <Button fullWidth disabled={true}>
//         Migrate
//       </Button>
//     )
//   }

//   const insufficientAmount = JSBI.lessThan(
//     state.selectedLPToken.balance.quotient,
//     JSBI.BigInt(parseUnits(state.amount || '0', state.selectedLPToken.decimals).toString())
//   )

//   const onPress = async () => {
//     setError({})
//     try {
//       await state.onMigrate()
//     } catch (error) {
//       console.log(error)
//       // @ts-ignore TYPE NEEDS FIXING
//       setError(error)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {insufficientAmount ? (
//         <div className="text-sm text-primary">{i18n._(t`Insufficient Balance`)}</div>
//       ) : state.loading ? (
//         <Dots>{i18n._(t`Loading`)}</Dots>
//       ) : (
//         <>
//           <div className="flex justify-between">
//             <div className="text-sm text-secondary">
//               {i18n._(t`Balance`)}:{' '}
//               <span className="text-primary">{state.selectedLPToken.balance.toSignificant(4)}</span>
//             </div>
//           </div>
//           {state.mode === 'approve' && (
//             <Button
//               fullWidth
//               loading={approval === ApprovalState.PENDING}
//               onClick={approve}
//               disabled={approval !== ApprovalState.NOT_APPROVED || isButtonDisabled}
//             >
//               {approval === ApprovalState.APPROVED ? i18n._(t`Approved`) : i18n._(t`Approve`)}
//             </Button>
//           )}
//           {((state.mode === 'approve' && approval === ApprovalState.APPROVED) || state.mode === 'permit') && (
//             <Button
//               fullWidth
//               loading={state.isMigrationPending}
//               disabled={noLiquidityTokens || state.isMigrationPending || isButtonDisabled}
//               onClick={onPress}
//             >
//               {i18n._(t`Migrate`)}
//             </Button>
//           )}
//         </>
//       )}
//       {error.message && error.code !== USER_REJECTED_TX && (
//         <div className="font-medium text-center text-red">{error.message}</div>
//       )}
//       <div className="text-sm text-center text-low-emphesis">
//         {i18n._(
//           t`Your ${exchange} ${state.selectedLPToken.tokenA.symbol}/${state.selectedLPToken.tokenB.symbol} liquidity will become SushiSwap ${state.selectedLPToken.tokenA.symbol}/${state.selectedLPToken.tokenB.symbol} liquidity.`
//         )}
//       </div>
//     </div>
//   )
// }

export default function Migrate() {
  const { chainId } = useActiveWeb3React()
  const toggleNetworkModal = useNetworkModalToggle()
  const addTransaction = useTransactionAdder()

  return (
    <div>
      <div className='mt-16 text-5xl text-white'>Migrate Liquidity</div>
    </div>
  )
}
