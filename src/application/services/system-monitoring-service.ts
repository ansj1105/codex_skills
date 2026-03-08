import type { BlockchainReader } from '../ports/blockchain-reader.js';
import type {
  CollectorRunRecord,
  CollectorRunStatus,
  MonitoringRepository,
  StoredWalletMonitoringSnapshot
} from '../ports/monitoring-repository.js';
import type { SystemWalletDescriptor } from '../../config/system-wallets.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class SystemMonitoringService {
  private readonly collectorName = 'wallet_balances';

  constructor(
    private readonly reader: BlockchainReader,
    private readonly repository: MonitoringRepository,
    private readonly requestGapMs: number
  ) {}

  async collectWallets(wallets: SystemWalletDescriptor[]): Promise<{
    snapshots: StoredWalletMonitoringSnapshot[];
    run: CollectorRunRecord;
  }> {
    const startedAt = new Date().toISOString();
    const prioritizedWallets = this.prioritize(wallets);
    const snapshots: StoredWalletMonitoringSnapshot[] = [];

    for (let index = 0; index < prioritizedWallets.length; index += 1) {
      const wallet = prioritizedWallets[index];
      const snapshot = await this.reader.getWalletMonitoringSnapshot(wallet.address);
      snapshots.push({
        walletCode: wallet.code,
        ...snapshot
      });

      if (index < prioritizedWallets.length - 1 && this.requestGapMs > 0) {
        await sleep(this.requestGapMs);
      }
    }

    const finishedAt = new Date().toISOString();
    const errorCount = snapshots.filter((snapshot) => snapshot.status !== 'ok').length;
    const run: CollectorRunRecord = {
      collectorName: this.collectorName,
      status: this.resolveRunStatus(snapshots.length, errorCount),
      successCount: snapshots.length - errorCount,
      errorCount,
      totalCount: snapshots.length,
      startedAt,
      finishedAt,
      errorMessage: errorCount > 0 ? `${errorCount} wallet monitoring reads failed` : undefined
    };

    await this.repository.saveWalletSnapshots({
      collectorName: this.collectorName,
      startedAt,
      finishedAt,
      snapshots,
      status: run.status,
      errorMessage: run.errorMessage
    });

    return { snapshots, run };
  }

  async getStoredWallets(wallets: SystemWalletDescriptor[]) {
    const rows = await this.repository.getWalletSnapshots(wallets.map((wallet) => wallet.code));
    const byCode = new Map(rows.map((row) => [row.walletCode, row]));
    return wallets
      .map((wallet) => byCode.get(wallet.code))
      .filter((snapshot): snapshot is StoredWalletMonitoringSnapshot => Boolean(snapshot));
  }

  async getCollectorRuns() {
    return this.repository.getLatestCollectorRuns();
  }

  private prioritize(wallets: SystemWalletDescriptor[]) {
    const hot = wallets.find((wallet) => wallet.code === 'hot');
    const rest = wallets.filter((wallet) => wallet.code !== 'hot');
    return hot ? [hot, ...rest] : wallets;
  }

  private resolveRunStatus(totalCount: number, errorCount: number): CollectorRunStatus {
    if (errorCount === 0) {
      return 'success';
    }
    if (errorCount >= totalCount) {
      return 'failed';
    }
    return 'degraded';
  }
}
