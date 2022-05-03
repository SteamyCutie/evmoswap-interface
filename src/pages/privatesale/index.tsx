import React, { useEffect, useState, useRef } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { NATIVE } from '@evmoswap/core-sdk'
import Button from 'components/Button'
import Dots from 'components/Dots'
import Loader from 'components/Loader'
import { useActiveWeb3React } from 'services/web3'
// import {
//   useClaimCallback as useProtocolClaimCallback,
//   useUserUnclaimedAmount as useUserUnclaimedProtocolAmount,
// } from 'state/claim/protocol/hooks'
// import { useModalOpen, useToggleSelfClaimModal } from 'state/application/hooks'
// import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
// import { ApplicationModal } from 'state/application/actions'
// import { getBalanceNumber } from 'functions/formatBalance'
import { usePrivateSaleContract } from 'hooks/useContract'
import { GetEMOPrice } from 'app/features/staking/useStaking'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CheckIcon } from '@heroicons/react/solid'
import ProgressBar from 'app/components/ProgressBar'
import NumericalInput from 'app/components/NumericalInput'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { USDC } from 'app/config/tokens'
import { prisaleToken } from 'app/constants/prisale'
import { tryParseAmount } from 'app/functions'
import { useApproveCallback, ApprovalState } from 'app/hooks'
import { PRIVATE_SALE_ADDRESS } from 'app/constants/addresses'
import { useETHBalances } from 'app/state/wallet/hooks'

const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
const activeTabStyle = `${tabStyle} text-high-emphaise font-bold bg-dark-900`
const inactiveTabStyle = `${tabStyle} text-secondary`

