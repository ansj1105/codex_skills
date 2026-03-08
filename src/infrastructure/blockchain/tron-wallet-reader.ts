import { TronWeb } from 'tronweb';
import { env } from '../../config/env.js';
import { getBlockchainNetworkConfig } from '../../config/blockchain-networks.js';
import { getEffectiveKoriTokenContractAddress, getEffectiveTronApiUrl } from '../../config/runtime-settings.js';
import type {
  BlockchainReadOptions,
  BlockchainReader,
  WalletMonitoringSnapshot
} from '../../application/ports/blockchain-reader.js';

const DEFAULT_TOKEN_DECIMALS = 6;
const TRONSCAN_API_BASE_URL = 'https://apilist.tronscanapi.com/api';
const TRC20_READ_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

const normalizeBigInt = (value: unknown, fallback = 0n): bigint => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return BigInt(value);
  }

  if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    return BigInt(value.toString());
  }

  return fallback;
};

const formatUnits = (rawValue: bigint, decimals: number): string => {
  const divisor = 10n ** BigInt(decimals);
  const whole = rawValue / divisor;
  const fraction = rawValue % divisor;
  const fractionText = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');

  if (!fractionText) {
    return whole.toString();
  }

  return `${whole.toString()}.${fractionText}`;
};

const createTronWeb = (fullHost: string, withApiKey = true) => {
  const tronWeb = new TronWeb({
    fullHost,
    headers:
      withApiKey && env.tronApiKey
        ? {
            'TRON-PRO-API-KEY': env.tronApiKey
          }
        : undefined
  });

  tronWeb.setAddress(env.hotWalletAddress);
  return tronWeb;
};

const resolveApiUrl = (options?: BlockchainReadOptions) => {
  if (options?.apiUrl) {
    return options.apiUrl;
  }

  if (options?.network) {
    return getBlockchainNetworkConfig(options.network).tronApiUrl;
  }

  return getEffectiveTronApiUrl();
};

const resolveTokenContractAddress = (options?: BlockchainReadOptions) => {
  if (options?.tokenContractAddress) {
    return options.tokenContractAddress;
  }

  if (options?.network) {
    return getBlockchainNetworkConfig(options.network).contractAddress;
  }

  return getEffectiveKoriTokenContractAddress() ?? null;
};

const fetchTronScanJson = async (pathname: string, query: Record<string, string>, withApiKey: boolean) => {
  const url = new URL(`${TRONSCAN_API_BASE_URL}${pathname}`);
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers:
      withApiKey && env.tronApiKey
        ? {
            'TRON-PRO-API-KEY': env.tronApiKey
          }
        : undefined
  });

  if (!response.ok) {
    throw new Error(`TronScan request failed with status code ${response.status}`);
  }

  return response.json();
};

