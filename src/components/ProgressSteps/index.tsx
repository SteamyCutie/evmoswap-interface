import React from 'react'
import { classNames } from '../../functions'

interface ProgressCirclesProps {
  steps: boolean[]
  disabled?: boolean
}

/**
 * Based on array of steps, create a step counter of circles.
 * A circle can be enabled, disabled, or confirmed. States are derived
 * from previous step.
 *
 * An extra circle is added to represent the ability to swap, add, or remove.
 * This step will never be marked as complete (because no 'txn done' state in body ui).
 *
 * @param steps  array of booleans where true means step is complete
 */
export default function ProgressCircles({ steps, disabled = false, ...rest }: ProgressCirclesProps) {
  return (
    <div className="flex justify-center" {...rest}>
      <div className="flex justify-between w-1/2 text-white">
        {steps.map((step, i) => {
          return (
            <div className="flex items-center w-full" key={i}>
              <div
                className={classNames(
                  step ? 'bg-green-special' : 'bg-pink-special',
                  (disabled || (!steps[i - 1] && i !== 0)) && 'bg-pink-special',
                  'min-w-5 min-h-5 rounded-full flex justify-center items-center text-xs transition-all'
                )}
              >
                {step ? '✓' : i + 1}
              </div>
              <div
                className={classNames(
                  disabled && 'bg-light-bg dark:bg-dark-bg',
                  step && 'bg-gradient-to-r from-green-special to-pink-special',
                  steps[i - 1] ? 'bg-gradient-to-r from-pink-special to-green-special' : 'bg-green-special',
                  'w-full h-0.5 opacity-60 transition-all'
                )}
              />
              {/* <Connector prevConfirmed={step} disabled={disabled} /> */}
            </div>
          )
        })}
        <div
          className={classNames(
            (disabled || !steps[steps.length - 1]) && 'bg-light-bg dark:bg-dark-bg',
            'min-w-5 min-h-5 rounded-full flex justify-center bg-pink-special/50 items-center text-xs'
          )}
        >
          {steps.length + 1}
        </div>
      </div>
    </div>
  )
}
