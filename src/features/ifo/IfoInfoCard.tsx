import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'

export const IfoInfoCard = () => {
    return (
        <div className="px-4 py-6 mx-auto rounded sm:py-12 sm:px-8 lg:px-12 bg-light-secondary dark:bg-dark-secondary">
            <h2 className="mb-4 md:mb-8 text-3xl font-extrabold text-center md:text-4xl">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="flex space-x-6 items-center">
                    <div
                        className="bg-dark-700 min-w-[100px] w-[100px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/time-circle-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1">
                        <div className="font-bold text-base md:text-lg">CONTRIBUTION WINDOW</div>
                        <div className="text-sm md:text-base">
                            IEOs run anywhere from 12-48 hours to ensure everyone across the globe has time to enter with ease.
                        </div>
                    </div>
                </div>
                <div className="flex space-x-6 items-center">
                    <div
                        className="bg-dark-700 min-w-[100px] w-[100px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/calendar-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1">
                        <div className="font-bold text-base md:text-lg">VESTING SCHEDULE</div>
                        <div className="text-sm md:text-base">
                            20% of tokens unlock immediately. The remaining 80% vest linearly over a timeframe specific to each IEO.
                        </div>
                    </div>
                </div>
                <div className="flex space-x-6 items-center">
                    <div
                        className="bg-dark-700 min-w-[100px] w-[100px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/bitcoin.svg')" } }
                    ></div>
                    <div className="grid gap-1">
                        <div className="font-bold text-base md:text-lg">1 WAYS TO PARTICIPATE</div>
                        <div className="text-sm md:text-base">Option 1: Commit with USDC.</div>
                        {/* <div className="text-sm md:text-base">Option 2: Commit with EMO.</div> */ }
                    </div>
                </div>
                <div className="flex space-x-6 items-center">
                    <div
                        className="bg-dark-700 min-w-[100px] w-[100px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/overflow-dollars-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1">
                        <div className="font-bold text-base md:text-lg">OVERFLOW MODEL</div>
                        <div className="text-sm md:text-base">
                            Your token allocation is based on your percentage of the total raise. All overflow contributions will be
                            returned post-raise.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
