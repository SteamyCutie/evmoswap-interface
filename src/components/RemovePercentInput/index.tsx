import Input from '../Input'
import React from 'react'

interface RemovePercentInputProps {
  value: string
  onUserInput: (value: string) => void
  id: string
}

export default function RemovePercentInput({ value, onUserInput, id }: RemovePercentInputProps) {
  return (
    <div id={id} className="p-5 rounded bg-dark-800">
      <div className="flex flex-col gap-3 justify-between space-y-3 sm:space-y-0 sm:flex-row">
        <div className="w-full text-white sm:w-2/12" style={{ margin: 'auto 0px' }}>
          Amount
        </div>
        <div className="flex items-center w-full p-3 space-x-3 text-xl font-bold rounded bg-dark-900 sm:w-10/12">
          <Input.Percent
            className="token-amount-input"
            value={value}
            onUserInput={(val) => {
              onUserInput(val)
            }}
            align="right"
          />
          <div className="pl-2 text-xl font-bold">%</div>
        </div>
      </div>
    </div>
  )
}
