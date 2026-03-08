import { Router } from 'express';
import { env } from '../../../config/env.js';

const PLACEHOLDER_SECRETS = new Set([
  'replace-with-strong-secret',
  'replace-with-private-key',
  'dev-only-secret-change-me',
  'dev-only-private-key-change-me'
]);

export const createSystemRoutes = (): Router => {
  const router = Router();

  router.get('/status', (_req, res) => {
    const trackedWallets = [env.treasuryWalletAddress, ...env.depositWalletAddresses, env.hotWalletAddress];

    res.json({
      service: {
        name: 'korion-kori-backend',
        nodeEnv: env.nodeEnv,
        port: env.port
      },
      runtime: {
        ledgerProvider: env.ledgerProvider,
        tronGatewayMode: env.tronGatewayMode,
        tronApiUrl: env.tronApiUrl,
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
        tracked: trackedWallets
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
    });
  });

  return router;
};
