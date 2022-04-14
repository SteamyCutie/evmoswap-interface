import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'

import Image from 'next/image'
import React from 'react'
import { useActiveWeb3React } from 'app/services/web3'
import { useNetworkModalToggle } from 'app/state/application/hooks'
import { ChainId } from '@evmoswap/core-sdk'
import { BscNetworkModal } from 'app/modals/NetworkModal/indexBsc'
import { useFaucetContract } from 'app/hooks'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import Button from 'app/components/Button'
import { useTokenBalance } from 'state/wallet/hooks'
import QuestionHelper from 'app/components/QuestionHelper'
import { EvmoSwap, USDC, USDT } from 'app/config/tokens'

const faucetTokenAddress = {
  USDC: '0xFCBdf3F929e049F2F062cd7e4084fd6f2E5b9c73',
  USDT: '0xb75fdC39459DAfA30Bc4ec9ca15B40C14084FB4e',
  EMO: '0xb9Bd45e536D678c6AdCBE49Ee0e8959Bd3b3774F',
}

export default function Tools() {
  const { chainId } = useActiveWeb3React()
  const toggleNetworkModal = useNetworkModalToggle()
  const addTransaction = useTransactionAdder()

  const faucetContract = useFaucetContract()
  const faucetAddress = '0xC6E69C6C64914864A848784159A219627d175D51'
  const emoBalance = Number(useTokenBalance(faucetAddress ?? undefined, EvmoSwap[chainId])?.toSignificant(8))
  const usdcBalance = Number(useTokenBalance(faucetAddress ?? undefined, USDC[chainId])?.toSignificant(8))
  const usdtBalance = Number(useTokenBalance(faucetAddress ?? undefined, USDT[chainId])?.toSignificant(8))
  const handleFaucetToken = async (token: string) => {
    try {
      const args = [faucetTokenAddress[token]]
      const tx = await faucetContract.faucetTokenWithETH(...args, { value: 100 })
      addTransaction(tx, { summary: `Send ${token}` })
    } catch {}
  }

  if (!chainId) return null
  return (
    <>
      <div
        className="flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto"
        onClick={() => toggleNetworkModal()}
      >
        {ChainId.EVMOS === chainId ? (
          <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-dark-1000 text-secondary">
            <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
            <div className="text-primary">{NETWORK_LABEL[chainId]}</div>
          </div>
        ) : (
          <div className="grid items-center grid-flow-col px-3 py-2 space-x-2 text-sm rounded-lg pointer-events-auto auto-cols-max bg-blue/50">
            <Image src={NETWORK_ICON[chainId]} alt="Switch Network" className="rounded-md" width="22px" height="22px" />
            <div className="text-white">{NETWORK_LABEL[chainId]}</div>
          </div>
        )}

        <BscNetworkModal />
      </div>
      <Button
        color={emoBalance >= 500 ? 'blue' : 'gray'}
        size="sm"
        onClick={() => handleFaucetToken('EMO')}
        className={`w-48 m-10 flex gap-2 items-center justify-center ${emoBalance >= 500 ? `hover:bg-red` : `bg-gray`}`}
        disabled={!emoBalance}
      >
        {emoBalance >= 500 ? 'Take test EMO' : 'Not enough faucet EMO'}
        <QuestionHelper text="You send little native token to the protocol and get 500 EMO" />
      </Button>
      <Button
        color={usdcBalance >= 500 ? 'blue' : 'gray'}
        size="sm"
        onClick={() => handleFaucetToken('USDC')}
        className={`w-48 m-10 flex gap-2 items-center justify-center ${
          usdcBalance >= 500 ? `hover:bg-red` : `bg-gray`
        }`}
        disabled={!usdcBalance}
      >
        {usdcBalance >= 500 ? 'Take test USDC' : 'Not enough faucet USDC'}
        <QuestionHelper text="You send little native token to the protocol and get 500 USDC" />
      </Button>
      <Button
        color={usdtBalance >= 500 ? 'blue' : 'gray'}
        size="sm"
        onClick={() => handleFaucetToken('USDT')}
        className={`w-48 m-10 flex gap-2 items-center justify-center ${
          usdtBalance >= 500 ? `hover:bg-red` : `bg-gray`
        }`}
        disabled={!usdtBalance}
      >
        {usdtBalance >= 500 ? 'Take test USDT' : 'Not enough faucet USDT'}
        <QuestionHelper text="You send little native token to the protocol and get 500 USDT" />
      </Button>
    </>
  )
}
