import type { SystemWalletDescriptor } from '../../config/system-wallets.js';
import { SystemMonitoringService } from './system-monitoring-service.js';

export class MonitoringWorker {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly monitoringService: SystemMonitoringService,
    private readonly wallets: SystemWalletDescriptor[],
    private readonly intervalMs: number
  ) {}

  start() {
    void this.runCycle();
    this.timer = setInterval(() => {
      void this.runCycle();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async runCycle() {
    if (this.running) {
      return;
    }

    this.running = true;
    try {
      await this.monitoringService.collectWallets(this.wallets);
    } catch (error) {
      console.error('wallet monitoring cycle failed', error);
    } finally {
      this.running = false;
    }
  }
}
