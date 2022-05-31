import { Currency, CurrencyAmount, Ether, JSBI, NATIVE, Token } from '@evmoswap/core-sdk'
import { PairState, useV2Pair } from '../../../hooks/useV2Pairs'
import React, { useCallback, useEffect, useState } from 'react'

import Alert from '../../../components/Alert'
import { AutoColumn } from '../../../components/Column'
import { AutoRow } from '../../../components/Row'
import Back from '../../../components/Back'
import Container from '../../../components/Container'
import CurrencySelectPanel from '../../../components/CurrencySelectPanel'
import Dots from '../../../components/Dots'
import Head from 'next/head'
import Link from 'next/link'
import { MinimalPositionCard } from '../../../components/PositionCard'
import { Plus } from 'react-feather'
import Typography from '../../../components/Typography'
import Web3Connect from '../../../components/Web3Connect'
import { currencyId } from '../../../functions/currency'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import { useLingui } from '@lingui/react'
import { usePairAdder } from '../../../state/user/hooks'
import { useTokenBalance } from '../../../state/wallet/hooks'
import DoubleGlowShadow from 'app/components/DoubleGlowShadow'
import { PlusIcon } from '@heroicons/react/solid'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()

  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(() => (chainId ? NATIVE[chainId] : null))
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = useV2Pair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.quotient, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.quotient, JSBI.BigInt(0))
    )

  const position: CurrencyAmount<Token> | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)

  const hasPosition = Boolean(position && JSBI.greaterThan(position.quotient, JSBI.BigInt(0)))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const prerequisiteMessage = (
    <div className="p-5 text-center text-base rounded-2xl bg-light-primary dark:bg-dark-primary text-dark-primary dark:text-light-primary transition-all">
      {i18n._(t`Select a token to find your liquidity`)}
    </div>
  )

  return (
    <Container id="find-pool-page" className="p-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>{i18n._(t`Find Pool`)} | EvmoSwap</title>
        <meta key="description" name="description" content="Find pool" />
      </Head>
      <div className="py-4 mb-3 space-y-3">
        <Back />
        <div className="text-2xl font-extrabold text-dark-primary dark:text-light-primary transition-all">
          {i18n._(t`Import Pool`)}
        </div>
      </div>

      <DoubleGlowShadow>
        <div className="grid gap-4 p-3 md:p-4 lg:p-6 transition-all rounded-3xl z-0 text-dark-primary dark:text-light-primary ">
          <div className="grid">
            <CurrencySelectPanel
              currency={currency0}
              onClick={() => setActiveField(Fields.TOKEN0)}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={currency1}
              id="pool-currency-input"
            />
            <AutoColumn justify="space-between" className="pl-2 -my-5 transition-all z-0">
              <div className="flex flex-wrap justify-center w-full px-4">
                <div className="p-1.5 rounded-2.5xl bg-light-bg dark:bg-dark-bg transition-all">
                  <div className="p-2 transition-all bg-white rounded-2xl hover:bg-white/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 text-dark-bg dark:text-light-bg">
                    <PlusIcon width={24} height={24} />
                  </div>
                </div>
              </div>
            </AutoColumn>
            <CurrencySelectPanel
              currency={currency1}
              onClick={() => setActiveField(Fields.TOKEN1)}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={currency0}
              id="pool-currency-output"
            />
          </div>

          {hasPosition && (
            <div className="text-base font-extrabold mt-4 -mb-6 hover:opacity-60 transition-all">
              <Link href={`/pool`}>
                <a className="text-center">{i18n._(t`Manage this pool`)}</a>
              </Link>
            </div>
          )}

          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} border="1px solid #CED0D9" />
              ) : (
                <div className="p-5 rounded-2xl text-base bg-light-primary dark:bg-dark-primary transition-all">
                  <AutoColumn gap="sm" justify="center">
                    {i18n._(t`You don’t have liquidity in this pool yet`)}
                    <Link href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      <a className="text-center text-blue-special hover:opacity-60 transition-all underline">
                        {i18n._(t`Add liquidity`)}
                      </a>
                    </Link>
                  </AutoColumn>
                </div>
              )
            ) : validPairNoLiquidity ? (
              <div className="p-5 rounded-2xl text-base bg-light-primary dark:bg-dark-primary transition-all">
                <AutoColumn gap="sm" justify="center">
                  {i18n._(t`No pool found`)}
                  <Link href={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                    <a className="text-center text-blue-special hover:opacity-60 transition-all underline">
                      {i18n._(t`Create pool`)}
                    </a>
                  </Link>
                </AutoColumn>
              </div>
            ) : pairState === PairState.INVALID ? (
              <div className="p-5 text-center rounded-2xl text-base bg-light-primary dark:bg-dark-primary transition-all">
                {i18n._(t`Invalid pair`)}
              </div>
            ) : pairState === PairState.LOADING ? (
              <div className="p-5 text-center rounded-2xl text-base bg-light-primary dark:bg-dark-primary transition-all">
                <Dots>{i18n._(t`Loading`)}</Dots>
              </div>
            ) : null
          ) : !account ? (
            <Web3Connect className="w-full" size="lg" color="gradient" />
          ) : (
            prerequisiteMessage
          )}
        </div>
      </DoubleGlowShadow>
      <div className="flex text-dark-primary/80 dark:text-light-primary/80 transition-all text-base pt-4">
        <p className="font-extrabold px-2">{i18n._(t`Tips: `)}</p>
        {i18n._(t`Use this tool to find pairs that don't automatically appear in the interface`)}
      </div>
    </Container>
  )
}
