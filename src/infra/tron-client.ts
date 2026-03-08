import type { BlockchainNetwork } from '../config/blockchain-networks.js';

export interface BroadcastRequest {
  toAddress: string;
  amount: bigint;
  network?: BlockchainNetwork;
  apiUrl?: string;
  contractAddress?: string;
}

export type TronReceiptStatus = 'pending' | 'confirmed' | 'failed';

export interface TronClient {
  broadcastTransfer(request: BroadcastRequest): Promise<{ txHash: string }>;
  getTransactionReceipt(txHash: string): Promise<TronReceiptStatus>;
}
