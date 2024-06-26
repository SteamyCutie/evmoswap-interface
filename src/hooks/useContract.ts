import {
    BAR_ADDRESS,
    BENTOBOX_ADDRESS,
    CHAINLINK_ORACLE_ADDRESS,
    ChainId,
    ENS_REGISTRAR_ADDRESS,
    FACTORY_ADDRESS,
    MAKER_ADDRESS,
    MERKLE_DISTRIBUTOR_ADDRESS,
    MULTICALL2_ADDRESS,
    ROUTER_ADDRESS,
    SUSHI_ADDRESS,
    TIMELOCK_ADDRESS,
    WNATIVE_ADDRESS,
} from '@evmoswap/core-sdk'
import { STOP_LIMIT_ORDER_ADDRESS } from '@sushiswap/limit-order-sdk'

import {
    ARGENT_WALLET_DETECTOR_ABI,
    ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS,
} from '../constants/abis/argent-wallet-detector'
import { AddressZero } from '@ethersproject/constants'
import BAR_ABI from '../constants/abis/bar.json'
import BENTOBOX_ABI from '../constants/abis/bentobox.json'
import CHAINLINK_ORACLE_ABI from '../constants/abis/chainlink-oracle.json'
import CLONE_REWARDER_ABI from '../constants/abis/clone-rewarder.json'
import COMPLEX_REWARDER_ABI from '../constants/abis/complex-rewarder.json'
import { Contract } from '@ethersproject/contracts'
import EIP_2612_ABI from '../constants/abis/eip-2612.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ERC20_ABI from '../constants/abis/erc20.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import FACTORY_ABI from '../constants/abis/factory.json'
import INARI_ABI from '../constants/abis/inari.json'
import IUniswapV2PairABI from '../constants/abis/uniswap-v2-pair.json'
import LIMIT_ORDER_ABI from '../constants/abis/limit-order.json'
import LIMIT_ORDER_HELPER_ABI from '../constants/abis/limit-order-helper.json'
import MAKER_ABI from '../constants/abis/maker.json'
import MASTERCHEF_ABI from '../constants/abis/masterchef.json'
import MERKLE_DISTRIBUTOR_ABI from '../constants/abis/merkle-distributor.json'
import VEST_MERKLE_DISTRIBUTOR_ABI from '../constants/abis/vest-merkle-distributor.json'
import MULTICALL2_ABI from '../constants/abis/multicall2.json'
import ROUTER_ABI from '../constants/abis/router.json'
import SUSHI_ABI from '../constants/abis/sushi.json'
import TIMELOCK_ABI from '../constants/abis/timelock.json'
import UNI_FACTORY_ABI from '../constants/abis/uniswap-v2-factory.json'
import WETH9_ABI from '../constants/abis/weth.json'
import ZENKO_ABI from '../constants/abis/zenko.json'
import SEEDSALE_ABI from '../constants/abis/seedSale.json'
import FEE_DISTRIBUTOR_ABI from '../constants/abis/FeeDistributor.json'
import MULTI_FEE_DISTRIBUTION_ABI from '../constants/abis/MultiFeeDistribution.json'
import PUBLICSALE_ABI from '../constants/abis/publicSale.json'
import DASHBOARD_ABI from '../constants/abis/dashboard.json'
import REWARD_POOL_ABI from '../constants/abis/rewardpool.json'
import VOTING_ESCROW_ABI from '../constants/abis/voting-escrow.json'
import VOTING_ESCROW_AT_ABI from '../constants/abis/voting-escrow-at.json'
import ANYSWAP_ERC20_ABI from '../constants/abis/anyswap_erc20.json'
import EMOSVAULT_ABI from '../constants/abis/emosVault.json'
import IFO_ABI from '../constants/abis/ifo.json'
import VOTE_ABI from '../constants/abis/vote.json'
import ZAP_ABI from '../constants/abis/zap.json'
import FAUCET_ABI from '../constants/abis/faucet.json'
import PRIATESALE_ABI from '../constants/abis/privatesale.json'
import EVMOROLL_ABI from '../constants/abis/evmoroll.json'
import MIGRATE_DASHBOARD_ABI from '../constants/abis/migrateDashboard.json'
import TREASURY_ABI from '../constants/abis/treasury.json'
import SIMPLE_INCENTIVE_CONTROLLER_ABI from '../constants/abis/simple-incentives-controller.json'

