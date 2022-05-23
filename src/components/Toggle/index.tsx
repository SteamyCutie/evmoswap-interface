import React from 'react'
import { Switch } from '@headlessui/react'
import { classNames } from '../../functions'

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <Switch
      checked={isActive}
      onChange={toggle}
      className={classNames(
        'bg-[#EFEFFB] dark:bg-[#262230]',
        'relative inline-flex flex-shrink-0 h-[25px] w-[72px] border-2 border-transparent rounded-md cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none'
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          'pointer-events-none relative h-[21px] w-[33px] flex text-[12px] items-center justify-center rounded-md bg-white dark:bg-dark-primary transform ring-0 transition ease-in-out duration-200',
          isActive
            ? 'bg-blue-special dark:bg-blue-special text-white dark:text-white translate-x-[33px]'
            : 'translate-x-0 text-dark-primary dark:text-white'
        )}
      >
        <span
          className={classNames(
            isActive ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          {/* <svg className="w-3 h-3 text-low-emphesis" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg> */}
          Off
        </span>
        <span
          className={classNames(
            isActive ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
            'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
          )}
          aria-hidden="true"
        >
          {/* <svg className="w-3 h-3 text-high-emphesis" fill="currentColor" viewBox="0 0 12 12">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg> */}
          On
        </span>
      </span>
    </Switch>
  )
}
