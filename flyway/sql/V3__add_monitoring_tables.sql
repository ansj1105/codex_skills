CREATE TABLE IF NOT EXISTS wallet_monitor_current (
  wallet_code VARCHAR(32) PRIMARY KEY,
  address VARCHAR(128) NOT NULL UNIQUE,
  token_symbol VARCHAR(32) NOT NULL,
  token_contract_address VARCHAR(128),
  token_balance VARCHAR(128),
  token_raw_balance VARCHAR(128),
  token_decimals INT,
  trx_balance VARCHAR(128),
  trx_raw_balance VARCHAR(128),
  fetched_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL,
  error_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_monitor_current_address
  ON wallet_monitor_current (address);

CREATE TABLE IF NOT EXISTS wallet_monitor_history (
  snapshot_id UUID PRIMARY KEY,
  collector_name VARCHAR(64) NOT NULL,
  wallet_code VARCHAR(32) NOT NULL,
  address VARCHAR(128) NOT NULL,
  token_symbol VARCHAR(32) NOT NULL,
  token_contract_address VARCHAR(128),
  token_balance VARCHAR(128),
  token_raw_balance VARCHAR(128),
  token_decimals INT,
  trx_balance VARCHAR(128),
  trx_raw_balance VARCHAR(128),
  fetched_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_monitor_history_wallet_created
  ON wallet_monitor_history (wallet_code, created_at DESC);

CREATE TABLE IF NOT EXISTS monitor_collector_runs (
  run_id UUID PRIMARY KEY,
  collector_name VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL,
  success_count INT NOT NULL,
  error_count INT NOT NULL,
  total_count INT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_monitor_collector_runs_name_finished
  ON monitor_collector_runs (collector_name, finished_at DESC);
