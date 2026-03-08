import { env } from './env.js';

export type BlockchainNetwork = 'mainnet' | 'testnet';

export const getBlockchainNetworkConfig = (network: BlockchainNetwork) => ({
  network,
  tronApiUrl: network === 'mainnet' ? env.mainnetTronApiUrl : env.testnetTronApiUrl,
  contractAddress:
    network === 'mainnet' ? env.mainnetKoriTokenContractAddress : env.testnetKoriTokenContractAddress
});

export const buildBlockchainNetworkCatalog = () => ({
  mainnet: getBlockchainNetworkConfig('mainnet'),
  testnet: getBlockchainNetworkConfig('testnet')
});
