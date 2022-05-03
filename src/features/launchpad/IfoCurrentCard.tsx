import Image from 'next/image'
import { BlocksIcon, DiscordIcon, TelegramIcon, TokenomicsIcon, TwitterIcon } from 'app/components/Icon'
import { PublicIfoData, WalletIfoData } from './hooks/types'
import { Ifo, PoolIds } from 'app/constants/types'
import { useActiveWeb3React } from 'app/services/web3'
import IfoPoolCard from './IfoPoolCard'
import { getExplorerLink } from 'app/functions'
import IfoActivityTimer from './IfoActivityTimer'
import Typography from 'app/components/Typography'
import { ClockIcon, GlobeAltIcon } from '@heroicons/react/outline'
import { ChevronDownIcon, ChevronUpIcon, GiftIcon } from '@heroicons/react/solid'
import CloseIcon from 'app/components/CloseIcon'
import { useState } from 'react'
import Button from 'app/components/Button'

// Calac remainingTimes
export function remainingTime(
  ifo: Ifo,
  publicIfoData: PublicIfoData
): { days: number; hours: number; minutes: number; seconds: number } | undefined {
  const now = Date.parse(new Date().toString()) / 1000

  if (publicIfoData.status === 'coming_soon') {
    const interval = publicIfoData.startTimeNum - now

    let days = Math.floor(interval / (60 * 60 * 24))
    let hours = Math.floor((interval % (60 * 60 * 24)) / (60 * 60))
    let minutes = Math.floor((interval % (60 * 60)) / 60)
    let seconds = Math.floor(interval % 60)

    return { days, hours, minutes, seconds }
  }

  if (publicIfoData.status === 'live') {
    // const now = Date.now()
    const interval = publicIfoData.endTimeNum - now
    let days = Math.floor(interval / (60 * 60 * 24))
    let hours = Math.floor((interval % (60 * 60 * 24)) / (60 * 60))
    let minutes = Math.floor((interval % (60 * 60)) / 60)
    let seconds = Math.floor(interval % 60)

    return { days, hours, minutes, seconds }
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

export const IfoCurrentCard = ({
  ifo,
  publicIfoData,
  walletIfoData,
}: {
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}) => {
  const { chainId } = useActiveWeb3React()
  const now = Date.parse(new Date().toString()) / 1000
  const [isOpen, setOpen] = useState(true)

  return (
    <div className="flex-row justify-between gap-4">
      <div className={`flex items-center justify-end w-full h-[112px] bg-no-repeat bg-cover bg-center rounded-[30px] border-[2px] border-b-[3px] border-[#383241] ${isOpen ? 'rounded-b-none' : 'rounded-b-[30px]'} p-6 `}
        style={{ backgroundImage: `url('/images/ifo/${ifo.id}-bg.svg'), url('/images/ifo/${ifo.id}-bg.png'), url('/images/ifo/unknown-bg.png')` }}
      >
        <Button
          color="pink"
          variant="filled"
          size="sm"
          className="transition-all duration-150 ease-out flex items-center justify-center w-[48px] h-[48px]"
          onClick={() => setOpen(!isOpen)}
        >
          {!isOpen ? (
            <ChevronDownIcon className="scale-[1.6]" width={48} height={48} />
          ) : (
            <ChevronUpIcon className="scale-[1.6]" width={48} height={48} />
          )}
        </Button>
      </div>
      {isOpen && (
        <div className="w-full rounded rounded-t-none bg-dark-900">
          {publicIfoData.status === "finished" &&
            <div className="flex-row items-center w-full overflow-hidden">
              <div className="flex rounded-[50%] w-[100%] translate-y-[-50%] scale-150 bg-[#372f47] h-[100px] justify-center items-end pb-3 text-[16px] font-extrabold text-white/70">
                Sale Finished!
              </div>
            </div>
          }
          <div
            className={
              !publicIfoData.poolBasic || !walletIfoData.poolBasic
                ? `grid grid-cols-1 gap-4 md:grid-cols-2 p-4 pt-0`
                : `grid grid-cols-1 gap-4 md:grid-cols-2 p-4 pt-0`
            }
          >
            {/* Base sale */}
            {publicIfoData.poolBasic && walletIfoData.poolBasic && (
              <IfoPoolCard
                poolId={PoolIds.poolBasic}
                ifo={ifo}
                publicIfoData={publicIfoData}
                walletIfoData={walletIfoData}
              />
            )}

            {/* Unlimited Sale */}
            <IfoPoolCard
              poolId={PoolIds.poolUnlimited}
              ifo={ifo}
              publicIfoData={publicIfoData}
              walletIfoData={walletIfoData}
            />

            {/* ifo info */}

            <div
              className="hidden flex-col px-4 space-y-8 rounded-r pt-14 bg-dark-800"
              {...{
                style: {
                  backgroundImage: `url("/images/ifo/${ifo.id}-bg.png")`,
                },
              }}
            >
              <div className="mx-auto">
                <Image src={`/images/ifo/${ifo.id}.png`} alt={ifo.name} width="285px" height="55px" />
              </div>

              <div className="flex items-center gap-1 p-4 mx-auto rounded-md text-high-emphesis bg-dark-700">
                {(publicIfoData.status === 'coming_soon' ||
                  publicIfoData.status === 'live' ||
                  publicIfoData.status === 'finished') && (
                    <>
                      {/* <CloseIcon className="h-8 text-red " /> */}
                      <ClockIcon className="h-8 text-yellow " />
                      <Typography variant="h2" className="opacity-80 text-yellow">
                        COMING SOON
                      </Typography>
                    </>
                  )}

                {/* {(publicIfoData.status === 'coming_soon' || publicIfoData.status === 'live') && (
                <>
                  <ClockIcon className="h-8 text-yellow " />
                  <IfoActivityTimer remainingTime={remainingTime(ifo, publicIfoData)} />
                </>
              )} */}
              </div>

              {publicIfoData.status === 'live' && (
                <div className="w-full bg-gray-600 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-cyan-blue h-2.5 rounded-full"
                    {...{
                      style: {
                        width: `${publicIfoData.progress}%`,
                      },
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {/* <div className="text-[14px]">Start: TBH</div>
              <div className="text-[14px]">End: TBH</div> */}

                <div className="text-[14px]">Start: 28th Mar, 12:00pm UTC</div>
                <div className="text-[14px]">End: 29th Mar, 12:00pm UTC</div>
                <div className="text-[14px] text-pink-red">Duration: 24H (Claim Time: 29th Mar, 2:00pm UTC)</div>

                {/* <div className="text-[14px] text-pink-red">
                IFO has been cancelled. We will arrange for refunds in the next 48 hours.
              </div> */}

                <div className="text-xl font-bold">Introduction</div>
                <div className="text-[14px] text-high-emphesis">{ifo.description}</div>
                <div className="flex items-center gap-4 pb-4">
                  <a href={ifo.articleUrl} target="_blank" rel="noreferrer">
                    <GlobeAltIcon width={16} className="text-low-emphesis" />
                  </a>
                  <a href={getExplorerLink(chainId, ifo.address[chainId], 'address')} target="_blank" rel="noreferrer">
                    <BlocksIcon width={16} className="text-low-emphesis" />
                  </a>
                  <a href={ifo.telegramUrl} target="_blank" rel="noreferrer">
                    <TelegramIcon width={16} className="text-low-emphesis" />
                  </a>
                  <a href={ifo.twitterUrl} target="_blank" rel="noreferrer">
                    <TwitterIcon width={16} className="text-low-emphesis" />
                  </a>
                  <a href={ifo.discordUrl} target="_blank" rel="noreferrer">
                    <DiscordIcon width={16} className="text-low-emphesis" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}