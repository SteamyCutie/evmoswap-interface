import { useContract } from 'app/hooks'
import { Contract } from '@ethersproject/contracts'
import MULTI_FEE_DISTRIBUTION_ABI from '../constants/abis/MultiFeeDistribution.json'
import FEE_DISTRIBUTOR_ABI from '..constants/abis/FeeDistributor.json'
import { useActiveWeb3React } from 'app/services/web3'
import { FEE_DISTRIBUTOR_ADDRESSES, MULTI_FEE_DISTRIBUTION_ADDRESSES } from 'app/constants/addresses'


