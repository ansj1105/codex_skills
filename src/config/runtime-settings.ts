import { env } from './env.js';

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

export const getRuntimeContractProfile = () => ({
  activeProfile: state.activeProfile,
  runtimeDefaultContractAddress: env.koriTokenContractAddress,
  activeContractAddress: getActiveContractAddress(),
  profiles: {
    mainnet: env.mainnetKoriTokenContractAddress,
    testnet: env.testnetKoriTokenContractAddress
  },
  runtimeEditable: env.nodeEnv !== 'production'
});

export const setRuntimeContractProfile = (profile: ContractProfile, customContractAddress?: string) => {
  state.activeProfile = profile;
  if (profile === 'custom') {
    state.customContractAddress = customContractAddress;
  }
  return getRuntimeContractProfile();
};

export const getEffectiveKoriTokenContractAddress = (): string | undefined => getActiveContractAddress();
