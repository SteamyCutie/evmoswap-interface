import { AlertCircle, CheckCircle } from 'react-feather'

import ExternalLink from '../ExternalLink'
import { getExplorerLink } from '../../functions/explorer'
import { useActiveWeb3React } from '../../services/web3'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import React from 'react'

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  return (
    <div className="flex flex-row w-full flex-nowrap" style={{ zIndex: 1000 }}>
      <div className="pr-4">
        {success ? (
          <CheckCircle className="text-2xl text-green-special" />
        ) : (
          <AlertCircle className="text-2xl text-red" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="font-bold text-base text-dark-primary dark:text-light-primary transition-all">
          {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
        </div>
        {chainId && hash && (
          <ExternalLink
            className="p-0 text-sm hover:underline md:p-0"
            href={getExplorerLink(chainId, hash, 'transaction')}
          >
            <div className="flex flex-row items-center gap-1 text-blue-special dark:text-blue-special transition-all ">
              View on explorer <ExternalLinkIcon width={16} height={16} />
            </div>
          </ExternalLink>
        )}
      </div>
    </div>
  )
}
