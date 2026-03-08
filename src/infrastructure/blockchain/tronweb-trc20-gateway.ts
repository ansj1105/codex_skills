import { TronWeb } from 'tronweb';
import { DomainError } from '../../domain/errors/domain-error.js';
import { env } from '../../config/env.js';
import { getBlockchainNetworkConfig } from '../../config/blockchain-networks.js';
import { getEffectiveKoriTokenContractAddress, getEffectiveTronApiUrl } from '../../config/runtime-settings.js';
import type { BroadcastRequest, TronGateway } from '../../application/ports/tron-gateway.js';

const TRC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export class TronWebTrc20Gateway implements TronGateway {
  constructor() {
    const derivedAddress = TronWeb.address.fromPrivateKey(env.hotWalletPrivateKey);
    if (!derivedAddress || derivedAddress !== env.hotWalletAddress) {
      throw new Error('HOT_WALLET_PRIVATE_KEY does not match HOT_WALLET_ADDRESS');
    }
  }

  async broadcastTransfer(request: BroadcastRequest): Promise<{ txHash: string }> {
    const contractAddress =
      request.contractAddress ??
      (request.network ? getBlockchainNetworkConfig(request.network).contractAddress : getEffectiveKoriTokenContractAddress());
    if (!contractAddress) {
      throw new DomainError(500, 'CONFIG_ERROR', 'KORI_TOKEN_CONTRACT_ADDRESS is required for TRC20 transfers');
    }

    const tronWeb = this.createTronWeb(
      request.apiUrl ??
        (request.network ? getBlockchainNetworkConfig(request.network).tronApiUrl : getEffectiveTronApiUrl())
    );
    const contract = await tronWeb.contract(TRC20_ABI, contractAddress).at(contractAddress);
    const txHash = await contract.transfer(request.toAddress, request.amount.toString()).send({
      feeLimit: env.tronFeeLimitSun,
      shouldPollResponse: false
    });

    return { txHash };
  }

  async getTransactionReceipt(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    const info = await this.createTronWeb(getEffectiveTronApiUrl()).trx.getTransactionInfo(txHash);
    if (!info || Object.keys(info).length === 0) {
      return 'pending';
    }
    if (info.result === 'FAILED') {
      return 'failed';
    }
    return 'confirmed';
  }

  private createTronWeb(fullHost: string) {
    return new TronWeb({
      fullHost,
      headers: env.tronApiKey
        ? {
            'TRON-PRO-API-KEY': env.tronApiKey
          }
        : undefined,
      privateKey: env.hotWalletPrivateKey
    });
  }
}
