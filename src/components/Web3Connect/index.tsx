import Button, { ButtonProps } from '../Button'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

import { Activity } from 'react-feather'
import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'

const Web3Connect = ({
  color = 'gradient',
  size = 'sm',
  className = 'px-6 py-3 font-bold text-white',
  ...rest
}: ButtonProps) => {
  const { i18n } = useLingui()
  const toggleWalletModal = useWalletModalToggle()
  const { error } = useWeb3React()
  return error ? (
    <div
      className="flex items-center justify-center px-4 py-2 font-semibold text-white rounded-[14px] bg-opacity-80 bg-red hover:bg-opacity-100"
      onClick={toggleWalletModal}
    >
      <div className="mr-1">
        <Activity className="w-4 h-4" />
      </div>
      {error instanceof UnsupportedChainIdError ? i18n._(t`Wrong Network`) : i18n._(t`Error`)}
    </div>
  ) : (
    <Button
      id="connect-wallet"
      onClick={toggleWalletModal}
      variant="filled"
      color={color}
      className={className}
      size={size}
      {...rest}
    >
      {i18n._(t`Connect to a wallet`)}
    </Button>
  )
}

export default Web3Connect
