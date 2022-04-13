import React from 'react'
import { useModalOpen, useTokenStatsModalToggle } from '../../state/application/hooks'

import { ApplicationModal } from '../../state/application/actions'
import ExternalLink from '../../components/ExternalLink'
import Image from 'next/image'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Typography from '../../components/Typography'
import { useTokenInfo } from '../../features/farm/hooks'
import { formatNumberScale, getExplorerLink } from '../../functions'
import { ExternalLink as LinkIcon } from 'react-feather'
import { useEmosContract } from '../../hooks/useContract'
import Button from '../../components/Button'
import { RowFixed } from '../../components/Row'
import { ChainId, SUSHI_ADDRESS } from '@evmoswap/core-sdk'
import { useActiveWeb3React } from '../../services/web3'

export default function TokenStatsModal({ token, price }: { token: any; price: any }) {
  const { i18n } = useLingui()
  const { chainId, library } = useActiveWeb3React()

  let tokenInfo = useTokenInfo(useEmosContract())

  const emosPrice = formatNumberScale(price, true)

  const modalOpen = useModalOpen(ApplicationModal.EMOS)

  const toggleWalletModal = useTokenStatsModalToggle()

  function getSummaryLine(title, value) {
    return (
      <div className="flex flex-col w-full gap-2 px-3 py-1 rounded bg-dark-800">
        <div className="flex items-center justify-between">
          {title}
          <Typography variant="sm" className="flex items-center font-bold py-0.5">
            {value}
          </Typography>
        </div>
      </div>
    )
  }

  function getModalContent() {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <ModalHeader title={token['name']} onClose={toggleWalletModal} />
          <div className="flex flex-row w-full py-4">
            {token.icon && (
              <Image
                src={token['icon']}
                alt={token['name']}
                width="64px"
                height="64px"
                objectFit="contain"
                className="items-center"
              />
            )}
            <div className="flex flex-col flex-1">
              <div className="flex flex-row">
                <div className="text-2xl text-primary">{token['symbol']}</div>
              </div>
              <div className="flex items-center justify-between gap-2 space-x-3">
                {token?.address && (
                  <ExternalLink
                    color="blue"
                    startIcon={<LinkIcon size={16} />}
                    href={getExplorerLink(chainId, token['address'][chainId], 'address')}
                    className="outline-none"
                  >
                    <Typography variant="sm">{i18n._(t`View Contract`)}</Typography>
                  </ExternalLink>
                )}
              </div>
            </div>
            <div className="flex items-center text-primary text-bold">
              <div className="ml-2 text-2xl text-primary">{`${emosPrice}`}</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Typography weight={700}>{i18n._(t`Supply & Market Cap`)}</Typography>
          </div>
          <div className="flex flex-col gap-1 -m-1 flex-nowrap">
            {getSummaryLine(
              <Typography variant="sm" className="flex items-center py-0.5">
                {i18n._(t`Total Supply`)}
              </Typography>,
              formatNumberScale(tokenInfo.totalSupply, false)
            )}
            {getSummaryLine(
              <Typography variant="sm" className="flex items-center py-0.5">
                {i18n._(t`Burnt`)}
              </Typography>,
              formatNumberScale(tokenInfo.burnt, false)
            )}
            {getSummaryLine(
              <Typography variant="sm" className="flex items-center py-0.5">
                {i18n._(t`Circulating Supply`)}
              </Typography>,
              formatNumberScale(tokenInfo.circulatingSupply, false)
            )}
            {getSummaryLine(
              <Typography variant="sm" className="flex items-center py-0.5">
                {i18n._(t`Market Cap`)}
              </Typography>,
              formatNumberScale(Number(tokenInfo.circulatingSupply) * Number(price), true)
            )}
          </div>
        </div>

        {/* Add EMOS to metamask */}
        {chainId && [ChainId.EVMOS].includes(chainId) && library && library.provider.isMetaMask && (
          <Button
            color="gradient"
            className="mt-4 item-center"
            onClick={() => {
              const params: any = {
                type: 'ERC20',
                options: {
                  address: SUSHI_ADDRESS[chainId],
                  symbol: 'EMOS',
                  decimals: 18,
                  image:
                    'https://raw.githubusercontent.com/evmoswap/default-token-list/main/assets/tokens/cronos/0xadbd1231fb360047525BEdF962581F3eee7b49fe/logo.png',
                },
              }
              if (library && library.provider.isMetaMask && library.provider.request) {
                library.provider
                  .request({
                    method: 'wallet_watchAsset',
                    params,
                  })
                  .then((success) => {
                    if (success) {
                      console.log('Successfully added EMOS to MetaMask')
                    } else {
                      throw new Error('Something went wrong.')
                    }
                  })
                  .catch(console.error)
              }
            }}
          >
            <RowFixed className="mx-auto space-x-2">
              <span>{i18n._(t`Add ${token['symbol']} to MetaMask`)}</span>
              <Image
                src="/images/wallets/metamask.png"
                alt={i18n._(t`Add ${token['symbol']} to MetaMask`)}
                width={24}
                height={24}
                className="ml-1"
              />
            </RowFixed>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Modal isOpen={modalOpen} onDismiss={toggleWalletModal} minHeight={0} maxHeight={90}>
      {getModalContent()}
    </Modal>
  )
}
