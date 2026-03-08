import type { BlockchainReader } from '../ports/blockchain-reader.js';
import type { TronGateway } from '../ports/tron-gateway.js';
import { env } from '../../config/env.js';
import type { BlockchainNetwork } from '../../config/blockchain-networks.js';
import { getBlockchainNetworkConfig } from '../../config/blockchain-networks.js';
import { parseKoriAmount } from '../../domain/value-objects/money.js';
import { DomainError } from '../../domain/errors/domain-error.js';

export class OnchainService {
  constructor(
    private readonly blockchainReader: BlockchainReader,
    private readonly tronGateway: TronGateway
  ) {}

  async lookupBalance(input: { network: BlockchainNetwork; address: string }) {
    const networkConfig = getBlockchainNetworkConfig(input.network);
    const snapshot = await this.blockchainReader.getWalletMonitoringSnapshot(input.address, {
      network: input.network,
      apiUrl: networkConfig.tronApiUrl,
      tokenContractAddress: networkConfig.contractAddress
    });

    return {
      network: input.network,
      tronApiUrl: networkConfig.tronApiUrl,
      tokenContractAddress: networkConfig.contractAddress,
      wallet: snapshot
    };
  }

  async sendFromHotWallet(input: { network: BlockchainNetwork; toAddress: string; amountKori: number }) {
    if (!env.sandboxDirectOnchainSendEnabled) {
      throw new DomainError(403, 'SANDBOX_ONCHAIN_SEND_DISABLED', 'sandbox direct on-chain send is disabled');
    }

    if (input.network === 'mainnet' && !env.sandboxMainnetDirectOnchainSendEnabled) {
      throw new DomainError(
        403,
        'SANDBOX_MAINNET_ONCHAIN_SEND_DISABLED',
        'mainnet sandbox direct on-chain send is disabled'
      );
    }

    if (env.tronGatewayMode !== 'trc20') {
      throw new DomainError(409, 'TRON_GATEWAY_NOT_TRC20', 'TRON_GATEWAY_MODE must be trc20 for direct on-chain send');
    }

    const networkConfig = getBlockchainNetworkConfig(input.network);
    const { txHash } = await this.tronGateway.broadcastTransfer({
      toAddress: input.toAddress,
      amount: parseKoriAmount(input.amountKori),
      network: input.network,
      apiUrl: networkConfig.tronApiUrl,
      contractAddress: networkConfig.contractAddress
    });

    return {
      network: input.network,
      tronApiUrl: networkConfig.tronApiUrl,
      tokenContractAddress: networkConfig.contractAddress,
      hotWalletAddress: env.hotWalletAddress,
      gatewayMode: env.tronGatewayMode,
      toAddress: input.toAddress,
      amount: input.amountKori.toString(),
      txHash,
      sentAt: new Date().toISOString()
    };
  }
}
