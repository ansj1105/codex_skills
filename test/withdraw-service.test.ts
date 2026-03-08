import { beforeEach, describe, expect, it } from 'vitest';
import { createAppDependencies } from '../src/container/create-app-dependencies.js';
import { isValidTronAddress } from '../src/domain/value-objects/tron-address.js';
import { MockTronGateway } from '../src/infrastructure/blockchain/mock-tron-gateway.js';

const VALID_TRON_ADDRESS = 'TAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const TRACKED_DEPOSIT_ADDRESS = 'TSM7ocJQHigW9jhk5yFQKrUmBAXz2FFapa';

describe('withdraw flow (service-level)', () => {
  let deps: ReturnType<typeof createAppDependencies>;

  beforeEach(async () => {
    deps = createAppDependencies({
      tronGateway: new MockTronGateway()
    });
    await deps.walletService.bindWalletAddress({
      userId: 'user-1',
      walletAddress: 'TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
    });
    await deps.walletService.bindWalletAddress({
      userId: 'user-2',
      walletAddress: 'TCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
    });
    await deps.depositService.processDeposit({
      userId: 'user-1',
      txHash: `mock-deposit-${Date.now()}`,
      toAddress: TRACKED_DEPOSIT_ADDRESS,
      amountKori: 60000,
      blockNumber: 1
    });
  });

  it('handles success and idempotent duplicate', async () => {
    const first = await deps.withdrawService.request({
      userId: 'user-1',
      amountKori: 5000,
      toAddress: VALID_TRON_ADDRESS,
      idempotencyKey: 'wd-success-1'
    });

    const second = await deps.withdrawService.request({
      userId: 'user-1',
      amountKori: 5000,
      toAddress: VALID_TRON_ADDRESS,
      idempotencyKey: 'wd-success-1'
    });

    expect(first.duplicated).toBe(false);
    expect(second.duplicated).toBe(true);
    expect(second.withdrawal.withdrawalId).toBe(first.withdrawal.withdrawalId);
  });

  it('rejects single and daily limit overflow', async () => {
    await expect(
      deps.withdrawService.request({
        userId: 'user-1',
        amountKori: 10000.000001,
        toAddress: VALID_TRON_ADDRESS,
        idempotencyKey: 'wd-single-over-1'
      })
    ).rejects.toMatchObject({
      code: 'LIMIT_EXCEEDED'
    });

    for (let i = 0; i < 5; i += 1) {
      const result = await deps.withdrawService.request({
        userId: 'user-1',
        amountKori: 10000,
        toAddress: VALID_TRON_ADDRESS,
        idempotencyKey: `wd-daily-${i}`
      });
      expect(result.duplicated).toBe(false);
    }

    await expect(
      deps.withdrawService.request({
        userId: 'user-1',
        amountKori: 1,
        toAddress: VALID_TRON_ADDRESS,
        idempotencyKey: 'wd-daily-overflow'
      })
    ).rejects.toMatchObject({
      code: 'LIMIT_EXCEEDED'
    });
  });

  it('validates tron address format', () => {
    expect(isValidTronAddress(VALID_TRON_ADDRESS)).toBe(true);
    expect(isValidTronAddress('invalid-address')).toBe(false);
  });

  it('supports wallet-address based balance and transfer resolution', async () => {
    const account = await deps.walletService.getBalance({
      walletAddress: 'TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
    });

    expect(account.userId).toBe('user-1');
    expect(account.walletAddress).toBe('TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');

    const transfer = await deps.walletService.transfer({
      fromWalletAddress: 'TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      toWalletAddress: 'TCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      amountKori: 123,
      idempotencyKey: 'wallet-address-transfer-1'
    });

    expect(transfer.duplicated).toBe(false);
    expect(transfer.fromTx.userId).toBe('user-1');
    expect(transfer.toTx.userId).toBe('user-2');
  });

  it('supports wallet-address based deposit attribution and withdrawal source resolution', async () => {
    const deposit = await deps.depositService.processDeposit({
      walletAddress: 'TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      txHash: `wallet-address-deposit-${Date.now()}`,
      toAddress: TRACKED_DEPOSIT_ADDRESS,
      amountKori: 10,
      blockNumber: 10
    });

    expect(deposit.accepted).toBe(true);
    expect(deposit.deposit?.userId).toBe('user-1');

    const withdrawal = await deps.withdrawService.request({
      walletAddress: 'TBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      amountKori: 1,
      toAddress: VALID_TRON_ADDRESS,
      idempotencyKey: 'wallet-address-withdraw-1'
    });

    expect(withdrawal.duplicated).toBe(false);
    expect(withdrawal.withdrawal.userId).toBe('user-1');
  });

  it('reconciles pending broadcast in scheduler timeout path', async () => {
    const oldTime = new Date(Date.now() - 120_000).toISOString();
    const requestResult = await deps.ledger.requestWithdrawal({
      userId: 'user-1',
      amount: 1_000_000n,
      toAddress: VALID_TRON_ADDRESS,
      idempotencyKey: 'wd-timeout-path-1',
      nowIso: oldTime
    });

    await deps.ledger.approveWithdrawal(requestResult.withdrawal.withdrawalId, oldTime);
    await deps.ledger.broadcastWithdrawal(requestResult.withdrawal.withdrawalId, 'pending-timeout-case', oldTime);

    const result = await deps.schedulerService.retryPending(60);
    expect(result.stuckCount).toBeGreaterThanOrEqual(1);
    expect(result.reconcile.pending).toContain(requestResult.withdrawal.withdrawalId);
  });
});
