import { env } from './env.js';
import { getBlockchainNetworkConfig } from './blockchain-networks.js';

export type ContractProfile = 'runtime' | 'mainnet' | 'testnet' | 'custom';

type RuntimeContractState = {
  activeProfile: ContractProfile;
  customContractAddress?: string;
};

const state: RuntimeContractState = {
  activeProfile: 'runtime',
  customContractAddress: env.koriTokenContractAddress
};

const getActiveContractAddress = (): string | undefined => {
  switch (state.activeProfile) {
    case 'mainnet':
      return env.mainnetKoriTokenContractAddress;
    case 'testnet':
      return env.testnetKoriTokenContractAddress;
    case 'custom':
      return state.customContractAddress;
    case 'runtime':
    default:
      return env.koriTokenContractAddress;
  }
};

const getActiveTronApiUrl = (): string => {
  switch (state.activeProfile) {
    case 'mainnet':
      return getBlockchainNetworkConfig('mainnet').tronApiUrl;
    case 'testnet':
      return getBlockchainNetworkConfig('testnet').tronApiUrl;
    case 'custom':
    case 'runtime':
    default:
      return env.tronApiUrl;
  }
};

export const getRuntimeContractProfile = () => ({
  activeProfile: state.activeProfile,
  runtimeDefaultContractAddress: env.koriTokenContractAddress,
  activeContractAddress: getActiveContractAddress(),
  activeTronApiUrl: getActiveTronApiUrl(),
  profiles: {
    mainnet: env.mainnetKoriTokenContractAddress,
    testnet: env.testnetKoriTokenContractAddress
  },
  runtimeEditable: env.runtimeProfileEditable
});

export const setRuntimeContractProfile = (profile: ContractProfile, customContractAddress?: string) => {
  state.activeProfile = profile;
  if (profile === 'custom') {
    state.customContractAddress = customContractAddress;
  }
  return getRuntimeContractProfile();
};

export const getEffectiveKoriTokenContractAddress = (): string | undefined => getActiveContractAddress();

export const getEffectiveTronApiUrl = (): string => getActiveTronApiUrl();
