import { ChevronLeftIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'

const Back = ( { text, path }: { text?: string, path?: string } ) => {
    const { i18n } = useLingui()
    const router = useRouter()
    return (
        <div className="flex items-center justify-between mb-5">
            <a
                onClick={ () => { path ? router.push( path ) : router.back() } }
                className="flex items-center space-x-2 text-base text-center transition-all cursor-pointer text-dark-primary hover:text-dark-primary/80 dark:text-light-primary dark:hover:text-light-primary/80"
            >
                <ChevronLeftIcon width={ 18 } height={ 18 } />
                <span>{ i18n._( t`${text ?? 'Go Back'}` ) }</span>
            </a>
        </div>
    )
}

export default Back
