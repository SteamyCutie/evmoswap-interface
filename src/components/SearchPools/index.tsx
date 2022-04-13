import React from 'react'
import { Search as SearchIcon } from 'react-feather'

export default function SearchPools({
  term,
  search,
}: {
  term: string
  search(value: string): void
}) {
  
  return (
    <div className="flex items-center flex-grow w-full gap-4 sm:w-auto">
      <div className="flex items-center flex-grow w-full gap-2 px-3 py-2 bg-opacity-50 border rounded focus-within:ring-2 ring-blue border-dark-800 bg-dark-900 sm:w-auto">
        <SearchIcon strokeWidth={3} width={20} height={20} />
        <input
          className="w-full bg-transparent text-high-emphesis placeholder:text-low-emphesis"
          placeholder="Search by token or pair"
          onChange={(e) => search(e.target.value)}
          value={term}
        />
      </div>
    </div>
  )
}

