import React, { useEffect, useState } from 'react'
import Container from '../../components/Container'
import Head from 'next/head'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import NetworkGuard from '../../guards/Network'
import { ChainId } from '@evmoswap/core-sdk'
import { Currency, CurrencyAmount, Token } from '@evmoswap/core-sdk'
import Button from 'components/Button'
import Dots from 'components/Dots'
import Loader from 'components/Loader'
import { useActiveWeb3React } from 'services/web3'
import {
  useClaimCallback as useProtocolClaimCallback,
  useUserUnclaimedAmount as useUserUnclaimedProtocolAmount,
} from 'state/claim/protocol/hooks'
import { useModalOpen, useToggleSelfClaimModal } from 'state/application/hooks'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import { ApplicationModal } from 'state/application/actions'
import { getBalanceNumber } from 'functions/formatBalance'
import {
  usePublicSaleContract,
  useSeedSaleContract,
  usePrivateSaleAContract,
  usePrivateSaleBContract,
} from 'hooks/useContract'
import { usePurchased, useClaimable, useClaimed } from 'hooks/useVestingInfo'
import { useTransactionAdder } from '../../state/transactions/hooks'

// import Link from 'next/link'
// import { useClaimCallback, useUserUnclaimedAmount } from '../../state/claim/weekly/hooks'
// import { BigNumber } from '@ethersproject/bignumber'
// import ExternalLink from '../../components/ExternalLink'
// import Fraction from '../../entities/Fraction'
// import QuestionHelper from '../../components/QuestionHelper'
// import { formatNumber } from '../../functions/format'
// import { isAddress } from '@ethersproject/address'

const Strategies = () => {
  const { i18n } = useLingui()
  return (
    <>
      <Head>
        <title>Vesting | EvmoSwap</title>
        <meta name="description" content="Vesting..." />
      </Head>
      <Container maxWidth="5xl" className="flex flex-col gap-8 px-4 py-8">
        {/* Not need for now, so hidden */}
        {/* <div className="space-y-10 md:block">
          <div className="relative w-full p-4 overflow-hidden rounded bg-dark-600">
            <div className="text-lg font-bold text-white">{i18n._(t`Claim EMOS For Airdrop Activity`)}</div>
            <div className="pt-2 text-sm font-bold text-gray-400">
              <ul className="px-6 list-disc ">
                <li>
                  1% - unlocked at 1st day, 3% - unlocked at 5th day, 6% - unlocked at 10th day, after vesting start.
                </li>
                <li>90% of tokens will be linearly unlocked within 1 year and can be claimed after unlocking.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AirdropVesting />
          <AirdropVesting />
        </div> */}

        <div className="space-y-10 md:block">
          <div className="relative w-full p-4 overflow-hidden rounded bg-cyan-blue">
            <div className="text-lg font-bold text-white">
              {i18n._(t`Claim EMOS For Seed / Private / Public Sale`)}
            </div>
            <div className="pt-2 text-sm font-bold text-gray-400">
              <ul className="px-6 text-white list-disc">
                <li>
                  1% - unlocked at 1st day, 3% - unlocked at 5th day, 6% - unlocked at 10th day, after vesting start.
                </li>
                <li>90% of tokens will be linearly unlocked within 1 year and can be claimed after unlocking.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PublicSaleVesting />
          <SeedSaleVesting />
          <PrivateSaleAVesting />
          <PrivateSaleBVesting />
        </div>
      </Container>
    </>
  )
}

