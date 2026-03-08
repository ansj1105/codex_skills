import type { WalletMonitoringSnapshot } from './blockchain-reader.js';

export type CollectorRunStatus = 'success' | 'degraded' | 'failed';

export interface StoredWalletMonitoringSnapshot extends WalletMonitoringSnapshot {
  walletCode: string;
}

export interface CollectorRunRecord {
  collectorName: string;
  status: CollectorRunStatus;
  successCount: number;
  errorCount: number;
  totalCount: number;
  startedAt: string;
  finishedAt: string;
  errorMessage?: string;
}

export interface MonitoringRepository {
  saveWalletSnapshots(input: {
    collectorName: string;
    startedAt: string;
    finishedAt: string;
    snapshots: StoredWalletMonitoringSnapshot[];
    status: CollectorRunStatus;
    errorMessage?: string;
  }): Promise<void>;
  getWalletSnapshots(codes: string[]): Promise<StoredWalletMonitoringSnapshot[]>;
  getLatestCollectorRuns(): Promise<CollectorRunRecord[]>;
}
