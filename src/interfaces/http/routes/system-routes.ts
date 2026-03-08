import { Router } from 'express';
import { z } from 'zod';
import type { CollectorRunRecord, StoredWalletMonitoringSnapshot } from '../../../application/ports/monitoring-repository.js';
import { SystemMonitoringService } from '../../../application/services/system-monitoring-service.js';
import { env } from '../../../config/env.js';
import { getRuntimeContractProfile, setRuntimeContractProfile } from '../../../config/runtime-settings.js';
import { getConfiguredSystemWallets } from '../../../config/system-wallets.js';
import { DomainError } from '../../../domain/errors/domain-error.js';
import { tronAddressPattern } from '../../../domain/value-objects/tron-address.js';

const PLACEHOLDER_SECRETS = new Set([
  'replace-with-strong-secret',
  'replace-with-private-key',
  'dev-only-secret-change-me',
  'dev-only-private-key-change-me'
]);

const runtimeProfileSchema = z.object({
  profile: z.enum(['runtime', 'mainnet', 'testnet', 'custom']),
  customContractAddress: z.string().regex(tronAddressPattern).optional()
});

export const buildSystemStatusResponse = (
  walletMonitoring: StoredWalletMonitoringSnapshot[] = [],
  collectorRuns: CollectorRunRecord[] = []
) => {
  const walletMonitoringByCode = new Map(walletMonitoring.map((snapshot) => [snapshot.walletCode, snapshot]));
  const walletCatalog = getConfiguredSystemWallets().map((wallet) => ({
    ...wallet,
    monitoring: walletMonitoringByCode.get(wallet.code) ?? null
  }));
  const trackedWallets = walletCatalog.map((wallet) => wallet.address);
  const contractRuntime = getRuntimeContractProfile();

  return {
    service: {
      name: 'korion-kori-backend',
      nodeEnv: env.nodeEnv,
      port: env.port
    },
    runtime: {
      ledgerProvider: env.ledgerProvider,
      tronGatewayMode: env.tronGatewayMode,
      tronApiUrl: env.tronApiUrl,
      tronApiKeyConfigured: Boolean(env.tronApiKey),
      koriTokenContractConfigured: Boolean(env.koriTokenContractAddress),
      schedulerPendingTimeoutSec: env.schedulerPendingTimeoutSec
    },
    limits: {
      withdrawSingleLimitKori: env.withdrawSingleLimitKori,
      withdrawDailyLimitKori: env.withdrawDailyLimitKori,
      tronFeeLimitSun: env.tronFeeLimitSun
    },
    wallets: {
      treasury: env.treasuryWalletAddress,
      deposits: env.depositWalletAddresses,
      hot: env.hotWalletAddress,
      tracked: trackedWallets,
      catalog: walletCatalog
    },
    contracts: contractRuntime,
    monitoring: {
      enabled: env.walletMonitorEnabled,
      intervalSec: env.walletMonitorIntervalSec,
      requestGapMs: env.walletMonitorRequestGapMs,
      collectors: collectorRuns
    },
    database: {
      host: env.db.host,
      port: env.db.port,
      name: env.db.name,
      schema: env.db.schema
    },
    security: {
      jwtConfigured: !PLACEHOLDER_SECRETS.has(env.jwtSecret),
      hotWalletPrivateKeyConfigured: !PLACEHOLDER_SECRETS.has(env.hotWalletPrivateKey)
    }
  };
};

export const createSystemRoutes = (systemMonitoringService: SystemMonitoringService): Router => {
  const router = Router();
  const getConfiguredWallets = () => getConfiguredSystemWallets();

  router.get('/status', async (_req, res, next) => {
    try {
      const wallets = getConfiguredWallets();
      const [monitoring, collectorRuns] = await Promise.all([
        systemMonitoringService.getStoredWallets(wallets),
        systemMonitoringService.getCollectorRuns()
      ]);
      res.json(buildSystemStatusResponse(monitoring, collectorRuns));
    } catch (error) {
      next(error);
    }
  });

  router.post('/monitoring/run', async (_req, res, next) => {
    try {
      const wallets = getConfiguredWallets();
      const { snapshots, run } = await systemMonitoringService.collectWallets(wallets);
      const collectorRuns = await systemMonitoringService.getCollectorRuns();
      res.json({
        run,
        status: buildSystemStatusResponse(snapshots, collectorRuns)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/runtime-profile', async (req, res, next) => {
    try {
      if (!env.runtimeProfileEditable) {
        throw new DomainError(403, 'FORBIDDEN', 'runtime profile switching is disabled for this runtime');
      }

      const parsed = runtimeProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new DomainError(400, 'INVALID_REQUEST', 'invalid runtime profile payload', parsed.error.flatten());
      }

      if (parsed.data.profile === 'custom' && !parsed.data.customContractAddress) {
        throw new DomainError(400, 'INVALID_REQUEST', 'customContractAddress is required for custom profile');
      }

      setRuntimeContractProfile(parsed.data.profile, parsed.data.customContractAddress);
      const wallets = getConfiguredWallets();
      const { snapshots } = await systemMonitoringService.collectWallets(wallets);
      const collectorRuns = await systemMonitoringService.getCollectorRuns();
      res.json(buildSystemStatusResponse(snapshots, collectorRuns));
    } catch (error) {
      next(error);
    }
  });

  return router;
};
