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
import Link from 'next/link'
import { FAUCET_ADDRESS } from 'app/constants/addresses'

export default function Tools() {
  const { chainId } = useActiveWeb3React()
  const toggleNetworkModal = useNetworkModalToggle()
  const addTransaction = useTransactionAdder()

  const faucetTokenAddress = {
    USDC: USDC[chainId],
    USDT: USDT[chainId],
    EMO: EvmoSwap[chainId],
  }

  const faucetContract = useFaucetContract()
  const faucetAddress = FAUCET_ADDRESS[chainId]
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
      <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'> 
        <div className='w-3/5'>
          <div className='text-2xl'>tEVMOS Faucet</div>
          <div>Looking for a less resource-intensive alternative to mining?</div>
        </div>
        <Link href="https://faucet.evmos.dev/" >
          <Button
            color={'blue'}
            size="sm"
            className="flex items-center justify-center w-48 gap-2 hover:bg-red bg-gray"
          >
            Get tEVMOS
          </Button>
        </Link>
      </div>

      <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'> 
        <div className='w-3/5'>
          <div className='text-2xl'>EMO Faucet</div>
          <div>Looking for a less resource-intensive alternative to mining?</div>
        </div>
        <Button
          color={emoBalance >= 500 ? 'blue' : 'gray'}
          size="sm"
          onClick={() => handleFaucetToken('EMO')}
          className={`w-48 flex gap-2 items-center justify-center ${emoBalance >= 500 ? `hover:bg-red` : `bg-gray`}`}
          disabled={!emoBalance}
        >
          {emoBalance >= 500 ? 'Take test EMO' : 'Not enough faucet EMO'}
          <QuestionHelper text="You send little native token to the protocol and get 500 EMO" />
        </Button>
      </div>

      <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'> 
        <div className='w-3/5'>
          <div className='text-2xl'>USDC Faucet</div>
          <div>Looking for a less resource-intensive alternative to mining?</div>
        </div>
        <Button
          color={usdcBalance >= 500 ? 'blue' : 'gray'}
          size="sm"
          onClick={() => handleFaucetToken('USDC')}
          className={`w-48 flex gap-2 items-center justify-center ${
            usdcBalance >= 500 ? `hover:bg-red` : `bg-gray`
          }`}
          disabled={!usdcBalance}
        >
          {usdcBalance >= 500 ? 'Take test USDC' : 'Not enough faucet USDC'}
          <QuestionHelper text="You send little native token to the protocol and get 500 USDC" />
        </Button>
      </div>

      <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'> 
        <div className='w-3/5'>
          <div className='text-2xl'>USDT Faucet</div>
          <div>Looking for a less resource-intensive alternative to mining?</div>
        </div>
        <Button
          color={usdtBalance >= 500 ? 'blue' : 'gray'}
          size="sm"
          onClick={() => handleFaucetToken('USDT')}
          className={`w-48 flex gap-2 items-center justify-center ${
            usdtBalance >= 500 ? `hover:bg-red` : `bg-gray`
          }`}
          disabled={!usdtBalance}
        >
          {usdtBalance >= 500 ? 'Take test USDT' : 'Not enough faucet USDT'}
          <QuestionHelper text="You send little native token to the protocol and get 500 USDT" />
        </Button>
      </div>
    </>
  )
}
