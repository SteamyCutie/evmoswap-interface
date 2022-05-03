import { getAddress } from '@ethersproject/address'
import { ChainId, CurrencyAmount, Token } from '@sushiswap/core-sdk'
import { useAllTokens } from 'app/hooks/Tokens'
import { useMigrateDashboardContract } from 'app/hooks/useContract'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback, useEffect, useRef, useState } from 'react'

import LPToken from './LPToken'

export interface LPTokensState {
  updateLPTokens: () => Promise<void>
  lpTokens: LPToken[]
  selectedLPToken?: LPToken
  setSelectedLPToken: (token?: LPToken) => void
  selectedLPTokenAllowed: boolean
  setSelectedLPTokenAllowed: (allowed: boolean) => void
  loading: boolean
  updatingLPTokens: boolean
}

const useLPTokensState = () => {
  const { account, chainId } = useActiveWeb3React()
  const dashboardContract = useMigrateDashboardContract()
  const [lpTokens, setLPTokens] = useState<LPToken[]>([])
  const [selectedLPToken, setSelectedLPToken] = useState<LPToken>()
  const [selectedLPTokenAllowed, setSelectedLPTokenAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const tokens = useAllTokens()
  const updatingLPTokens = useRef(false)
  const updateLPTokens = useCallback(async () => {
    try {
      updatingLPTokens.current = true
      const requests: any = {
        [ChainId.ETHEREUM]: [
          `https://api.covalenthq.com/v1/${ChainId.ETHEREUM}/address/${String(
            account
          ).toLowerCase()}/stacks/uniswap_v2/balances/?key=ckey_cba3674f2ce5450f9d5dd290589&page-size=1000`,
        ],
        [ChainId.BSC_TESTNET]: [
          `https://api.covalenthq.com/v1/${ChainId.BSC_TESTNET}/address/${String(
            account
          ).toLowerCase()}/stacks/pancakeswap/balances/?key=ckey_cba3674f2ce5450f9d5dd290589&page-size=1000`,
          `https://api.covalenthq.com/v1/${ChainId.BSC_TESTNET}/address/${String(
            account
          ).toLowerCase()}/stacks/pancakeswap_v2/balances/?key=ckey_cba3674f2ce5450f9d5dd290589&page-size=1000`,
        ],
      }

      const responses: any = await Promise.all(requests[chainId].map((request: any) => fetch(request)))

      let userLP = []

      if (chainId === ChainId.ETHEREUM) {
        const { data } = await responses[0].json()
        userLP = data?.['uniswap_v2']?.balances
          ?.filter((balance: any) => balance.pool_token.balance !== '0')
          .map((balance: any) => ({
            ...balance,
            version: 'v2',
          }))
      } else if (chainId === ChainId.BSC) {
        const { data: dataV1 } = await responses[0].json()
        const { data: dataV2 } = await responses[1].json()

        userLP = [
          // ...dataV1?.['pancakeswap']?.balances
          //   ?.filter((balance: any) => balance.pool_token.balance !== '0')
          //   .map((balance: any) => ({
          //     ...balance,
          //     version: 'v1',
          //   })),
          ...dataV2?.['pancakeswap']?.balances
            ?.filter((balance: any) => balance.pool_token.balance !== '0')
            .map((balance: any) => ({
              ...balance,
              version: 'v2',
            })),
        ]
      }

      const tokenDetails = (
        await dashboardContract?.getTokenInfo(
          Array.from(
            new Set(
              userLP?.reduce(
                (a: any, b: any) =>
                  a.push(b.pool_token.contract_address, b.token_0.contract_address, b.token_1.contract_address) && a,
                []
              )
            )
          )
        )
      )?.reduce((acc: any, cur: any) => {
        acc[cur[0]] = { ...cur }
        acc[cur[0]].decimals = acc[cur[0]].decimals.toNumber()
        return acc
      }, {})

      const lpTokens = userLP?.map((pair: any) => {
        const token = new Token(
          chainId as ChainId,
          getAddress(pair.pool_token.contract_address),
          tokenDetails[getAddress(pair.pool_token.contract_address)].decimals,
          tokenDetails[getAddress(pair.pool_token.contract_address)].symbol,
          tokenDetails[getAddress(pair.pool_token.contract_address)].name
        )
        const tokenA = tokenDetails[getAddress(pair.token_0.contract_address)]
        const tokenB = tokenDetails[getAddress(pair.token_1.contract_address)]

        return {
          address: getAddress(pair.pool_token.contract_address),
          decimals: token.decimals,
          name: `${tokenA.symbol}-${tokenB.symbol} LP Token`,
          symbol: `${tokenA.symbol}-${tokenB.symbol}`,
          balance: CurrencyAmount.fromRawAmount(token, pair.pool_token.balance),
          totalSupply: pair.pool_token.total_supply,
          tokenA:
            tokens[getAddress(pair.token_0.contract_address)] ||
            new Token(
              chainId as ChainId,
              tokenA.address || tokenA.token,
              tokenA.decimals,
              tokenA.symbol,
              tokenA.name
            ),
          tokenB:
            tokens[getAddress(pair.token_1.contract_address)] ||
            new Token(
              chainId as ChainId,
              tokenB.address || tokenB.token,
              tokenB.decimals,
              tokenB.symbol,
              tokenB.name
            ),
          version: pair.version,
        } as LPToken
      })
      if (lpTokens) {
        setLPTokens(lpTokens)
      }
    } finally {
      setLoading(false)
      updatingLPTokens.current = false
    }
  }, [chainId, account, dashboardContract, tokens])

  useEffect(() => {
    if (chainId && account && !updatingLPTokens.current) {
      updateLPTokens()
    }
  }, [chainId, account, dashboardContract, tokens])

  return {
    updateLPTokens,
    lpTokens,
    selectedLPToken,
    setSelectedLPToken,
    selectedLPTokenAllowed,
    setSelectedLPTokenAllowed,
    loading,
    updatingLPTokens: updatingLPTokens.current,
  }
}

export default useLPTokensState
