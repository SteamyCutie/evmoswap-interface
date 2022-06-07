import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'

export const IfoIdeaCard = () => {
    const handleParticipate = () => {
        window.scrollTo( 0, 0 )
    }
    return (
        <div className="px-8 py-12 mx-auto rounded sm:py-12 sm:px-8 lg:px-12 bg-light-secondary dark:bg-dark-secondary">
            <h2 className="mb-4 text-3xl font-extrabold text-center md:mb-8 md:text-4xl">
                Our IEO Ideology
            </h2>
            <div className="grid items-start grid-cols-1 gap-8 p-8 md:grid-cols-3">
                <div className="grid items-center gap-4 justify-items-center">
                    <div
                        className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/investment-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1 text-center">
                        <div className="text-base font-bold uppercase md:text-lg">Investment</div>
                        <div className="text-sm uppercase text-yellow md:text-base">Build</div>
                        <div className="text-sm md:text-base">
                            We highly vet applicants to choose projects we believe in as long term investments and partners
                        </div>
                    </div>
                </div>
                <div className="grid items-center gap-4 justify-items-center">
                    <div
                        className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/development-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1 text-center">
                        <div className="text-base font-bold uppercase md:text-lg">Development</div>
                        <div className="text-sm uppercase text-yellow md:text-base">Hold</div>
                        <div className="text-sm md:text-base">
                            The funds raised are used to finalize development and launch the project
                        </div>
                    </div>
                </div>
                <div className="grid items-center gap-4 justify-items-center">
                    <div
                        className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
                        style={ { backgroundImage: "url('/images/ifo/innovation-dark.svg')" } }
                    ></div>
                    <div className="grid gap-1 text-center">
                        <div className="text-base font-bold uppercase md:text-lg">Innovation</div>
                        <div className="text-sm uppercase text-yellow md:text-base">Experiment</div>
                        <div className="text-sm md:text-base">
                            These projects are meant to be unique and push the boundaries of DeFi
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid items-center justify-center gap-4 mt-2 md:flex md:mt-8 md:gap-16">
                <a
                    href={ 'https://forms.gle/rg2ac5xAQKR8d6Ff6' }
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={ false }
                    className="w-full md:w-1/4"
                >
                    <Button color="gradient" className="w-full px-12 uppercase" variant="filled" disabled={ false }>
                        { i18n._( t`Apply for IEO` ) }
                    </Button>
                </a>
                <a
                    onClick={ handleParticipate }
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={ false }
                    className="w-full md:w-1/4"
                >
                    <Button color="gradient" className="w-full uppercase" variant="filled" disabled={ false }>
                        { i18n._( t`Participate Now` ) }
                    </Button>
                </a>
            </div>
        </div>
    )
}
