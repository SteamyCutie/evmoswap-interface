import { useState, useEffect } from 'react'
import { useDashboardContract } from 'hooks/useContract'
import { getBalanceAmount, getBalanceNumber, getDecimalAmount, getFullDisplayBalance } from 'functions/formatBalance'
import BigNumber from 'bignumber.js'
import { formatBalance } from 'app/functions'
import { useEmoUsdcPrice } from '../farm/hooks'

export const aprToApy = (apr: number, compoundFrequency = 1, days = 365, performanceFee = 0) => {
  const daysAsDecimalOfYear = days / 365
  const aprAsDecimal = apr / 100
  const timesCompounded = 365 * compoundFrequency
  let apyAsDecimal = (apr / 100) * daysAsDecimalOfYear
  if (timesCompounded > 0) {
    apyAsDecimal = (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear) - 1
  }
  if (performanceFee) {
    const performanceFeeAsDecimal = performanceFee / 100
    const takenAsPerformanceFee = apyAsDecimal * performanceFeeAsDecimal
    apyAsDecimal -= takenAsPerformanceFee
  }
  return apyAsDecimal * 100
}

export function getAPY() {
  const [apr, setAPR] = useState(0)
  const dashboardContract = useDashboardContract()
  const getManualAPR = async () => {
    const aprofManual = await dashboardContract.apyOfPool(0)
    const aprManual = getBalanceAmount(aprofManual._hex, 18)
    setAPR(aprManual.toNumber() * 100)
  }
  getManualAPR()
  const apy = aprToApy(apr)
  return { manualAPY: apr, autoAPY: apy }
}

export function getEMOSPrice() {
  const emosPriceInBigNumber = useEmoUsdcPrice()
  const emosPrice = formatBalance(emosPriceInBigNumber ? emosPriceInBigNumber : 0)
  return Number(emosPrice)
}

export function convertSharesToEmos(
  shares: BigNumber,
  emosPerFullShare: BigNumber,
  decimals = 18,
  decimalsToRound = 3
) {
  const sharePriceNumber = getBalanceNumber(emosPerFullShare, decimals)
  const amountInEmos = new BigNumber(shares.multipliedBy(sharePriceNumber))
  const emosAsNumberBalance = getBalanceNumber(amountInEmos, decimals)
  const emosAsBigNumber = getDecimalAmount(new BigNumber(emosAsNumberBalance), decimals)
  const emosAsDisplayBalance = getFullDisplayBalance(amountInEmos, decimals, decimalsToRound)
  return { emosAsNumberBalance, emosAsBigNumber, emosAsDisplayBalance }
}

export const convertEmosToShares = (
  emos: BigNumber,
  emosPerFullShare: BigNumber,
  decimals = 18,
  decimalsToRound = 3
) => {
  const sharePriceNumber = getBalanceNumber(emosPerFullShare, decimals)
  const amountInShares = new BigNumber(emos.dividedBy(sharePriceNumber))
  const sharesAsNumberBalance = getBalanceNumber(amountInShares, decimals)
  const sharesAsBigNumber = getDecimalAmount(new BigNumber(sharesAsNumberBalance), decimals)
  const sharesAsDisplayBalance = getFullDisplayBalance(amountInShares, decimals, decimalsToRound)
  return { sharesAsNumberBalance, sharesAsBigNumber, sharesAsDisplayBalance }
}

export const useWithdrawalFeeTimer = (
  lastDepositedTime: number,
  userShares: BigNumber,
  withdrawalFeePeriod = 259200
) => {
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const [hasUnstakingFee, setHasUnstakingFee] = useState(false)
  const [currentSeconds, setCurrentSeconds] = useState(Math.floor(Date.now() / 1000))

  useEffect(() => {
    const feeEndTime = lastDepositedTime + withdrawalFeePeriod
    const secondsRemainingCalc = feeEndTime - currentSeconds
    const doesUnstakingFeeApply = userShares.gt(0) && secondsRemainingCalc > 0

    const tick = () => {
      setCurrentSeconds((prevSeconds) => prevSeconds + 1)
    }
    const timerInterval = setInterval(() => tick(), 1000)
    if (doesUnstakingFeeApply) {
      setSecondsRemaining(secondsRemainingCalc)
      setHasUnstakingFee(true)
    } else {
      setHasUnstakingFee(false)
      clearInterval(timerInterval)
    }

    return () => clearInterval(timerInterval)
  }, [lastDepositedTime, withdrawalFeePeriod, setSecondsRemaining, currentSeconds, userShares])

  return { hasUnstakingFee, secondsRemaining }
}
