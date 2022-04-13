import React from 'react'
import Image from 'next/image'
import { formatBalance, formatNumber, formatNumberScale } from '../../functions/format'
import { useTokenStatsModalToggle } from '../../state/application/hooks'
import TokenStatsModal from '../../modals/TokenStatsModal'
import { ChainId } from '@evmoswap/core-sdk'
import { useEmoUsdcPrice } from 'app/features/farm/hooks'

const supportedTokens = {
  EMOS: {
    name: 'EvmoSwap Token',
    symbol: 'EMO',
    icon: '/icons/icon-72x72.png',
    address: {
      [ChainId.EVMOS]: '0xadbd1231fb360047525BEdF962581F3eee7b49fe',
      [ChainId.EVMOS_TESTNET]: '0x7Ac4564724c99e129F79dC000CA594B4631acA81',
    },
  },
}

interface TokenStatsProps {
  token: string
}

function TokenStatusInner({ token, price }) {
  const toggleModal = useTokenStatsModalToggle()
  return (
    <div
      className="flex items-center px-2 py-2 text-sm rounded-lg bg-dark-900 hover:bg-dark-800 text-secondary"
      onClick={toggleModal}
    >
      {token.icon && (
        <Image
          src={token['icon']}
          alt={token['symbol']}
          width="24px"
          height="24px"
          objectFit="contain"
          className="rounded-md"
        />
      )}
      <div className="px-1 text-primary">{formatNumberScale(price, true)}</div>
    </div>
  )
}

export default function TokenStats({ token, ...rest }: TokenStatsProps) {
  const selectedToken = supportedTokens[token]
  const evmoPrice = useEmoUsdcPrice()

  return (
    <>
      <TokenStatusInner token={selectedToken} price={formatBalance(evmoPrice ? evmoPrice : '0')} />
      <TokenStatsModal token={selectedToken} price={formatBalance(evmoPrice ? evmoPrice : 0)} />
    </>
  )
}
