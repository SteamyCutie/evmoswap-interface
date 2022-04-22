import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'app/components/Button'
import NumericalInput from 'app/components/NumericalInput'
import QuestionHelper from 'app/components/QuestionHelper'
import { useState } from 'react'
import Image from 'next/image'
import { DiscordIcon, MediumIcon, TwitterIcon } from 'app/components/Icon'
import { PublicIfoData, WalletIfoData } from './hooks/types'
import { Ifo } from 'app/constants/types'
import { useGetPublicIfoData, useGetWalletIfoData } from 'app/features/ifov2/hooks'
import IfoCardData from './IfoCardData'

export const IfoPastCard = ({ inactiveIfo }: { inactiveIfo: Ifo[] }) => {
  const { i18n } = useLingui()
  const [depositValue, setDepositValue] = useState('')

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="w-full rounded">
        <div className="max-w-[800px] m-auto w-full">
          {inactiveIfo.map((ifo) => (
            <IfoCardData key={ifo.id} ifo={ifo} />
          ))}
        </div>
      </div>
    </div>
  )
}
