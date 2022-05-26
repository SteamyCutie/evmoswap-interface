import React from 'react'
import Image from 'next/image'
import { formatBalance, formatNumber, formatNumberScale } from '../../functions/format'
import { useTokenStatsModalToggle } from '../../state/application/hooks'
import TokenStatsModal from '../../modals/TokenStatsModal'
import { ChainId } from '@evmoswap/core-sdk'
import { useEmoUsdcPrice } from 'app/features/farm/hooks'

const supportedTokens = {
  EMO: {
    name: 'EvmoSwap Token',
    symbol: 'EMO',
    icon: '/icons/icon-72x72.png',
    address: {
      [ChainId.EVMOS]: '0x181C262b973B22C307C646a67f64B76410D19b6B',
      [ChainId.EVMOS_TESTNET]: '0x7cBa32163a8f4c56C846f5C3685E3b7a450c9002',
    },
  },
}

interface TokenStatsProps {
  token: string
}

const TokenStatusInner = ({ token, price }) => {
  const toggleModal = useTokenStatsModalToggle()
  return (
    <div
      className="flex items-center px-2 py-2 text-sm transition-all bg-transparent rounded-2xl text-dark-primary/80 dark:text-light-primary/80"
      onClick={toggleModal}
    >
      {token.icon && (
        <Image
          src={token['icon']}
          alt={token['symbol']}
          width="24px"
          height="24px"
          objectFit="contain"
          className="rounded-full"
        />
      )}
      <div className="pl-2 pr-1 font-extrabold transition-all text-dark-primary/80 dark:text-light-primary/80">
        {formatNumberScale(price, true)}
      </div>
    </div>
  )
}

const TokenStats = ({ token, ...rest }: TokenStatsProps) => {
  const selectedToken = supportedTokens[token]
  const evmoPrice = useEmoUsdcPrice()

  return (
    <>
      <TokenStatusInner token={selectedToken} price={formatBalance(evmoPrice ? evmoPrice : '0')} />
      <TokenStatsModal token={selectedToken} price={formatBalance(evmoPrice ? evmoPrice : 0)} />
    </>
  )
}

export default TokenStats
