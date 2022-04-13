import { ChainId } from '@evmoswap/core-sdk'
const THE_GRAPH = 'https://api.thegraph.com'
export const GRAPH_HOST = {
  [ChainId.ETHEREUM]: THE_GRAPH,
  [ChainId.EVMOS]: 'https://graph.evmoswap.org',
}