const PrivateSaleAVesting = () => {
  const { i18n } = useLingui()
  const addTransaction = useTransactionAdder()

  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()

  const { account } = useActiveWeb3React()
  const [attempting, setAttempting] = useState<boolean>(false)
  const { claimCallback } = useProtocolClaimCallback(account)
  const unclaimedAmount: CurrencyAmount<Currency> | undefined = useUserUnclaimedProtocolAmount(account)
  const { claimSubmitted } = useUserHasSubmittedClaim(account ?? undefined)
  const claimConfirmed = false
  const privateSaleAContract = usePrivateSaleAContract()
  const [pendingTx, setPendingTx] = useState(false)

  const handleClaim = async () => {
    setPendingTx(true)
    try {
      const tx = await privateSaleAContract.claim()
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} EMOS`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  // once confirmed txn is found, if modal is closed open, mark as not attempting regradless
  useEffect(() => {
    if (claimConfirmed && claimSubmitted && attempting) {
      setAttempting(false)
      if (!isOpen) {
        toggleClaimModal()
      }
    }
  }, [attempting, claimConfirmed, claimSubmitted, isOpen, toggleClaimModal])

  // // remove once treasury signature passed
  const pendingTreasurySignature = false

  // New Adding
  const userPurchased = usePurchased(privateSaleAContract)
  const userClaimable = useClaimable(privateSaleAContract)
  const userClaimed = useClaimed(privateSaleAContract)

  const hasFetchedEmosAmount = userPurchased ? userPurchased.gte(0) : false
  const purchasedEmos = hasFetchedEmosAmount ? getBalanceNumber(userPurchased, 18) : 0
  const claimableEmos = hasFetchedEmosAmount ? getBalanceNumber(userClaimable, 18) : 0
  const unclaimedEmos = hasFetchedEmosAmount ? purchasedEmos - getBalanceNumber(userClaimed) : 0

  return (
    <div className="flex flex-col gap-3 md:max-w-full">
      <div className="relative w-full h-full overflow-hidden rounded bg-dark-900">
        <div className="flex flex-col gap-3 p-4">
          <div className="text-lg font-bold text-white">{i18n._(t`Claimable EMOS from Private Sale Round A`)}</div>
          <div className="flex flex-col items-baseline pb-4">
            <div className="font-bold text-white text-[26px]">{claimableEmos}</div>
            {account ? (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs`)}</div>
            ) : (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs: Connect Wallet`)}</div>
            )}
          </div>
          <div className="flex flex-col pb-4 space-y-2">
            <div className="flex flex-row justify-between text-md">
              <h2>Your Purchased EMOSs</h2> <span>{purchasedEmos}</span>
            </div>
            <div className="flex flex-row justify-between text-lg">
              <h2>Your UnClaimed EMOSs</h2> <span>{unclaimedEmos}</span>
            </div>
          </div>
          <Button
            color={!claimableEmos ? 'gray' : 'gradient'}
            disabled={!claimableEmos}
            size="default"
            onClick={handleClaim}
            className="inline-flex items-center justify-center"
          >
            {pendingTx ? (
              <Dots>{i18n._(t`Pending Claim`)}</Dots>
            ) : (
              <> {claimConfirmed ? i18n._(t`Claimed`) : i18n._(t`Claim EMOS`)}</>
            )}

            {attempting && (
              <Loader
                stroke="white"
                style={{
                  marginLeft: '10px',
                  height: '16px',
                }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const PrivateSaleBVesting = () => {
  const { i18n } = useLingui()

  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()

  const { account } = useActiveWeb3React()
  const [attempting, setAttempting] = useState<boolean>(false)
  const { claimCallback } = useProtocolClaimCallback(account)
  const unclaimedAmount: CurrencyAmount<Currency> | undefined = useUserUnclaimedProtocolAmount(account)
  const { claimSubmitted } = useUserHasSubmittedClaim(account ?? undefined)
  const claimConfirmed = false
  const privateSaleBContract = usePrivateSaleBContract()
  const [pendingTx, setPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()

  const handleClaim = async () => {
    setPendingTx(true)
    try {
      const tx = await privateSaleBContract.claim()
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} EMOS`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  // once confirmed txn is found, if modal is closed open, mark as not attempting regradless
  useEffect(() => {
    if (claimConfirmed && claimSubmitted && attempting) {
      setAttempting(false)
      if (!isOpen) {
        toggleClaimModal()
      }
    }
  }, [attempting, claimConfirmed, claimSubmitted, isOpen, toggleClaimModal])

  // // remove once treasury signature passed
  const pendingTreasurySignature = false

  // New Adding
  const userPurchased = usePurchased(privateSaleBContract)
  const userClaimable = useClaimable(privateSaleBContract)
  const userClaimed = useClaimed(privateSaleBContract)

  const hasFetchedEmosAmount = userPurchased ? userPurchased.gte(0) : false
  const purchasedEmos = hasFetchedEmosAmount ? getBalanceNumber(userPurchased, 18) : 0
  const claimableEmos = hasFetchedEmosAmount ? getBalanceNumber(userClaimable, 18) : 0
  const unclaimedEmos = hasFetchedEmosAmount ? purchasedEmos - getBalanceNumber(userClaimed) : 0

  return (
    <div className="flex flex-col gap-3 md:max-w-full">
      <div className="relative w-full h-full overflow-hidden rounded bg-dark-900">
        <div className="flex flex-col gap-3 p-4">
          <div className="text-lg font-bold text-white">{i18n._(t`Claimable EMOS from Private Sale Round B`)}</div>
          <div className="flex flex-col items-baseline pb-4">
            <div className="font-bold text-white text-[26px]">{claimableEmos}</div>
            {account ? (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs`)}</div>
            ) : (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs: Connect Wallet`)}</div>
            )}
          </div>
          <div className="flex flex-col pb-4 space-y-2">
            <div className="flex flex-row justify-between text-md">
              <h2>Your Purchased EMOSs</h2> <span>{purchasedEmos}</span>
            </div>
            <div className="flex flex-row justify-between text-lg">
              <h2>Your UnClaimed EMOSs</h2> <span>{unclaimedEmos}</span>
            </div>
          </div>
          <Button
            color={!claimableEmos ? 'gray' : 'gradient'}
            disabled={!claimableEmos}
            size="default"
            onClick={handleClaim}
            className="inline-flex items-center justify-center"
          >
            {pendingTx ? (
              <Dots>{i18n._(t`Pending Claim`)}</Dots>
            ) : (
              <> {claimConfirmed ? i18n._(t`Claimed`) : i18n._(t`Claim EMOS`)}</>
            )}

            {attempting && (
              <Loader
                stroke="white"
                style={{
                  marginLeft: '10px',
                  height: '16px',
                }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const SeedSaleVesting = () => {
  const { i18n } = useLingui()

  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()
  const addTransaction = useTransactionAdder()

  const { account } = useActiveWeb3React()
  const [attempting, setAttempting] = useState<boolean>(false)
  const { claimCallback } = useProtocolClaimCallback(account)
  const unclaimedAmount: CurrencyAmount<Currency> | undefined = useUserUnclaimedProtocolAmount(account)
  const { claimSubmitted } = useUserHasSubmittedClaim(account ?? undefined)
  const claimConfirmed = false
  const seedSaleContract = useSeedSaleContract()
  const [pendingTx, setPendingTx] = useState(false)

  const handleClaim = async () => {
    setPendingTx(true)
    try {
      const tx = await seedSaleContract.claim()
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} EMOS`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  // once confirmed txn is found, if modal is closed open, mark as not attempting regradless
  useEffect(() => {
    if (claimConfirmed && claimSubmitted && attempting) {
      setAttempting(false)
      if (!isOpen) {
        toggleClaimModal()
      }
    }
  }, [attempting, claimConfirmed, claimSubmitted, isOpen, toggleClaimModal])

  // // remove once treasury signature passed
  const pendingTreasurySignature = false

  // New Adding
  const userPurchased = usePurchased(seedSaleContract)
  const userClaimable = useClaimable(seedSaleContract)
  const userClaimed = useClaimed(seedSaleContract)

  const hasFetchedEmosAmount = userPurchased ? userPurchased.gte(0) : false
  const purchasedEmos = hasFetchedEmosAmount ? getBalanceNumber(userPurchased, 18) : 0
  const claimableEmos = hasFetchedEmosAmount ? getBalanceNumber(userClaimable, 18) : 0
  const unclaimedEmos = hasFetchedEmosAmount ? purchasedEmos - getBalanceNumber(userClaimed) : 0

  return (
    <div className="flex flex-col gap-3 md:max-w-full">
      <div className="relative w-full h-full overflow-hidden rounded bg-dark-900">
        <div className="flex flex-col gap-3 p-4">
          <div className="text-lg font-bold text-white">{i18n._(t`Claimable EMOS from Seed Sale`)}</div>
          <div className="flex flex-col items-baseline pb-4">
            <div className="font-bold text-white text-[26px]">{claimableEmos}</div>
            {account ? (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs`)}</div>
            ) : (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs: Connect Wallet`)}</div>
            )}
          </div>
          <div className="flex flex-col pb-4 space-y-2">
            <div className="flex flex-row justify-between text-md">
              <h2>Your Purchased EMOSs</h2> <span>{purchasedEmos}</span>
            </div>
            <div className="flex flex-row justify-between text-lg">
              <h2>Your UnClaimed EMOSs</h2> <span>{unclaimedEmos}</span>
            </div>
          </div>
          <Button
            color={!claimableEmos ? 'gray' : 'gradient'}
            disabled={!claimableEmos}
            size="default"
            onClick={handleClaim}
            className="inline-flex items-center justify-center"
          >
            {pendingTx ? (
              <Dots>{i18n._(t`Pending Claim`)}</Dots>
            ) : (
              <> {claimConfirmed ? i18n._(t`Claimed`) : i18n._(t`Claim EMOS`)}</>
            )}

            {attempting && (
              <Loader
                stroke="white"
                style={{
                  marginLeft: '10px',
                  height: '16px',
                }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const PublicSaleVesting = () => {
  const { i18n } = useLingui()

  const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
  const toggleClaimModal = useToggleSelfClaimModal()

  const { account } = useActiveWeb3React()
  const [attempting, setAttempting] = useState<boolean>(false)
  const { claimCallback } = useProtocolClaimCallback(account)
  const unclaimedAmount: CurrencyAmount<Currency> | undefined = useUserUnclaimedProtocolAmount(account)
  const { claimSubmitted } = useUserHasSubmittedClaim(account ?? undefined)
  const claimConfirmed = false
  const pubSaleContract = usePublicSaleContract()
  const [pendingTx, setPendingTx] = useState(false)
  const addTransaction = useTransactionAdder()

  // function onClaim() {
  //   setAttempting(true)
  //   claimCallback()
  //     // reset modal and log error
  //     .catch((error) => {
  //       setAttempting(false)
  //       console.log(error)
  //     })
  // }

  const handleClaim = async () => {
    setPendingTx(true)
    try {
      const tx = await pubSaleContract.claim()
      addTransaction(tx, {
        summary: `${i18n._(t`Claim`)} EMOS`,
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  // once confirmed txn is found, if modal is closed open, mark as not attempting regradless
  useEffect(() => {
    if (claimConfirmed && claimSubmitted && attempting) {
      setAttempting(false)
      if (!isOpen) {
        toggleClaimModal()
      }
    }
  }, [attempting, claimConfirmed, claimSubmitted, isOpen, toggleClaimModal])

  // const [totalLocked, setTotalLocked] = useState<string>()
  // useEffect(() => {
  //   const fetchLockup = async () => {
  //     if (account) {
  //       fetch(
  //         'https://raw.githubusercontent.com/sushiswap/sushi-vesting/master/amounts-protocols-10959148-12171394.json'
  //       )
  //         .then((response) => response.json())
  //         .then((data) => {
  //           // console.log('vesting:', data)
  //           const userLockedAmount = data[account.toLowerCase()] ? data[account.toLowerCase()] : '0'
  //           const userLocked = Fraction.from(BigNumber.from(userLockedAmount), BigNumber.from(10).pow(18)).toString()
  //           setTotalLocked(userLocked)
  //           // console.log('userLocked:', userLocked)
  //         })
  //         .catch((error) => {
  //           console.log(error)
  //         })
  //     }
  //     return []
  //   }
  //   fetchLockup()
  // }, [account])

  // // remove once treasury signature passed
  const pendingTreasurySignature = false

  // New Adding
  const userPurchased = usePurchased(pubSaleContract)
  const userClaimable = useClaimable(pubSaleContract)
  const userClaimed = useClaimed(pubSaleContract)

  const hasFetchedEmosAmount = userPurchased ? userPurchased.gte(0) : false
  const purchasedEmos = hasFetchedEmosAmount ? getBalanceNumber(userPurchased, 18) : 0
  const claimableEmos = hasFetchedEmosAmount ? getBalanceNumber(userClaimable, 18) : 0
  const unclaimedEmos = hasFetchedEmosAmount ? purchasedEmos - getBalanceNumber(userClaimed) : 0

  return (
    <div className="flex flex-col gap-3 md:max-w-full">
      <div className="relative w-full h-full overflow-hidden rounded bg-dark-900">
        <div className="flex flex-col gap-3 p-4">
          <div className="text-lg font-bold text-white">{i18n._(t`Claimable EMOS from Public Sale`)}</div>
          <div className="flex flex-col items-baseline pb-4">
            <div className="font-bold text-white text-[26px]">{claimableEmos}</div>
            {account ? (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs`)}</div>
            ) : (
              <div className="text-sm text-secondary">{i18n._(t`Your Claimable EMOSs: Connect Wallet`)}</div>
            )}
          </div>
          <div className="flex flex-col pb-4 space-y-2">
            <div className="flex flex-row justify-between text-md">
              <h2>Your Purchased EMOSs</h2> <span>{purchasedEmos}</span>
            </div>
            <div className="flex flex-row justify-between text-lg">
              <h2>Your UnClaimed EMOSs</h2> <span>{unclaimedEmos}</span>
            </div>
          </div>
          <Button
            color={!claimableEmos ? 'gray' : 'gradient'}
            disabled={!claimableEmos}
            size="default"
            onClick={handleClaim}
            className="inline-flex items-center justify-center"
          >
            {pendingTx ? (
              <Dots>{i18n._(t`Pending Claim`)}</Dots>
            ) : (
              <> {claimConfirmed ? i18n._(t`Claimed`) : i18n._(t`Claim EMOS`)}</>
            )}

            {attempting && (
              <Loader
                stroke="white"
                style={{
                  marginLeft: '10px',
                  height: '16px',
                }}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

Strategies.Guard = NetworkGuard([ChainId.EVMOS])

export default Strategies
