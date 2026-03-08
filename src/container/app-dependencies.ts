import type { EventPublisher } from '../application/ports/event-publisher.js';
import { MonitoringWorker } from '../application/services/monitoring-worker.js';
import type { LedgerRepository } from '../application/ports/ledger-repository.js';
import { SystemMonitoringService } from '../application/services/system-monitoring-service.js';
import { DepositService } from '../application/services/deposit-service.js';
import { OnchainService } from '../application/services/onchain-service.js';
import { SchedulerService } from '../application/services/scheduler-service.js';
import { WalletService } from '../application/services/wallet-service.js';
import { WithdrawService } from '../application/services/withdraw-service.js';

export interface AppDependencies {
  ledger: LedgerRepository;
  eventPublisher: EventPublisher;
  systemMonitoringService: SystemMonitoringService;
  onchainService: OnchainService;
  monitoringWorker: MonitoringWorker;
  depositService: DepositService;
  walletService: WalletService;
  withdrawService: WithdrawService;
  schedulerService: SchedulerService;
}