export class TronWalletReader implements BlockchainReader {
  async getWalletMonitoringSnapshot(address: string, options?: BlockchainReadOptions): Promise<WalletMonitoringSnapshot> {
    const fetchedAt = new Date().toISOString();
    const apiUrl = resolveApiUrl(options);
    const tokenContractAddress = resolveTokenContractAddress(options);

    try {
      return await this.fetchSnapshot(address, apiUrl, tokenContractAddress, fetchedAt, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to fetch wallet monitoring snapshot';
      if (env.tronApiKey && message.includes('401')) {
        try {
          return await this.fetchSnapshot(address, apiUrl, tokenContractAddress, fetchedAt, false);
        } catch (fallbackError) {
          return this.mapErrorSnapshot(address, tokenContractAddress, fetchedAt, fallbackError);
        }
      }

      try {
        return await this.fetchSnapshotFromTronScan(address, tokenContractAddress, fetchedAt, true);
      } catch (tronScanError) {
        if (env.tronApiKey) {
          try {
            return await this.fetchSnapshotFromTronScan(address, tokenContractAddress, fetchedAt, false);
          } catch (tronScanFallbackError) {
            return this.mapErrorSnapshot(address, tokenContractAddress, fetchedAt, tronScanFallbackError);
          }
        }

        return this.mapErrorSnapshot(address, tokenContractAddress, fetchedAt, tronScanError);
      }

      return this.mapErrorSnapshot(address, tokenContractAddress, fetchedAt, error);
    }
  }

  private async fetchSnapshot(
    address: string,
    apiUrl: string,
    tokenContractAddress: string | null,
    fetchedAt: string,
    withApiKey: boolean
  ): Promise<WalletMonitoringSnapshot> {
    const tronWeb = createTronWeb(apiUrl, withApiKey);
    const trxRawBalance = normalizeBigInt(await tronWeb.trx.getBalance(address));
    const trxBalance = formatUnits(trxRawBalance, 6);

    if (!tokenContractAddress) {
      return {
        address,
        tokenSymbol: 'KORI',
        tokenContractAddress: null,
        tokenBalance: null,
        tokenRawBalance: null,
        tokenDecimals: null,
        trxBalance,
        trxRawBalance: trxRawBalance.toString(),
        fetchedAt,
        status: 'error',
        error: 'KORI token contract address is not configured'
      };
    }

    const contract = await tronWeb.contract(TRC20_READ_ABI, tokenContractAddress).at(tokenContractAddress);
    const [rawTokenBalance, rawTokenDecimals, rawTokenSymbol] = await Promise.all([
      contract.balanceOf(address).call({ from: env.hotWalletAddress }),
      contract.decimals().call({ from: env.hotWalletAddress }).catch(() => DEFAULT_TOKEN_DECIMALS),
      contract.symbol().call({ from: env.hotWalletAddress }).catch(() => 'KORI')
    ]);

    const tokenDecimals = Number(rawTokenDecimals);
    const normalizedTokenDecimals = Number.isFinite(tokenDecimals) ? tokenDecimals : DEFAULT_TOKEN_DECIMALS;
    const tokenRawBalance = normalizeBigInt(rawTokenBalance);

    return {
      address,
      tokenSymbol: String(rawTokenSymbol || 'KORI'),
      tokenContractAddress,
      tokenBalance: formatUnits(tokenRawBalance, normalizedTokenDecimals),
      tokenRawBalance: tokenRawBalance.toString(),
      tokenDecimals: normalizedTokenDecimals,
      trxBalance,
      trxRawBalance: trxRawBalance.toString(),
      fetchedAt,
      status: 'ok'
    };
  }

  private mapErrorSnapshot(
    address: string,
    tokenContractAddress: string | null,
    fetchedAt: string,
    error: unknown
  ): WalletMonitoringSnapshot {
    return {
      address,
      tokenSymbol: 'KORI',
      tokenContractAddress,
      tokenBalance: null,
      tokenRawBalance: null,
      tokenDecimals: null,
      trxBalance: null,
      trxRawBalance: null,
      fetchedAt,
      status: 'error',
      error: error instanceof Error ? error.message : 'failed to fetch wallet monitoring snapshot'
    };
  }

  private async fetchSnapshotFromTronScan(
    address: string,
    tokenContractAddress: string | null,
    fetchedAt: string,
    withApiKey: boolean
  ): Promise<WalletMonitoringSnapshot> {
    const account = await fetchTronScanJson('/account', { address }, withApiKey);
    const trxToken = Array.isArray(account.balances)
      ? account.balances.find((item: any) => item.tokenId === '_' || item.tokenAbbr === 'trx')
      : undefined;
    const trxRawBalance = normalizeBigInt(trxToken?.balance ?? account.balanceStr ?? account.balance);
    const trxBalance = formatUnits(trxRawBalance, 6);

    if (!tokenContractAddress) {
      return {
        address,
        tokenSymbol: 'KORI',
        tokenContractAddress: null,
        tokenBalance: null,
        tokenRawBalance: null,
        tokenDecimals: null,
        trxBalance,
        trxRawBalance: trxRawBalance.toString(),
        fetchedAt,
        status: 'error',
        error: 'KORI token contract address is not configured'
      };
    }

    const tokenRow = Array.isArray(account.trc20token_balances)
      ? account.trc20token_balances.find((item: any) => item.tokenId === tokenContractAddress)
      : undefined;
    const tokenDecimals = Number(tokenRow?.tokenDecimal ?? DEFAULT_TOKEN_DECIMALS);
    const normalizedTokenDecimals = Number.isFinite(tokenDecimals) ? tokenDecimals : DEFAULT_TOKEN_DECIMALS;
    const tokenRawBalance = normalizeBigInt(tokenRow?.balance);

    return {
      address,
      tokenSymbol: String(tokenRow?.tokenAbbr ?? 'KORI'),
      tokenContractAddress,
      tokenBalance: formatUnits(tokenRawBalance, normalizedTokenDecimals),
      tokenRawBalance: tokenRawBalance.toString(),
      tokenDecimals: normalizedTokenDecimals,
      trxBalance,
      trxRawBalance: trxRawBalance.toString(),
      fetchedAt,
      status: 'ok'
    };
  }
}