export default function Prisale() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const [toggle, setToggle] = useState(true)
  const [investValue, setInvestValue] = useState('')
  const userEthBalanceBignumber = useETHBalances(account ? [account] : [])?.[account ?? '']
  const nativeBalance = Number(userEthBalanceBignumber?.toExact())
  const usdcBalance = Number(useTokenBalance(account ?? undefined, USDC[chainId])?.toSignificant(8))
  const usdcBalanceBignumber = useTokenBalance(account ?? undefined, USDC[chainId])
  const tokenBalance = Number(useTokenBalance(account ?? undefined, prisaleToken[chainId])?.toSignificant(8))
  const emoPrice = GetEMOPrice()
  const prisaleContract = usePrivateSaleContract()

  const parsedStakeAmount = tryParseAmount(
    investValue ? Number(investValue).toFixed(6) : '0.01',
    usdcBalanceBignumber?.currency
  )
  const [approvalState, approve] = useApproveCallback(parsedStakeAmount, PRIVATE_SALE_ADDRESS[chainId])

  const isWhitelisted = useRef(false)
  const purchasedToken = useRef(0)
  const claimableToken = useRef(0)
  const minTokensAmount = useRef([0, 0])
  const maxTokensAmount = useRef([0, 0])
  const privateSaleStart = useRef(0)
  const privateSaleEnd = useRef(0)
  const basePrice = useRef(0)
  const tokenPrice = useRef(0)
  const vestingStart = useRef(0)
  const total_purchased = useRef([0,0])
  const getData = async () => {
    if (!account) return
    tokenPrice.current = await prisaleContract.tokenPrice()
    basePrice.current = await prisaleContract.basePrice()
    minTokensAmount.current = [
      ((Number(await prisaleContract.minTokensAmount()) / 1e18) * Number(tokenPrice.current)) / Number(basePrice.current),
      ((Number(await prisaleContract.minTokensAmount()) / 1e18) * tokenPrice.current) / 10 ** 6,
    ]
    maxTokensAmount.current = [
      ((Number(await prisaleContract.maxTokensAmount()) / 1e18) * Number(tokenPrice)) / Number(basePrice.current),
      ((Number(await prisaleContract.maxTokensAmount()) / 1e18) * tokenPrice.current) / 10 ** 6,
    ]
    privateSaleStart.current = Number(await prisaleContract.privateSaleStart())
    privateSaleEnd.current = Number(await prisaleContract.privateSaleEnd())
    isWhitelisted.current = await prisaleContract.whitelisted(account)
    purchasedToken.current = Number(await prisaleContract.purchased(account))
    claimableToken.current = Number(await prisaleContract.claimable(account))
    vestingStart.current = Number(await prisaleContract.vestingStart())
    total_purchased.current = [Number(await prisaleContract.privateSaleTokenPool()), Number(await prisaleContract.purchasedPrivateSale())]
  }
  getData()

  const currentTime = Number((new Date().getTime() / 1e3).toFixed(0))
  const remainingDay = Math.floor((privateSaleEnd.current - currentTime) / 86400)
  const remainingHour = Math.floor((privateSaleEnd.current - currentTime - remainingDay * 86400) / 3600)
  const remainingMin = Math.floor(
    (privateSaleEnd.current - currentTime - remainingDay * 86400 - remainingHour * 3600) / 60
  )
  const [pendingTx, setPendingTx] = useState(false)
  const lowerLimitError = Number(investValue) < (toggle ? minTokensAmount.current[0] : minTokensAmount.current[1])
  const upperLimitError = Number(investValue) + purchasedToken.current / 1e18 * (tokenPrice.current / 1e6) > (toggle ? maxTokensAmount.current[0] : maxTokensAmount.current[1])
  const [showLimitTips, setshowLimitTips] = useState(false)
  const handleBuyTokenWithUSDC = async () => {
    setPendingTx(true)
    try {
      const args = [USDC[chainId].address, Number(investValue) * 10 ** 6]
      const tx = await prisaleContract.purchaseTokenWithCoin(...args)
      addTransaction(tx, {
        summary: `${i18n._(t`Buy`)} ${prisaleToken[chainId].symbol}`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  const handleBuyTokenWithNATIVE = async () => {
    setPendingTx(true)
    try {
      const args = []
      const tx = await prisaleContract.purchaseTokenWithETH(...args)
      addTransaction(tx, {
        summary: `${i18n._(t`Buy`)} ${prisaleToken[chainId].symbol}`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  const handleClaim = async () => {
    setPendingTx(true)
    try {
      const tx = await prisaleContract.claim()
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} ${prisaleToken[chainId].symbol}`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  useEffect(() => setshowLimitTips(false), [toggle, investValue])

  return (
    <div className="w-5/6 mt-20 md:max-w-5xl">
      <div className="flex justify-between h-[84px] gap-1 mb-5 md:h-24 md:gap-4">
        <div className="w-1/2 h-full px-4 py-2 my-auto space-y-1 text-left rounded-lg md:py-4 sm:space-y-2 md:px-10 bg-black-russian">
          {currentTime - privateSaleStart.current < 0 ? (
            <div className="inline-block text-2xl font-bold text-white align-middle lg:text-3xl">
              Private Sale not started
            </div>
          ) : privateSaleEnd.current - currentTime > 0 ? (
            <>
              <div className="text-base md:text-lg">Remaining time</div>
              <div className="text-sm font-bold text-white md:text-xl lg:text-2xl">{`${remainingDay} Day ${remainingHour} Hour ${remainingMin} Mins`}</div>
            </>
          ) : (
            <div className="inline-block text-2xl font-bold text-white align-middle lg:text-3xl">
              Private Sale ended
            </div>
          )}
        </div>
        <div className="w-1/2 h-full px-4 py-2 my-auto space-y-1 text-left rounded-lg md:py-4 md:px-10 bg-black-russian">
          <div className="text-base md:text-lg">Remaining Tokens</div>
          <div className="text-base font-bold text-white md:text-xl md:text-2xl">{((total_purchased.current[0] - total_purchased.current[1])/1e18).toFixed()}</div>
        </div>
      </div>
      <div className="py-5 rounded-lg px-7 bg-black-russian">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm">Private Sale</div>
            <div className="text-lg text-white">Buy {prisaleToken[chainId].symbol}</div>
          </div>
          <div className="space-y-2">
            {account && isWhitelisted.current ? (
              <div className="flex items-center h-6 p-2 border-[1px] text-carribean-green border-carribean-green rounded-3xl">
                <CheckIcon className="w-5 h-5" />
                Whitelisted
              </div>
            ) : (
              <div className="flex items-center h-6 p-2 border-[1px] text-red border-red rounded-3xl">
                <CheckIcon className="w-5 h-5" />
                Unwhitelisted
              </div>
            )}
          </div>
        </div>

        <div className="my-2 text-sm ">
          {i18n._(t`This private sale have whitelist limit. If you want to participate, You must register in the whitelist first.
          After the sales starts, the first come, first served mechanism will be adopted.`)}
        </div>

        <div className="my-7">
          {new Date().getTime() / 1e3 < privateSaleStart.current ? (
            // <div>Private Sale not started</div>
            <></>
          ) : new Date().getTime() / 1e3 > privateSaleEnd.current ? (
            // <div>Private Sale ended</div>
            <></>
          ) : (
            <ProgressBar
              progress={
                (total_purchased.current[1]) / (total_purchased.current[0])
              }
              className="from-green to-carribean-green"
            />
          )}
        </div>

        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg text-tahiti-gold bg-gradient-to-r from-tahiti-gold/5 to-tahiti-gold/10">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="4" r="4" fill="#F5841F" />
          </svg>
          {toggle
            ? i18n._(
                t`The investment limit is set at Min ${minTokensAmount.current[0].toFixed()} EVMOS To Max ${maxTokensAmount.current[0].toFixed()} EVMOS per wallet.`
              )
            : i18n._(
                t`The investment limit is set at Min ${minTokensAmount.current[1].toFixed()} USDC To Max ${maxTokensAmount.current[1].toFixed()} USDC per wallet.`
              )}
        </div>

        <div className="justify-center md:flex md:gap-5">
          <div className="px-5 py-9 border-[1px] border-gray-700 rounded-xl space-y-4 md:w-1/2">
            <div className="grid grid-cols-2 px-1 py-[3px] rounded-xl bg-dark-700">
              <div
                className={`text-center my-auto py-4 rounded-xl hover:cursor-pointer hover:text-white ${
                  toggle ? 'text-white font-bold bg-dark-850' : ''
                }`}
                onClick={() => setToggle(true)}
              >
                Use EVMOS
              </div>
              <div
                className={`text-center my-auto py-4 rounded-xl hover:cursor-pointer hover:text-white ${
                  toggle ? '' : 'text-white font-bold bg-dark-850'
                }`}
                onClick={() => setToggle(false)}
              >
                Use USDC
              </div>
            </div>
            <div className="flex justify-between gap-1 px-1">
              {i18n._(t`Balance: `)} {toggle? nativeBalance.toFixed(6): usdcBalance.toFixed(6)} 
              <button
                className="text-light-blue"
                onClick={() => {
                  setInvestValue(toggle ? nativeBalance.toString() : usdcBalance?.toString())
                }}
              >
                Max
              </button>
            </div>
            <NumericalInput
              className="w-full px-4 py-4 pr-20 rounded bg-dark-700 focus:ring focus:ring-light-purple"
              value={investValue}
              onUserInput={setInvestValue}
            />
            <div className="justify-center gap-2 space-y-2 xl:space-y-0 xl:flex ">
              {toggle || approvalState === ApprovalState.APPROVED || privateSaleEnd.current - currentTime < 0 ? (
                <></>
              ) : (
                <Button
                  color="blue"
                  size="sm"
                  className="h-12 opacity-90"
                  disabled={approvalState === ApprovalState.PENDING}
                  onClick={approve}
                >
                  {approvalState === ApprovalState.PENDING ? <Dots>{i18n._(t`Approving`)}</Dots> : i18n._(t`Approve`)}
                </Button>
              )}
              {currentTime - privateSaleStart.current < 0 ? (
                <Button color="gray" size="sm" className="h-12" disabled={true}>
                  Private Sale not started
                </Button>
              ) : privateSaleEnd.current - currentTime < 0 ? (
                <Button color="gray" size="sm" className="h-12" disabled={true}>
                  Private Sale ended
                </Button>
              ) : Number(investValue) > (toggle ? nativeBalance : usdcBalance) ? (
                <Button color="gray" size="sm" className="h-12" disabled={true}>
                  Exceeds Balance
                </Button>
              ) : lowerLimitError ? (
                <Button color="gray" size="sm" className="h-12" disabled={true}>
                  Please notice the limit
                </Button>
              ) : upperLimitError ? (
                <Button color="blue" size="sm" className="h-12" onClick={() => {setshowLimitTips(true)}}>
                  Buy ${prisaleToken[chainId].symbol} Now
                </Button>
              ): toggle ? (
                <Button color="blue" size="sm" className="h-12" onClick={handleBuyTokenWithNATIVE}>
                  Buy ${prisaleToken[chainId].symbol} Now
                </Button>
              ) : approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING ? (
                <Button color="gray" size="sm" className="h-12" disabled={true}>
                  Buy ${prisaleToken[chainId].symbol} Now
                </Button>
              ) : (
                <Button color="blue" size="sm" className="h-12" onClick={handleBuyTokenWithUSDC}>
                  Buy ${prisaleToken[chainId].symbol} Now
                </Button>
              )}
            </div>
            {showLimitTips && <div className='p-2 text-center text-white rounded-lg bg-red'>Maximum Allowed Exceeded</div>}
          </div>
          <div className="px-5 py-9 border-[1px] border-gray-700 rounded-xl space-y-6 md:w-1/2">
            <div className="rounded-lg border-[1px] border-gray-700 space-y-1 py-2 px-4">
              <div className="text-base text-white">{i18n._(t`Purchased ${prisaleToken[chainId].symbol}`)}</div>
              <div className="text-base">${(purchasedToken.current / 1e18 * (tokenPrice.current / 1e6)).toFixed()}</div>
            </div>
            <div className="rounded-lg border-[1px] border-gray-700 py-2 space-y-1 px-4">
              <div className="text-base text-white">{i18n._(t`Claimable ${prisaleToken[chainId].symbol}`)}</div>
              <div className="text-base">{claimableToken.current / 1e18}</div>
            </div>
            {new Date().getTime() / 1e3 <= privateSaleEnd.current ? (
              <Button color="gray" size="sm" className="h-12 opacity-90" disabled={true}>
                Private Sale is not over
              </Button>
            ) : claimableToken.current ? (
              <Button color="blue" size="sm" className="h-12 opacity-90" onClick={handleClaim}>
                Claim Your {prisaleToken[chainId].symbol}
              </Button>
            ) : vestingStart.current == 0 ? (
              <Button color="gray" size="sm" className="h-12 opacity-90" disabled={true}>
                Vesting is not set
              </Button>
            ) : (
              <Button color="gray" size="sm" className="h-12 opacity-90" disabled={true}>
                Nothing to claim
              </Button>
            )}
          </div>
        </div>

        {/* <div className="mt-11">
          <div className="mb-5 text-base text-white">* Private Sale description</div>
          <div className="pl-2 space-y-3 text-sm text-gray-500">
            <div>1, The Private Sale price: 0.12 USDC/{prisaleToken[chainId].symbol}</div>
            <div>2, The invest amount: Min - $2500, Max - $25,000 per wallet address.</div>
            <div>3, Private Sale time: Nov 8th @ 3pm UTC - Nov 10th @ 3pm UTC, total of 5,400,000 tokens.</div>
            <div>
              4, All tokens will be linearly unlocked within 1 year and can be claimed after unlocking (From the 7th day
              after launched).
            </div>
            <div>5, Participation method: whitelist allowed, the first come, first served purchase method.</div>
            <div className="overflow-x-auto">6, Private Sale contract: 0xD5bDcd9477ac5F8Bd79833f79F64AcAdA709117f</div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
