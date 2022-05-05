import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'

export const IfoIdeaCard = () => {
  return (
    <div className="px-8 py-12 mx-auto rounded sm:py-12 sm:px-8 lg:px-12 bg-dark-900">
      <h2 className="mb-4 md:mb-8 text-3xl font-extrabold text-center text-high-emphesis sm:text-4xl">
        OUR IEO IDEOLOGY
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 items-start">
        <div className="grid gap-4 items-center justify-items-center">
          <div
            className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/ifo/investment-dark.svg')" }}
          ></div>
          <div className="grid gap-1 text-center">
            <div className="font-bold text-base md:text-lg uppercase">Investment</div>
            <div className="text-yellow text-sm md:text-base uppercase">Build</div>
            <div className="text-sm md:text-base">
              We highly vet applicants to choose projects we believe in as long term investments and partners
            </div>
          </div>
        </div>
        <div className="grid gap-4 items-center justify-items-center">
          <div
            className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/ifo/development-dark.svg')" }}
          ></div>
          <div className="grid gap-1 text-center">
            <div className="font-bold text-base md:text-lg uppercase">Development</div>
            <div className="text-yellow text-sm md:text-base uppercase">Hold</div>
            <div className="text-sm md:text-base">
              The funds raised are used to finalize development and launch the project
            </div>
          </div>
        </div>
        <div className="grid gap-4 items-center justify-items-center">
          <div
            className="bg-dark-700 min-w-[144px] w-[144px] h-[100px] rounded-xl bg-no-repeat bg-center"
            style={{ backgroundImage: "url('/images/ifo/innovation-dark.svg')" }}
          ></div>
          <div className="grid gap-1 text-center">
            <div className="font-bold text-base md:text-lg uppercase">Innovation</div>
            <div className="text-yellow text-sm md:text-base uppercase">Experiment</div>
            <div className="text-sm md:text-base">
              These projects are meant to be unique and push the boundaries of DeFi
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:flex items-center justify-center mt-2 md:mt-8 gap-4 md:gap-16">
        <a href={'https://forms.gle/rg2ac5xAQKR8d6Ff6'} target="_blank" rel="noreferrer" aria-disabled={false} className="w-full md:w-1/4">
          <Button color="gradient" className="w-full uppercase px-12" variant="filled" disabled={false}>
            {i18n._(t`Become a Partner`)}
          </Button>
        </a>
        <a href={''} target="_blank" rel="noreferrer" aria-disabled={false} className="w-full md:w-1/4">
          <Button color="gradient" className="w-full uppercase" variant="filled" disabled={false}>
            {i18n._(t`Participate Now`)}
          </Button>
        </a>
      </div>
    </div>
  )
}
