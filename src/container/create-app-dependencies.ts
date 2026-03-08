import { MonitoringWorker } from '../application/services/monitoring-worker.js';
import { SystemMonitoringService } from '../application/services/system-monitoring-service.js';
import { env } from '../config/env.js';
import { getConfiguredSystemWallets } from '../config/system-wallets.js';
import { parseKoriAmount } from '../domain/value-objects/money.js';
import { DepositService } from '../application/services/deposit-service.js';
import { SchedulerService } from '../application/services/scheduler-service.js';
import { WalletService } from '../application/services/wallet-service.js';
import { WithdrawService } from '../application/services/withdraw-service.js';
import { MockTronGateway } from '../infrastructure/blockchain/mock-tron-gateway.js';
import { TronWalletReader } from '../infrastructure/blockchain/tron-wallet-reader.js';
import { TronWebTrc20Gateway } from '../infrastructure/blockchain/tronweb-trc20-gateway.js';
import { InMemoryEventPublisher } from '../infrastructure/events/in-memory-event-publisher.js';
import { InMemoryLedgerRepository } from '../infrastructure/persistence/in-memory-ledger-repository.js';
import { InMemoryMonitoringRepository } from '../infrastructure/persistence/in-memory-monitoring-repository.js';
import { PostgresMonitoringRepository } from '../infrastructure/persistence/postgres/postgres-monitoring-repository.js';
import { PostgresLedgerRepository } from '../infrastructure/persistence/postgres/postgres-ledger-repository.js';
import { createPostgresDb, createPostgresPool } from '../infrastructure/persistence/postgres/postgres-pool.js';
import type { AppDependencies } from './app-dependencies.js';

const createPersistence = () => {
  const limits = {
    singleLimit: parseKoriAmount(env.withdrawSingleLimitKori),
    dailyLimit: parseKoriAmount(env.withdrawDailyLimitKori)
  };

  if (env.ledgerProvider === 'postgres') {
    const pool = createPostgresPool();
    const db = createPostgresDb(pool);
    return {
      ledger: new PostgresLedgerRepository(db, limits),
      monitoringRepository: new PostgresMonitoringRepository(db)
    };
  }

  return {
    ledger: new InMemoryLedgerRepository(limits),
    monitoringRepository: new InMemoryMonitoringRepository()
  };
};

const createTronGateway = () => {
  return env.tronGatewayMode === 'trc20' ? new TronWebTrc20Gateway() : new MockTronGateway();
};

export const createAppDependencies = (): AppDependencies => {
  const eventPublisher = new InMemoryEventPublisher();
  const { ledger, monitoringRepository } = createPersistence();
  const tronGateway = createTronGateway();
  const systemWallets = getConfiguredSystemWallets();
  const systemMonitoringService = new SystemMonitoringService(
    new TronWalletReader(),
    monitoringRepository,
    env.walletMonitorRequestGapMs
  );
  const monitoringWorker = new MonitoringWorker(
    systemMonitoringService,
    systemWallets,
    env.walletMonitorIntervalSec * 1000
  );
  const trackedDepositWallets = [
    env.treasuryWalletAddress,
    ...env.depositWalletAddresses,
    env.hotWalletAddress
  ];

  const depositService = new DepositService(ledger, eventPublisher, trackedDepositWallets);
  const walletService = new WalletService(ledger, eventPublisher);
  const withdrawService = new WithdrawService(ledger, eventPublisher, tronGateway);
  const schedulerService = new SchedulerService(ledger, withdrawService, eventPublisher);

  return {
    ledger,
    eventPublisher,
    systemMonitoringService,
    monitoringWorker,
    depositService,
    walletService,
    withdrawService,
    schedulerService
  };
};
