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
import { DAI, EvmoSwap, USDC, USDT } from 'app/config/tokens'
import Link from 'next/link'
import { FAUCET_ADDRESS } from 'app/constants/addresses'

export default function Tools () {
    const { chainId } = useActiveWeb3React()
    const toggleNetworkModal = useNetworkModalToggle()
    const addTransaction = useTransactionAdder()

    const faucetTokenAddress = {
        USDC: '0xae95d4890bf4471501E0066b6c6244E1CAaEe791',
        USDT: '0x397F8aBd481B7c00883fb70da2ea5Ae70999c37c',
        DAI: '0x7c4a1D38A755a7Ce5521260e874C009ad9e4Bf9c',
    }

    const faucetContract = useFaucetContract()
    const faucetAddress = FAUCET_ADDRESS[ chainId ]
    const daiBalance = Number( useTokenBalance( faucetAddress ?? undefined, DAI[ chainId ] )?.toSignificant( 8 ) )
    const usdcBalance = Number( useTokenBalance( faucetAddress ?? undefined, USDC[ chainId ] )?.toSignificant( 8 ) )
    const usdtBalance = Number( useTokenBalance( faucetAddress ?? undefined, USDT[ chainId ] )?.toSignificant( 8 ) )
    const handleFaucetToken = async ( token: string ) => {
        try {
            const args = [ faucetTokenAddress[ token ] ]
            const tx = await faucetContract.faucetTokenWithETH( ...args, { value: '100000000000000000' } )
            addTransaction( tx, { summary: `Send ${token}` } )
        } catch { }
    }

    if ( !chainId ) return null
    return (
        <>
            {/* <div
        className="flex items-center rounded bg-light dark:bg-dark hover:bg-light-secondary dark:bg-dark-secondary p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto"
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
      </div> */}
            <div className='flex items-center justify-between mt-12 px-10 py-4 my-4 rounded-md bg-dark-850'>
                <a href="https://evmos.dev/guides/keys-wallets/metamask.html" className="text-2xl" target="_blank" rel="noreferrer"> 💰 How to set up network on Metamask?</a>
            </div>
            <div className='flex items-center justify-between mt-12 px-10 py-4 my-4 rounded-md bg-dark-850'>
                <div className='w-3/5'>
                    <div className='text-2xl'>tEVMOS Faucet</div>
                    <div>Get the test token from the faucet. There is a limit for each address!</div>
                </div>
                <a href="https://faucet.evmos.dev/" target="_blank" rel="noreferrer">
                    <Button
                        color="gradient"
                        size="sm"
                        className="flex items-center justify-center w-48 gap-2 hover:bg-red bg-gray"
                    >
                        Get tEVMOS
                    </Button>
                </a>
            </div>

            <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'>
                <div className='w-3/5'>
                    <div className='text-2xl'>DAI Faucet</div>
                    <div>Get the test token from the faucet. There is a limit for each address!</div>
                </div>
                <Button
                    color={ daiBalance >= 500 ? 'blue' : 'gray' }
                    size="sm"
                    onClick={ () => handleFaucetToken( 'DAI' ) }
                    className={ `w-48 flex gap-2 items-center justify-center ${daiBalance >= 500 ? `hover:bg-red` : `bg-gray`}` }
                    disabled={ !daiBalance }
                >
                    { daiBalance >= 500 ? 'Take test DAI' : 'Not enough faucet DAI' }
                    <QuestionHelper text="You send little native token to the protocol and get 500 DAI" />
                </Button>
            </div>

            <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'>
                <div className='w-3/5'>
                    <div className='text-2xl'>USDC Faucet</div>
                    <div>Get the test token from the faucet. There is a limit for each address!</div>
                </div>
                <Button
                    color={ usdcBalance >= 500 ? 'blue' : 'gray' }
                    size="sm"
                    onClick={ () => handleFaucetToken( 'USDC' ) }
                    className={ `w-48 flex gap-2 items-center justify-center ${usdcBalance >= 500 ? `hover:bg-red` : `bg-gray`
                        }` }
                    disabled={ !usdcBalance }
                >
                    { usdcBalance >= 500 ? 'Take test USDC' : 'Not enough faucet USDC' }
                    <QuestionHelper text="You send little native token to the protocol and get 500 USDC" />
                </Button>
            </div>

            <div className='flex items-center justify-between px-10 py-4 my-4 rounded-md bg-dark-850'>
                <div className='w-3/5'>
                    <div className='text-2xl'>USDT Faucet</div>
                    <div>Get the test token from the faucet. There is a limit for each address!</div>
                </div>
                <Button
                    color={ usdtBalance >= 500 ? 'blue' : 'gray' }
                    size="sm"
                    onClick={ () => handleFaucetToken( 'USDT' ) }
                    className={ `w-48 flex gap-2 items-center justify-center ${usdtBalance >= 500 ? `hover:bg-red` : `bg-gray`
                        }` }
                    disabled={ !usdtBalance }
                >
                    { usdtBalance >= 500 ? 'Take test USDT' : 'Not enough faucet USDT' }
                    <QuestionHelper text="You send little native token to the protocol and get 500 USDT" />
                </Button>
            </div>
        </>
    )
}
