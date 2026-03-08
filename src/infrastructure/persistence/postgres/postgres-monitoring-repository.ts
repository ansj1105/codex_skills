import { randomUUID } from 'node:crypto';
import type { Kysely } from 'kysely';
import type {
  CollectorRunRecord,
  MonitoringRepository,
  StoredWalletMonitoringSnapshot
} from '../../../application/ports/monitoring-repository.js';
import type { KorionDatabase } from './db-schema.js';

export class PostgresMonitoringRepository implements MonitoringRepository {
  constructor(private readonly db: Kysely<KorionDatabase>) {}

  async saveWalletSnapshots(input: {
    collectorName: string;
    startedAt: string;
    finishedAt: string;
    snapshots: StoredWalletMonitoringSnapshot[];
    status: CollectorRunRecord['status'];
    errorMessage?: string;
  }): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      for (const snapshot of input.snapshots) {
        await trx
          .insertInto('wallet_monitor_current')
          .values({
            wallet_code: snapshot.walletCode,
            address: snapshot.address,
            token_symbol: snapshot.tokenSymbol,
            token_contract_address: snapshot.tokenContractAddress ?? null,
            token_balance: snapshot.tokenBalance ?? null,
            token_raw_balance: snapshot.tokenRawBalance ?? null,
            token_decimals: snapshot.tokenDecimals ?? null,
            trx_balance: snapshot.trxBalance ?? null,
            trx_raw_balance: snapshot.trxRawBalance ?? null,
            fetched_at: snapshot.fetchedAt,
            status: snapshot.status,
            error_message: snapshot.error ?? null,
            updated_at: input.finishedAt
          })
          .onConflict((oc) =>
            oc.column('wallet_code').doUpdateSet({
              address: snapshot.address,
              token_symbol: snapshot.tokenSymbol,
              token_contract_address: snapshot.tokenContractAddress ?? null,
              token_balance: snapshot.tokenBalance ?? null,
              token_raw_balance: snapshot.tokenRawBalance ?? null,
              token_decimals: snapshot.tokenDecimals ?? null,
              trx_balance: snapshot.trxBalance ?? null,
              trx_raw_balance: snapshot.trxRawBalance ?? null,
              fetched_at: snapshot.fetchedAt,
              status: snapshot.status,
              error_message: snapshot.error ?? null,
              updated_at: input.finishedAt
            })
          )
          .execute();

        await trx
          .insertInto('wallet_monitor_history')
          .values({
            snapshot_id: randomUUID(),
            collector_name: input.collectorName,
            wallet_code: snapshot.walletCode,
            address: snapshot.address,
            token_symbol: snapshot.tokenSymbol,
            token_contract_address: snapshot.tokenContractAddress ?? null,
            token_balance: snapshot.tokenBalance ?? null,
            token_raw_balance: snapshot.tokenRawBalance ?? null,
            token_decimals: snapshot.tokenDecimals ?? null,
            trx_balance: snapshot.trxBalance ?? null,
            trx_raw_balance: snapshot.trxRawBalance ?? null,
            fetched_at: snapshot.fetchedAt,
            status: snapshot.status,
            error_message: snapshot.error ?? null,
            created_at: input.finishedAt
          })
          .execute();
      }

      await trx
        .insertInto('monitor_collector_runs')
        .values({
          run_id: randomUUID(),
          collector_name: input.collectorName,
          status: input.status,
          success_count: input.snapshots.filter((snapshot) => snapshot.status === 'ok').length,
          error_count: input.snapshots.filter((snapshot) => snapshot.status !== 'ok').length,
          total_count: input.snapshots.length,
          error_message: input.errorMessage ?? null,
          started_at: input.startedAt,
          finished_at: input.finishedAt
        })
        .execute();
    });
  }

  async getWalletSnapshots(codes: string[]): Promise<StoredWalletMonitoringSnapshot[]> {
    if (!codes.length) {
      return [];
    }

    const rows = await this.db
      .selectFrom('wallet_monitor_current')
      .selectAll()
      .where('wallet_code', 'in', codes)
      .execute();

    return rows.map((row) => ({
      walletCode: row.wallet_code,
      address: row.address,
      tokenSymbol: row.token_symbol,
      tokenContractAddress: row.token_contract_address,
      tokenBalance: row.token_balance,
      tokenRawBalance: row.token_raw_balance,
      tokenDecimals: row.token_decimals,
      trxBalance: row.trx_balance,
      trxRawBalance: row.trx_raw_balance,
      fetchedAt: row.fetched_at,
      status: row.status,
      error: row.error_message ?? undefined
    }));
  }

  async getLatestCollectorRuns(): Promise<CollectorRunRecord[]> {
    const rows = await this.db
      .selectFrom('monitor_collector_runs')
      .selectAll()
      .orderBy('collector_name asc')
      .orderBy('finished_at desc')
      .execute();

    const latestByCollector = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!latestByCollector.has(row.collector_name)) {
        latestByCollector.set(row.collector_name, row);
      }
    }

    return [...latestByCollector.values()].map((row) => ({
      collectorName: row.collector_name,
      status: row.status,
      successCount: row.success_count,
      errorCount: row.error_count,
      totalCount: row.total_count,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      errorMessage: row.error_message ?? undefined
    }));
  }
}