import { getContract } from '../functions/contract'
import { useActiveWeb3React } from '../services/web3'
import { useMemo } from 'react'
import {
    DASHBOARD_ADDRESS,
    MASTERCHEF_ADDRESS,
    SEED_SALE_ADDRESS,
    VOTING_ESCROW_ADDRESS,
    EMOSVAULT_ADDRESS,
    REWARD_POOL_ADDRESS,
    VOTE_ADDRESS,
    ZAP_ADDRESS,
    FAUCET_ADDRESS,
    PRIVATE_SALE_ADDRESS,
    PUBLIC_SALE_ADDRESS,
    MULTI_FEE_DISTRIBUTION_ADDRESSES,
    FEE_DISTRIBUTOR_ADDRESSES,
    EVMOROLL_ADDRESS,
    MIGRATE_DASHBOARD_ADDRESS,
    TREASURY_ADDRESS,
} from '../constants/addresses'
import LPToken from 'app/features/migration/LPToken'
import { Interface } from '@ethersproject/abi'

const UNI_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export function useEIP2612Contract ( tokenAddress?: string ): Contract | null {
    return useContract( tokenAddress, EIP_2612_ABI, false )
}

// returns null on errors
export function useContract ( address: string | undefined, ABI: any, withSignerIfPossible = true ): Contract | null {
    const { library, account } = useActiveWeb3React()
    return useMemo( () => {
        if ( !address || address === AddressZero || !ABI || !library ) return null
        try {
            return getContract( address, ABI, library, withSignerIfPossible && account ? account : undefined )
        } catch ( error ) {
            console.error( 'Failed to get contract', error )
            return null
        }
    }, [ address, ABI, library, withSignerIfPossible, account ] )
}

export function useTokenContract ( tokenAddress?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( tokenAddress, ERC20_ABI, withSignerIfPossible )
}

export function useWETH9Contract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && WNATIVE_ADDRESS[ chainId ], WETH9_ABI, withSignerIfPossible )
}

export function useArgentWalletDetectorContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract(
        chainId === ChainId.ETHEREUM ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
        ARGENT_WALLET_DETECTOR_ABI,
        false
    )
}

export function useENSRegistrarContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && ENS_REGISTRAR_ADDRESS[ chainId ], ENS_ABI, withSignerIfPossible )
}

export function useENSResolverContract ( address: string | undefined, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible )
}

export function useBytes32TokenContract ( tokenAddress?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible )
}

export function usePairContract ( pairAddress?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( pairAddress, IUniswapV2PairABI, withSignerIfPossible )
}

export function useMerkleDistributorContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId ? MERKLE_DISTRIBUTOR_ADDRESS[ chainId ] : undefined, MERKLE_DISTRIBUTOR_ABI, true )
}

export function useProtocolMerkleDistributorContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId ? '0x1026cbed7b7E851426b959BC69dcC1bf5876512d' : undefined, MERKLE_DISTRIBUTOR_ABI, true )
}

export function useMulticall2Contract () {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && MULTICALL2_ADDRESS[ chainId ], MULTICALL2_ABI, false )
}

export function useEmosContract ( withSignerIfPossible = true ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && SUSHI_ADDRESS[ chainId ], SUSHI_ABI, withSignerIfPossible )
}

export function useMasterChefContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && MASTERCHEF_ADDRESS[ chainId ], MASTERCHEF_ABI, withSignerIfPossible )
}

export function useFactoryContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && FACTORY_ADDRESS[ chainId ], FACTORY_ABI, false )
}

export function useRouterContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( ROUTER_ADDRESS[ chainId ], ROUTER_ABI, true )
}

export function useSushiBarContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && BAR_ADDRESS[ chainId ], BAR_ABI, withSignerIfPossible )
}

export function useMakerContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && MAKER_ADDRESS[ chainId ], MAKER_ABI, false )
}

export function useTimelockContract (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && TIMELOCK_ADDRESS[ chainId ], TIMELOCK_ABI, false )
}

export function useBentoBoxContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && BENTOBOX_ADDRESS[ chainId ], BENTOBOX_ABI, withSignerIfPossible )
}

export function useChainlinkOracle (): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( chainId && CHAINLINK_ORACLE_ADDRESS[ chainId ], CHAINLINK_ORACLE_ABI, false )
}

export function useUniV2FactoryContract (): Contract | null {
    return useContract( UNI_FACTORY_ADDRESS, UNI_FACTORY_ABI, false )
}

export function useComplexRewarderContract ( address, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( address, COMPLEX_REWARDER_ABI, withSignerIfPossible )
}

export function useCloneRewarderContract ( address, withSignerIfPossibe?: boolean ): Contract | null {
    return useContract( address, CLONE_REWARDER_ABI, withSignerIfPossibe )
}

