export interface AccountsTable {
  user_id: string;
  balance: string;
  locked_balance: string;
  updated_at: string;
}

export interface WalletAddressBindingsTable {
  user_id: string;
  wallet_address: string;
  created_at: string;
}

export interface TransactionsTable {
  tx_id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'internal_transfer_in' | 'internal_transfer_out';
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  block_tx: string | null;
  idempotency_key: string | null;
  related_user_id: string | null;
  created_at: string;
}

export interface DepositsTable {
  deposit_id: string;
  user_id: string;
  tx_hash: string;
  amount: string;
  status: 'confirmed';
  block_number: number;
  created_at: string;
}

export interface WithdrawalsTable {
  withdraw_id: string;
  user_id: string;
  amount: string;
  to_address: string;
  status: 'requested' | 'approved' | 'broadcasted' | 'confirmed' | 'failed' | 'rejected';
  tx_hash: string | null;
  idempotency_key: string;
  ledger_tx_id: string;
  created_at: string;
  approved_at: string | null;
  broadcasted_at: string | null;
  confirmed_at: string | null;
  failed_at: string | null;
  fail_reason: string | null;
}

export interface TxJobsTable {
  job_id: string;
  type: 'withdraw_reconcile' | 'withdraw_manual_review';
  payload: Record<string, string>;
  status: 'pending' | 'running' | 'done' | 'failed';
  retry_count: number;
  created_at: string;
}

export interface WalletMonitorCurrentTable {
  wallet_code: string;
  address: string;
  token_symbol: string;
  token_contract_address: string | null;
  token_balance: string | null;
  token_raw_balance: string | null;
  token_decimals: number | null;
  trx_balance: string | null;
  trx_raw_balance: string | null;
  fetched_at: string;
  status: 'ok' | 'error';
  error_message: string | null;
  updated_at: string;
}

export interface WalletMonitorHistoryTable {
  snapshot_id: string;
  collector_name: string;
  wallet_code: string;
  address: string;
  token_symbol: string;
  token_contract_address: string | null;
  token_balance: string | null;
  token_raw_balance: string | null;
  token_decimals: number | null;
  trx_balance: string | null;
  trx_raw_balance: string | null;
  fetched_at: string;
  status: 'ok' | 'error';
  error_message: string | null;
  created_at: string;
}

export interface MonitorCollectorRunsTable {
  run_id: string;
  collector_name: string;
  status: 'success' | 'degraded' | 'failed';
  success_count: number;
  error_count: number;
  total_count: number;
  error_message: string | null;
  started_at: string;
  finished_at: string;
}

export interface KorionDatabase {
  accounts: AccountsTable;
  wallet_address_bindings: WalletAddressBindingsTable;
  transactions: TransactionsTable;
  deposits: DepositsTable;
  withdrawals: WithdrawalsTable;
  tx_jobs: TxJobsTable;
  wallet_monitor_current: WalletMonitorCurrentTable;
  wallet_monitor_history: WalletMonitorHistoryTable;
  monitor_collector_runs: MonitorCollectorRunsTable;
}
