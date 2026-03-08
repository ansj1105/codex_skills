import type {
  CollectorRunRecord,
  MonitoringRepository,
  StoredWalletMonitoringSnapshot
} from '../../application/ports/monitoring-repository.js';

export class InMemoryMonitoringRepository implements MonitoringRepository {
  private readonly walletSnapshots = new Map<string, StoredWalletMonitoringSnapshot>();
  private readonly collectorRuns = new Map<string, CollectorRunRecord>();

  async saveWalletSnapshots(input: {
    collectorName: string;
    startedAt: string;
    finishedAt: string;
    snapshots: StoredWalletMonitoringSnapshot[];
    status: CollectorRunRecord['status'];
    errorMessage?: string;
  }): Promise<void> {
    for (const snapshot of input.snapshots) {
      this.walletSnapshots.set(snapshot.walletCode, { ...snapshot });
    }

    this.collectorRuns.set(input.collectorName, {
      collectorName: input.collectorName,
      status: input.status,
      successCount: input.snapshots.filter((snapshot) => snapshot.status === 'ok').length,
      errorCount: input.snapshots.filter((snapshot) => snapshot.status !== 'ok').length,
      totalCount: input.snapshots.length,
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
      errorMessage: input.errorMessage
    });
  }

  async getWalletSnapshots(codes: string[]): Promise<StoredWalletMonitoringSnapshot[]> {
    return codes
      .map((code) => this.walletSnapshots.get(code))
      .filter((snapshot): snapshot is StoredWalletMonitoringSnapshot => Boolean(snapshot))
      .map((snapshot) => ({ ...snapshot }));
  }

  async getLatestCollectorRuns(): Promise<CollectorRunRecord[]> {
    return [...this.collectorRuns.values()].map((run) => ({ ...run }));
  }
}