export function useLimitOrderContract ( withSignerIfPossibe?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( STOP_LIMIT_ORDER_ADDRESS[ chainId ], LIMIT_ORDER_ABI, withSignerIfPossibe )
}

export function useLimitOrderHelperContract ( withSignerIfPossible?: boolean ): Contract | null {
    return useContract( '0xe2f736B7d1f6071124CBb5FC23E93d141CD24E12', LIMIT_ORDER_HELPER_ABI, withSignerIfPossible )
}

export function useInariContract ( withSignerIfPossible?: boolean ): Contract | null {
    return useContract( '0x195E8262AA81Ba560478EC6Ca4dA73745547073f', INARI_ABI, withSignerIfPossible )
}

export function useZenkoContract ( withSignerIfPossible?: boolean ): Contract | null {
    return useContract( '0xa8f676c49f91655ab3b7c3ea2b73bb3088b2bc1f', ZENKO_ABI, withSignerIfPossible )
}

// add new address for evmoswapv2
export function useSeedSaleContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( SEED_SALE_ADDRESS[ chainId ], SEEDSALE_ABI, withSignerIfPossible )
}

export function usePublicSaleContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( PUBLIC_SALE_ADDRESS[ chainId ], PUBLICSALE_ABI, withSignerIfPossible )
}

export function useDashboardContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( DASHBOARD_ADDRESS[ chainId ], DASHBOARD_ABI, withSignerIfPossible )
}

// This is a specifically function for balanceOf(address, timestamp) etc
export function useVotingEscrowAtContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( VOTING_ESCROW_ADDRESS[ chainId ], VOTING_ESCROW_AT_ABI, withSignerIfPossible )
}

export function useAnyswapTokenContract ( tokenAddress?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( tokenAddress, ANYSWAP_ERC20_ABI, withSignerIfPossible )
}

export function useEmosVaultContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( EMOSVAULT_ADDRESS[ chainId ], EMOSVAULT_ABI, withSignerIfPossible )
}

export function useIfoContract ( tokenAddress?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( tokenAddress, IFO_ABI, withSignerIfPossible )
}

export function useVotingContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( VOTE_ADDRESS[ chainId ], VOTE_ABI, withSignerIfPossible )
}

export function useZapContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( ZAP_ADDRESS[ chainId ], ZAP_ABI, withSignerIfPossible )
}

export function useFaucetContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( FAUCET_ADDRESS[ chainId ], FAUCET_ABI, withSignerIfPossible )
}

export function usePrivateSaleContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( PRIVATE_SALE_ADDRESS[ chainId ], PRIATESALE_ABI, withSignerIfPossible )
}

export function useFeeDistributorContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( FEE_DISTRIBUTOR_ADDRESSES[ chainId ], FEE_DISTRIBUTOR_ABI, withSignerIfPossible )
}

export function useMultiFeeDistributionContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( MULTI_FEE_DISTRIBUTION_ADDRESSES[ chainId ], MULTI_FEE_DISTRIBUTION_ABI, withSignerIfPossible )
}

export function useRewardPoolContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( REWARD_POOL_ADDRESS[ chainId ], REWARD_POOL_ABI, withSignerIfPossible )
}

export function useVotingEscrowContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( VOTING_ESCROW_ADDRESS[ chainId ], VOTING_ESCROW_ABI, withSignerIfPossible )
}

export function useEvmoRollContract ( dex: LPToken[ 'dex' ] ): Contract | null {
    const { chainId } = useActiveWeb3React()
    const address = EVMOROLL_ADDRESS?.[ chainId ]?.[ dex ];
    return useContract( address, EVMOROLL_ABI, true )
}

export function useMigrateDashboardContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( MIGRATE_DASHBOARD_ADDRESS[ chainId ], MIGRATE_DASHBOARD_ABI, withSignerIfPossible )
}

export function useTreasuryContract ( withSignerIfPossible?: boolean ): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract( TREASURY_ADDRESS[ chainId ], TREASURY_ABI, withSignerIfPossible )
}

export const SIMPLE_INCENTIVE_CONTROLLER_INTERFACE = new Interface( SIMPLE_INCENTIVE_CONTROLLER_ABI );
export function useSimpleIncentiveContract ( address?: string, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( address, SIMPLE_INCENTIVE_CONTROLLER_ABI, withSignerIfPossible )
}

export function useAirdropContract ( address: string | undefined, isLinear?: boolean, withSignerIfPossible?: boolean ): Contract | null {
    return useContract( address, isLinear ? VEST_MERKLE_DISTRIBUTOR_ABI : MERKLE_DISTRIBUTOR_ABI, withSignerIfPossible )
}