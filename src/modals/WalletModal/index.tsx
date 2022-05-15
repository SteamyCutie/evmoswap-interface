import React, { useEffect, useState } from 'react'
import { SUPPORTED_WALLETS, injected } from '../../config/wallets'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { useModalOpen, useNetworkModalToggle, useWalletModalToggle } from '../../state/application/hooks'
import { NETWORK_ICON, NETWORK_LABEL } from '../../config/networks'
import { ChainId } from '@evmoswap/core-sdk'

import { AbstractConnector } from '@web3-react/abstract-connector'
import AccountDetails from '../../components/AccountDetails'
import { ApplicationModal } from '../../state/application/actions'
import { ButtonError } from '../../components/Button'
import ExternalLink from '../../components/ExternalLink'
import Modal from '../../components/Modal'
import ModalHeader from '../../components/ModalHeader'
import { OVERLAY_READY } from '../../entities/connectors/FortmaticConnector'
import Option from './Option'
import PendingView from './PendingView'
import ReactGA from 'react-ga'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { isMobile } from 'react-device-detect'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import usePrevious from '../../hooks/usePrevious'
import { useActiveWeb3React } from '../../services/web3'
import Image from 'next/image'
import cookie from 'cookie-cutter'
import { SUPPORTED_NETWORKS } from '../NetworkModal'

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // console.log({ ENSName })
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error, deactivate, library, chainId } = useWeb3React()

  const { i18n } = useLingui()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)

  const toggleWalletModal = useWalletModalToggle()
  const toggleNetworkModal = useNetworkModalToggle()

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: (() => Promise<AbstractConnector>) | AbstractConnector | undefined) => {
    let name = ''
    let conn = typeof connector === 'function' ? await connector() : connector

    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    })
    setPendingWallet(conn) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (conn instanceof WalletConnectConnector && conn.walletConnectProvider?.wc?.uri) {
      conn.walletConnectProvider = undefined
    }

    conn &&
      activate(conn, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(conn) // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true)
        }
      })
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    if (connector?.constructor?.name === 'FormaticConnector') {
      connector.on(OVERLAY_READY, () => {
        toggleWalletModal()
      })
    }
  }, [toggleWalletModal, connector])

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]

      // check for mobile options
      if (isMobile) {
        // disable portis on mobile for now
        if (option.name === 'Portis') {
          return null
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={'/images/wallets/' + option.iconName}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon="/images/wallets/metamask.png"
              />
            )
          } else {
            return null // dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} // use option.descriptio to bring back multi-line
            icon={'/images/wallets/' + option.iconName}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error) {
      return (
        <div>
          <ModalHeader
            title={error instanceof UnsupportedChainIdError ? i18n._(t`Wrong Network`) : i18n._(t`Error connecting`)}
            onClose={toggleWalletModal}
          />
          <div>
            {error instanceof UnsupportedChainIdError ? (
              <h5>{i18n._(t`Please connect to the appropriate Evmos network.`)}</h5>
            ) : (
              i18n._(t`Error connecting. Try refreshing the page.`)
            )}
            <div style={{ marginTop: '1rem' }} />
            <div className="grid grid-flow-row-dense grid-cols-1 gap-5 overflow-y-auto md:grid-cols-2">
              {/* {[ChainId.EVMOS, ChainId.EVMOS_TESTNET].map((key: ChainId, i: number) => { */}
              {[ChainId.EVMOS, ChainId.EVMOS_TESTNET].map((key: ChainId, i: number) => {
                if (chainId === key) {
                  return (
                    <button key={i} className="w-full col-span-1 p-px rounded bg-gradient-to-r from-blue to-pink">
                      <div className="flex items-center w-full h-full p-3 space-x-3 rounded bg-dark-1000">
                        <Image
                          src={NETWORK_ICON[key]}
                          alt={`Switch to ${NETWORK_LABEL[key]} Network`}
                          className="rounded-md"
                          width="32px"
                          height="32px"
                        />
                        <div className="font-bold text-primary">{NETWORK_LABEL[key]}</div>
                      </div>
                    </button>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={async () => {
                      const provider: any = window.ethereum
                      const params = SUPPORTED_NETWORKS[key]

                      try {
                        await provider.request({
                          method: 'wallet_addEthereumChain',
                          params: [params],
                        })
                        cookie.set('chainId', key)

                        console.log('You have succefully switched to Binance Test network')
                      } catch (switchError) {
                        if (switchError.code === 4902) {
                          console.log('This network is not available in your metamask, please add it')
                        }
                        console.log('Failed to switch to the network')
                      }
                    }}
                    className="flex items-center w-full col-span-1 p-3 space-x-3 rounded cursor-pointer bg-dark-800 hover:bg-dark-700"
                  >
                    <Image
                      src={NETWORK_ICON[key]}
                      alt="Switch Network"
                      className="rounded-md"
                      width="32px"
                      height="32px"
                    />
                    <div className="font-bold text-primary">{NETWORK_LABEL[key]}</div>
                  </button>
                )
              })}
              {/* {['Clover', 'Telos', 'Optimism'].map((network, i) => (
          <button
            key={i}
            className="flex items-center w-full col-span-1 p-3 space-x-3 rounded cursor-pointer bg-dark-800 hover:bg-dark-700"
          >
            <Image
              src="/images/tokens/unknown.png"
              alt="Switch Network"
              className="rounded-md"
              width="32px"
              height="32px"
            />
            <div className="font-bold text-primary">{network} (Coming Soon)</div>
          </button>
        ))} */}
            </div>
            <div style={{ marginTop: '1rem' }} />
            <ButtonError error={true} size="sm" onClick={deactivate}>
              {i18n._(t`Disconnect`)}
            </ButtonError>
          </div>
        </div>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }
    return (
      <div className="flex flex-col space-y-4">
        <ModalHeader title="Select a Wallet" onClose={toggleWalletModal} />
        <div className="flex flex-col space-y-6">
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <div className="flex flex-col space-y-5 overflow-y-auto">{getOptions()}</div>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <div className="flex flex-col text-center">
              <div className="text-secondary">{i18n._(t`New to Ethereum?`)}</div>
              <ExternalLink href="https://ethereum.org/wallets/" color="blue">
                {i18n._(t`Learn more about wallets`)}
              </ExternalLink>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={0} maxHeight={90}>
      {getModalContent()}
    </Modal>
  )
}
