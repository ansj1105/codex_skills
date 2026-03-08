import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const PLACEHOLDER_SECRETS = new Set([
  'replace-with-strong-secret',
  'replace-with-private-key',
  'dev-only-secret-change-me',
  'dev-only-private-key-change-me'
]);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LEDGER_PROVIDER: z.enum(['memory', 'postgres']).default('memory'),
  TRON_GATEWAY_MODE: z.enum(['mock', 'trc20']).default('mock'),
  ALLOW_RUNTIME_PROFILE_SWITCHING: z.enum(['true', 'false']).optional(),
  JWT_SECRET: z.string().optional(),
  TRON_API_URL: z.string().url().default('https://api.trongrid.io'),
  TRON_API_KEY: z.string().optional(),
  KORI_TOKEN_CONTRACT_ADDRESS: z.string().optional(),
  MAINNET_KORI_TOKEN_CONTRACT_ADDRESS: z.string().default('TBJZD8RwQ1JcQvEP9BTbPbgBCGxUjxSXnn'),
  TESTNET_KORI_TOKEN_CONTRACT_ADDRESS: z.string().default('TPKZnRjJngnxVgxw52pMPSrCp2wGm7iT9W'),
  TRON_FEE_LIMIT_SUN: z.coerce.number().int().positive().default(100000000),
  TREASURY_WALLET_ADDRESS: z.string().default('TSM7ocJQHigW9jhk5yFQKrUmBAXz2FFapa'),
  DEPOSIT_WALLET_ADDRESSES: z
    .string()
    .default('TWbuSkkRid1st9gSMy1NhpK1KwJMebHNwh,TLkgBr1vwpkdenM3LZq2hzb33TbCzBYDE3,TCFD5eZAXGdA8ud4ZH2Dt6cZdeGRFYSiaH,TMCUdq7BfaTRCdzUvYmuVoKnjZssYqnJ3s'),
  HOT_WALLET_ADDRESS: z.string().default('TYKL8DPoR99bccujHXxcyBewCV1NimdRc8'),
  HOT_WALLET_PRIVATE_KEY: z.string().optional(),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default('korion'),
  DB_USER: z.string().default('korion'),
  DB_PASSWORD: z.string().default('korion'),
  DB_SCHEMA: z.string().default('public'),
  WITHDRAW_SINGLE_LIMIT_KORI: z.coerce.number().positive().default(10000),
  WITHDRAW_DAILY_LIMIT_KORI: z.coerce.number().positive().default(50000),
  SCHEDULER_PENDING_TIMEOUT_SEC: z.coerce.number().int().positive().default(60)
});

const parsed = schema.parse(process.env);

if (parsed.NODE_ENV === 'production') {
  if (!parsed.JWT_SECRET || PLACEHOLDER_SECRETS.has(parsed.JWT_SECRET)) {
    throw new Error('JWT_SECRET is required in production');
  }
  if (!parsed.HOT_WALLET_PRIVATE_KEY || PLACEHOLDER_SECRETS.has(parsed.HOT_WALLET_PRIVATE_KEY)) {
    throw new Error('HOT_WALLET_PRIVATE_KEY is required in production');
  }
}

if (parsed.TRON_GATEWAY_MODE === 'trc20' && !parsed.KORI_TOKEN_CONTRACT_ADDRESS) {
  throw new Error('KORI_TOKEN_CONTRACT_ADDRESS is required when TRON_GATEWAY_MODE=trc20');
}

export const env = Object.freeze({
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  ledgerProvider: parsed.LEDGER_PROVIDER,
  tronGatewayMode: parsed.TRON_GATEWAY_MODE,
  runtimeProfileEditable:
    parsed.ALLOW_RUNTIME_PROFILE_SWITCHING !== undefined
      ? parsed.ALLOW_RUNTIME_PROFILE_SWITCHING === 'true'
      : parsed.NODE_ENV !== 'production',
  jwtSecret: parsed.JWT_SECRET ?? 'dev-only-secret-change-me',
  tronApiUrl: parsed.TRON_API_URL,
  tronApiKey: parsed.TRON_API_KEY,
  koriTokenContractAddress: parsed.KORI_TOKEN_CONTRACT_ADDRESS,
  mainnetKoriTokenContractAddress: parsed.MAINNET_KORI_TOKEN_CONTRACT_ADDRESS,
  testnetKoriTokenContractAddress: parsed.TESTNET_KORI_TOKEN_CONTRACT_ADDRESS,
  tronFeeLimitSun: parsed.TRON_FEE_LIMIT_SUN,
  treasuryWalletAddress: parsed.TREASURY_WALLET_ADDRESS,
  depositWalletAddresses: parsed.DEPOSIT_WALLET_ADDRESSES.split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  hotWalletAddress: parsed.HOT_WALLET_ADDRESS,
  hotWalletPrivateKey: parsed.HOT_WALLET_PRIVATE_KEY ?? 'dev-only-private-key-change-me',
  db: {
    host: parsed.DB_HOST,
    port: parsed.DB_PORT,
    name: parsed.DB_NAME,
    user: parsed.DB_USER,
    password: parsed.DB_PASSWORD,
    schema: parsed.DB_SCHEMA
  },
  withdrawSingleLimitKori: parsed.WITHDRAW_SINGLE_LIMIT_KORI,
  withdrawDailyLimitKori: parsed.WITHDRAW_DAILY_LIMIT_KORI,
  schedulerPendingTimeoutSec: parsed.SCHEDULER_PENDING_TIMEOUT_SEC
});
