import { Currency, CurrencyAmount } from '@evmoswap/core-sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { RowBetween, RowFixed } from '../../components/Row'

import Column from '../../components/Column'
import { CurrencyLogo } from '../../components/CurrencyLogo'
import { FixedSizeList } from 'react-window'
import Loader from '../../components/Loader'
import { MenuItem } from './styleds'
import { MouseoverTooltip } from '../../components/Tooltip'
import QuestionHelper from '../../components/QuestionHelper'
import Typography from '../../components/Typography'
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMultichainCurrencyBalance } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import { formatNumberScale } from '../../functions'
import { useWeb3React } from '@web3-react/core'
import { BridgeContextName } from '../../constants'

function currencyKey ( currency: Currency ): string {
    return currency.isToken ? currency.address : 'ETHER'
}

const Tag = styled.div`
  background-color: ${( { theme } ) => theme.bg3};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance ( { balance }: { balance: CurrencyAmount<Currency> } ) {
    return (
        <div className="whitespace-nowrap overflow-hidden max-w-[5rem] overflow-ellipsis" title={ balance.toExact() }>
            { formatNumberScale( balance.toSignificant( 4 ), false ) }
        </div>
    )
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TokenListLogoWrapper = styled.img`
  height: 20px;
`

function TokenTags ( { currency }: { currency: Currency } ) {
    if ( !( currency instanceof WrappedTokenInfo ) ) {
        return <span />
    }

    const tags = currency.tags
    if ( !tags || tags.length === 0 ) return <span />

    const tag = tags[ 0 ]

    return (
        <TagContainer>
            <MouseoverTooltip text={ tag.description }>
                <Tag key={ tag.id }>{ tag.name }</Tag>
            </MouseoverTooltip>
            { tags.length > 1 ? (
                <MouseoverTooltip
                    text={ tags
                        .slice( 1 )
                        .map( ( { name, description } ) => `${name}: ${description}` )
                        .join( '; \n' ) }
                >
                    <Tag>...</Tag>
                </MouseoverTooltip>
            ) : null }
        </TagContainer>
    )
}

function CurrencyRow ( {
    currency,
    onSelect,
    isSelected,
    style,
}: {
    currency: Currency
    onSelect: () => void
    isSelected: boolean
    style: CSSProperties
} ) {
    const { account, chainId, library, activate } = useWeb3React( BridgeContextName )
    const key = currencyKey( currency )
    const balance = useMultichainCurrencyBalance( currency.chainId, account ?? undefined, currency )

    // only show add or remove buttons if not on selected list
    return (
        <MenuItem
            id={ `token-item-${key}` }
            style={ style }
            className={ `hover:bg-light-secondary dark:bg-dark-secondary rounded` }
            onClick={ () => ( isSelected ? null : onSelect() ) }
            disabled={ isSelected }
        >
            <div className="flex items-center">
                <CurrencyLogo currency={ currency } size={ 32 } />
            </div>
            <Column>
                <div title={ currency.name } className="text-sm font-medium">
                    { currency.symbol }
                </div>
            </Column>
            <TokenTags currency={ currency } />
            <div className="flex items-center justify-end">
                { balance ? <Balance balance={ balance } /> : account ? <Loader /> : null }
            </div>
        </MenuItem>
    )
}

const BREAK_LINE = 'BREAK'
type BreakLine = typeof BREAK_LINE
function isBreakLine ( x: unknown ): x is BreakLine {
    return x === BREAK_LINE
}

function BreakLineComponent ( { style }: { style: CSSProperties } ) {
    const { i18n } = useLingui()
    return (
        <FixedContentRow style={ style }>
            <RowBetween>
                <RowFixed>
                    <TokenListLogoWrapper src="/tokenlist.svg" />
                    <Typography variant="sm" className="ml-3">
                        { i18n._( t`Expanded results from inactive Token Lists` ) }
                    </Typography>
                </RowFixed>
                <QuestionHelper
                    text={ i18n._( t`Tokens from inactive lists. Import specific tokens below or
            click Manage to activate more lists.`) }
                />
            </RowBetween>
        </FixedContentRow>
    )
}

export default function CurrencyList ( {
    height,
    currencies,
    selectedCurrency,
    onCurrencySelect,
    fixedListRef,
}: {
    height: number
    currencies: Currency[]
    selectedCurrency?: Currency | null
    onCurrencySelect: ( currency: Currency ) => void
    fixedListRef?: MutableRefObject<FixedSizeList | undefined>
} ) {
    const itemData: ( Currency | BreakLine )[] = useMemo( () => {
        return currencies
    }, [ currencies ] )

    const Row = useCallback(
        function TokenRow ( { data, index, style } ) {
            const row: Currency | BreakLine = data[ index ]

            if ( isBreakLine( row ) ) {
                return <BreakLineComponent style={ style } />
            }

            const currency = row

            const isSelected = Boolean( currency && selectedCurrency && selectedCurrency.equals( currency ) )
            const handleSelect = () => currency && onCurrencySelect( currency )

            if ( currency ) {
                return <CurrencyRow style={ style } currency={ currency } isSelected={ isSelected } onSelect={ handleSelect } />
            } else {
                return null
            }
        },
        [ onCurrencySelect, selectedCurrency ]
    )

    const itemKey = useCallback( ( index: number, data: typeof itemData ) => {
        const currency = data[ index ]
        if ( isBreakLine( currency ) ) return BREAK_LINE
        return currencyKey( currency )
    }, [] )

    return (
        <FixedSizeList
            height={ height }
            ref={ fixedListRef as any }
            width="100%"
            itemData={ itemData }
            itemCount={ itemData.length }
            itemSize={ 56 }
            itemKey={ itemKey }
        >
            { Row }
        </FixedSizeList>
    )
}
