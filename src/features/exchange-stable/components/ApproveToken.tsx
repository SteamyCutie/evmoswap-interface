import { Currency, CurrencyAmount } from '@evmoswap/core-sdk';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Button, { ButtonProps } from 'app/components/Button';
import Dots from 'app/components/Dots';
import { ApprovalState, useApproveCallback } from 'app/hooks';
import React, { useEffect } from 'react';

function ApproveToken ( { currencyAmount, spender, onApprovalChange, ...rest }: {
    currencyAmount: CurrencyAmount<Currency>,
    spender: string,
    onApprovalChange?: ( approval: ApprovalState ) => void,
    key?: number
} & ButtonProps ): JSX.Element {

    const [ approval, approveCallback ] = useApproveCallback( currencyAmount, spender )
    console.log( approval )
    useEffect( () => {
        if ( onApprovalChange ) {
            console.log( approval )
            onApprovalChange( approval );
        }
    }, [ approval ] )
    return (
        <Button
            onClick={ approveCallback }
            disabled={ approval === ApprovalState.PENDING }
            { ...rest }
        >
            { approval === ApprovalState.PENDING ? (
                <Dots>{ i18n._( t`Approving ${currencyAmount?.currency?.symbol}` ) }</Dots>
            ) : (
                i18n._( t`Approve ${currencyAmount?.currency?.symbol}` )
            ) }
        </Button>
    );
};

export default ApproveToken;