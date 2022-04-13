import { CurrencyAmount, Token } from '@evmoswap/core-sdk'

type TokenAddress = string

export type TokenBalancesMap = Record<TokenAddress, CurrencyAmount<Token>>
