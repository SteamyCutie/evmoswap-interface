import React, { FC, useCallback } from 'react'

import Input from '../Input'
import { t } from '@lingui/macro'
import useENS from '../../hooks/useENS'
import { useLingui } from '@lingui/react'

interface AddressInputPanelProps {
    id?: string
    value: string
    onChange: ( value: string ) => void
}

const AddressInputPanel: FC<AddressInputPanelProps> = ( { id, value, onChange } ) => {
    const { i18n } = useLingui()
    const { address, loading } = useENS( value )

    const handleInput = ( inputVar: any ) => {
        console.log( inputVar )
        const input = inputVar
        const withoutSpaces = input.replace( /\s+/g, '' )
        onChange( withoutSpaces )
    }

    const error = Boolean( value.length > 0 && !loading && !address )

    return (
        <div
            className={ `flex flex-row bg-white dark:bg-dark-primary text-dark-primary dark:text-light-primary rounded-xl items-center transition-all text-sm my-3 border border-red ${error ? 'border-opacity-50' : 'border-opacity-0 '
                }` }
            id={ id }
        >
            <div className="flex items-center justify-between w-full px-5 sm:w-2/5">
                <span className="">{ i18n._( t`Send to:` ) }</span>
                <span className="text-xs underline cursor-pointer text-blue-special" onClick={ () => onChange( null ) }>
                    { i18n._( t`Remove` ) }
                </span>
            </div>
            <div className="flex w-full h-full m-0.5 text-sm sm:w-3/5">
                <Input.Address
                    onUserInput={ handleInput }
                    value={ value }
                    fontSize="14px"
                    className="flex w-full h-full p-3 font-bold transition-all rounded-r bg-light-secondary dark:bg-dark-secondary overflow-ellipsis recipient-address-input placeholder-low-emphesis"
                />
            </div>
        </div>
    )
}

export default AddressInputPanel
