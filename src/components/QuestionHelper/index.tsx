import React, { FC, useCallback, useState } from 'react'
import { QuestionMarkCircleIcon as SolidQuestionMarkCircleIcon } from '@heroicons/react/solid'
import Tooltip from '../Tooltip'

const QuestionHelper: FC<{ text?: any }> = ({ children, text }) => {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  if (children) {
    return (
      <Tooltip text={text} show={show}>
        <div
          className="flex items-center justify-center outline-none"
          onClick={open}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          {children}
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip text={text} show={show}>
      <div
        className="flex items-center justify-center outline-none cursor-help"
        onClick={open}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {/* <SolidQuestionMarkCircleIcon width={16} height={16} className="bg-light-primary dark:bg-dark-primary text-dark-primary dark:text-light-primary" /> */}
        <div className="w-4 h-4 m-1 bg-[#EFEFFB] hover:bg-[#EFEFFB]/30 text-dark-primary dark:bg-[#262230] dark:hover:bg-[#262230]/30 dark:text-white rounded-full justify-center items-center text-[8px] flex font-extrabold transition-all">
          ?
        </div>
      </div>
    </Tooltip>
  )
}

export default QuestionHelper
