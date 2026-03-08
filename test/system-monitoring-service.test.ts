import { describe, expect, it, vi } from 'vitest';
import { SystemMonitoringService } from '../src/application/services/system-monitoring-service.js';

const wallets = [
  {
    code: 'cold',
    label: 'Cold Wallet',
    address: 'TWbuSkkRid1st9gSMy1NhpK1KwJMebHNwh',
    custody: 'multisig',
    allocationPercent: 50,
    allocationUnits: 150,
    allocationLabel: '50%',
    notes: 'cold wallet',
    flowTags: ['Cold Wallet', 'Multisig']
  }
] as const;

describe('SystemMonitoringService', () => {
  it('preserves last known balances when a refresh fails', async () => {
    const reader = {
      getWalletMonitoringSnapshot: vi.fn(async () => ({
        address: 'TWbuSkkRid1st9gSMy1NhpK1KwJMebHNwh',
        tokenSymbol: 'KORI',
        tokenContractAddress: 'TBJZD8RwQ1JcQvEP9BTbPbgBCGxUjxSXnn',
        tokenBalance: null,
        tokenRawBalance: null,
        tokenDecimals: null,
        trxBalance: null,
        trxRawBalance: null,
        fetchedAt: new Date().toISOString(),
        status: 'error' as const,
        error: 'Request failed with status code 429'
      }))
    };

    const repository = {
      getWalletSnapshots: vi.fn(async () => [
        {
          walletCode: 'cold',
          address: 'TWbuSkkRid1st9gSMy1NhpK1KwJMebHNwh',
          tokenSymbol: 'KORI',
          tokenContractAddress: 'TBJZD8RwQ1JcQvEP9BTbPbgBCGxUjxSXnn',
          tokenBalance: '150',
          tokenRawBalance: '150000000',
          tokenDecimals: 6,
          trxBalance: '2',
          trxRawBalance: '2000000',
          fetchedAt: '2026-03-01T00:00:00.000Z',
          status: 'ok' as const,
          error: undefined
        }
      ]),
      saveWalletSnapshots: vi.fn(async () => undefined),
      getLatestCollectorRuns: vi.fn(async () => [])
    };

    const service = new SystemMonitoringService(reader as any, repository as any, 0);
    const result = await service.collectWallets(wallets as any);

    expect(result.snapshots[0].status).toBe('error');
    expect(result.snapshots[0].tokenBalance).toBe('150');
    expect(result.snapshots[0].trxBalance).toBe('2');
    expect(result.snapshots[0].error).toContain('429');
  });
});
