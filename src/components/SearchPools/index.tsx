import React from 'react'
import { Search as SearchIcon } from 'react-feather'

export default function SearchPools ( {
    term,
    search,
}: {
    term: string
    search ( value: string ): void
} ) {

    return (
        <div className="flex items-center flex-grow w-full gap-4 sm:w-auto">
            <div className="flex items-center justify-between flex-grow w-full gap-2 px-3 py-3 rounded-md bg-light dark:bg-dark sm:w-auto">
                <input
                    className="w-full bg-transparent text-light-text/40 dark:text-dark-text/40 placeholder:text-light-text/40 dark:placeholder:text-dark-text/40"
                    placeholder="Search by token or pair"
                    onChange={ ( e ) => search( e.target.value ) }
                    value={ term }
                />
                <SearchIcon strokeWidth={ 2 } width={ 20 } height={ 20 } />
            </div>
        </div>
    )
}

