const els = {
  runtimePill: document.querySelector('#runtime-pill'),
  systemStatus: document.querySelector('#system-status'),
  walletList: document.querySelector('#wallet-list'),
  bindingResult: document.querySelector('#binding-result'),
  contractResult: document.querySelector('#contract-result'),
  contractProfileNote: document.querySelector('#contract-profile-note'),
  balanceResult: document.querySelector('#balance-result'),
  depositResult: document.querySelector('#deposit-result'),
  transferResult: document.querySelector('#transfer-result'),
  withdrawResult: document.querySelector('#withdraw-result'),
  schedulerResult: document.querySelector('#scheduler-result'),
  log: document.querySelector('#activity-log'),
  withdrawIdInput: document.querySelector('#withdraw-actions-form input[name="withdrawalId"]'),
  contractProfileForm: document.querySelector('#contract-profile-form'),
  bindingForm: document.querySelector('#binding-form')
};

const formatJson = (value) => JSON.stringify(value, null, 2);

const setBlock = (element, payload) => {
  element.textContent = typeof payload === 'string' ? payload : formatJson(payload);
};

const appendLog = (title, payload) => {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<strong>${title}</strong><div>${escapeHtml(
    typeof payload === 'string' ? payload : formatJson(payload)
  ).replace(/\n/g, '<br />')}</div>`;
  els.log.prepend(entry);
};

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getFormValue = (form, name) => new FormData(form).get(name)?.toString().trim() ?? '';

const autoKey = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
let currentStatus;

const fetchJson = async (url, options = {}) => {
  const { headers: optionHeaders, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders ?? {})
    }
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.payload = payload;
    throw error;
  }

  return payload;
};

const refreshSystem = async () => {
  try {
    const [health, status] = await Promise.all([fetchJson('/health'), fetchJson('/api/system/status')]);
    currentStatus = status;
    els.runtimePill.textContent = health.status;
    setBlock(els.systemStatus, { health, status });
    renderWallets(status.wallets);
    hydrateContractForm(status.contracts);
    appendLog('Runtime refreshed', { health, status });
  } catch (error) {
    els.runtimePill.textContent = 'error';
    setBlock(els.systemStatus, error.payload ?? { message: error.message });
    appendLog('Runtime refresh failed', error.payload ?? { message: error.message });
  }
};

const hydrateContractForm = (contracts) => {
  const profile = els.contractProfileForm.elements.profile;
  const mainnetContract = els.contractProfileForm.elements.mainnetContract;
  const testnetContract = els.contractProfileForm.elements.testnetContract;
  const customContractAddress = els.contractProfileForm.elements.customContractAddress;
  const submitButton = els.contractProfileForm.querySelector('button[type="submit"]');

  profile.value = contracts.activeProfile;
  mainnetContract.value = contracts.profiles.mainnet ?? '';
  testnetContract.value = contracts.profiles.testnet ?? '';
  if (contracts.activeProfile !== 'custom') {
    customContractAddress.value = contracts.activeContractAddress ?? '';
  }

  const editable = Boolean(contracts.runtimeEditable);
  profile.disabled = !editable;
  customContractAddress.disabled = !editable;
  submitButton.disabled = !editable;
  els.contractProfileNote.textContent = editable
    ? 'Runtime profile switching is enabled for this sandbox. You can switch runtime, mainnet, testnet, or custom contract targets from this page.'
    : 'Runtime profile switching is disabled here. Set ALLOW_RUNTIME_PROFILE_SWITCHING or APP_ALLOW_RUNTIME_PROFILE_SWITCHING to true and redeploy if you want server-side mainnet/testnet switching.';

  setBlock(els.contractResult, {
    activeProfile: contracts.activeProfile,
    activeContractAddress: contracts.activeContractAddress,
    runtimeDefaultContractAddress: contracts.runtimeDefaultContractAddress,
    runtimeEditable: contracts.runtimeEditable
  });
};

const renderWallets = (wallets) => {
  els.walletList.innerHTML = '';

  const rows = Array.isArray(wallets.catalog)
    ? wallets.catalog
    : [
        { code: 'treasury', label: 'Treasury Wallet', address: wallets.treasury, custody: 'multisig' },
        ...wallets.deposits.map((value, index) => ({
          code: `deposit-${index + 1}`,
          label: `Deposit Wallet ${index + 1}`,
          address: value,
          custody: 'multisig'
        })),
        { code: 'hot', label: 'Hot Wallet', address: wallets.hot, custody: 'general' }
      ];

  for (const wallet of rows) {
    const item = document.createElement('li');
    const flowTags = Array.isArray(wallet.flowTags) ? wallet.flowTags.join(' / ') : '';
    const allocation = wallet.allocationLabel
      ? `${wallet.allocationLabel}${wallet.allocationUnits ? ` · ${wallet.allocationUnits}` : ''}`
      : 'n/a';
    const monitoring = wallet.monitoring;
    const monitoringToken = monitoring?.tokenBalance ?? 'unavailable';
    const monitoringTrx = monitoring?.trxBalance ?? 'unavailable';
    const monitoringStatus = monitoring?.status ?? 'unknown';
    item.innerHTML = `
      <div class="wallet-row-head">
        <span class="wallet-kind">${escapeHtml(wallet.label ?? wallet.code)}</span>
        <span class="wallet-chip">${escapeHtml(wallet.custody ?? 'unknown')}</span>
      </div>
      <span class="wallet-value">${escapeHtml(wallet.address)}</span>
      <span class="wallet-monitor">KORI: ${escapeHtml(monitoringToken)} | TRX: ${escapeHtml(monitoringTrx)}</span>
      <span class="wallet-meta">monitoring: ${escapeHtml(monitoringStatus)}</span>
      <span class="wallet-meta">code: ${escapeHtml(wallet.code ?? 'unknown')}</span>
      <span class="wallet-meta">allocation: ${escapeHtml(allocation)}</span>
      ${flowTags ? `<span class="wallet-meta">flows: ${escapeHtml(flowTags)}</span>` : ''}
      ${monitoring?.error ? `<span class="wallet-meta">monitor error: ${escapeHtml(monitoring.error)}</span>` : ''}
      ${wallet.notes ? `<span class="wallet-meta">${escapeHtml(wallet.notes)}</span>` : ''}
    `;
    els.walletList.append(item);
  }
};

document.querySelector('#refresh-system').addEventListener('click', refreshSystem);
document.querySelector('#run-monitoring').addEventListener('click', async () => {
  try {
    const payload = await fetchJson('/api/system/monitoring/run', { method: 'POST' });
    currentStatus = payload.status;
    setBlock(els.systemStatus, { status: payload.status, run: payload.run });
    renderWallets(payload.status.wallets);
    hydrateContractForm(payload.status.contracts);
    appendLog('Monitoring cycle completed', payload.run);
  } catch (error) {
    appendLog('Monitoring cycle failed', error.payload ?? { message: error.message });
  }
});
document.querySelector('#check-health').addEventListener('click', async () => {
  try {
    const payload = await fetchJson('/health');
    appendLog('Health check', payload);
    els.runtimePill.textContent = payload.status;
  } catch (error) {
    appendLog('Health check failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#clear-log').addEventListener('click', () => {
  els.log.innerHTML = '';
});

document.querySelector('#lookup-binding').addEventListener('click', async () => {
  const userId = getFormValue(els.bindingForm, 'userId');
  const walletAddress = getFormValue(els.bindingForm, 'walletAddress');
  const searchParams = new URLSearchParams();
  if (userId) {
    searchParams.set('userId', userId);
  }
  if (walletAddress) {
    searchParams.set('walletAddress', walletAddress);
  }

  try {
    const payload = await fetchJson(`/api/wallets/address-binding?${searchParams.toString()}`);
    setBlock(els.bindingResult, payload);
    appendLog('Wallet binding lookup', payload);
  } catch (error) {
    setBlock(els.bindingResult, error.payload ?? { message: error.message });
    appendLog('Wallet binding lookup failed', error.payload ?? { message: error.message });
  }
});

els.bindingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = await fetchJson('/api/wallets/address-binding', {
      method: 'POST',
      body: JSON.stringify({
        userId: getFormValue(els.bindingForm, 'userId'),
        walletAddress: getFormValue(els.bindingForm, 'walletAddress')
      })
    });
    setBlock(els.bindingResult, payload);
    appendLog('Wallet binding upserted', payload);
  } catch (error) {
    setBlock(els.bindingResult, error.payload ?? { message: error.message });
    appendLog('Wallet binding upsert failed', error.payload ?? { message: error.message });
  }
});

els.contractProfileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const profile = getFormValue(form, 'profile');
  const customContractAddress = getFormValue(form, 'customContractAddress');

  try {
    const payload = await fetchJson('/api/system/runtime-profile', {
      method: 'POST',
      body: JSON.stringify({
        profile,
        customContractAddress: customContractAddress || undefined
      })
    });
    currentStatus = payload;
    hydrateContractForm(payload.contracts);
    setBlock(els.systemStatus, { health: await fetchJson('/health'), status: payload });
    appendLog('Contract profile updated', payload.contracts);
  } catch (error) {
    setBlock(els.contractResult, error.payload ?? { message: error.message });
    appendLog('Contract profile update failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#balance-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const searchParams = new URLSearchParams();
  const userId = getFormValue(form, 'userId');
  const walletAddress = getFormValue(form, 'walletAddress');
  if (userId) {
    searchParams.set('userId', userId);
  }
  if (walletAddress) {
    searchParams.set('walletAddress', walletAddress);
  }

  try {
    const payload = await fetchJson(`/api/wallets/balance?${searchParams.toString()}`);
    setBlock(els.balanceResult, payload);
    appendLog('Balance fetched', payload);
  } catch (error) {
    setBlock(els.balanceResult, error.payload ?? { message: error.message });
    appendLog('Balance fetch failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#deposit-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const system = currentStatus ?? (await fetchJson('/api/system/status'));
  const body = {
    userId: getFormValue(form, 'userId') || undefined,
    walletAddress: getFormValue(form, 'walletAddress') || undefined,
    txHash: getFormValue(form, 'txHash') || autoKey('deposit'),
    toAddress: getFormValue(form, 'toAddress') || system.wallets.tracked[0],
    amount: Number(getFormValue(form, 'amount')),
    blockNumber: Number(getFormValue(form, 'blockNumber'))
  };

  try {
    const payload = await fetchJson('/api/deposits/scan', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setBlock(els.depositResult, payload);
    appendLog('Deposit processed', payload);
    refreshSystem();
  } catch (error) {
    setBlock(els.depositResult, error.payload ?? { message: error.message });
    appendLog('Deposit failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#transfer-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const body = {
    fromUserId: getFormValue(form, 'fromUserId') || undefined,
    fromWalletAddress: getFormValue(form, 'fromWalletAddress') || undefined,
    toUserId: getFormValue(form, 'toUserId') || undefined,
    toWalletAddress: getFormValue(form, 'toWalletAddress') || undefined,
    amount: Number(getFormValue(form, 'amount'))
  };
  const idempotencyKey = getFormValue(form, 'idempotencyKey') || autoKey('transfer');

  try {
    const payload = await fetchJson('/api/wallets/transfer', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(body)
    });
    setBlock(els.transferResult, payload);
    appendLog('Transfer executed', payload);
  } catch (error) {
    setBlock(els.transferResult, error.payload ?? { message: error.message });
    appendLog('Transfer failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#withdraw-request-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const body = {
    userId: getFormValue(form, 'userId') || undefined,
    walletAddress: getFormValue(form, 'walletAddress') || undefined,
    toAddress: getFormValue(form, 'toAddress'),
    amount: Number(getFormValue(form, 'amount'))
  };
  const idempotencyKey = getFormValue(form, 'idempotencyKey') || autoKey('withdraw');

  try {
    const payload = await fetchJson('/api/withdrawals', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(body)
    });
    const withdrawalId = payload.withdrawal?.withdrawalId;
    if (withdrawalId) {
      els.withdrawIdInput.value = withdrawalId;
    }
    setBlock(els.withdrawResult, payload);
    appendLog('Withdrawal requested', payload);
  } catch (error) {
    setBlock(els.withdrawResult, error.payload ?? { message: error.message });
    appendLog('Withdrawal request failed', error.payload ?? { message: error.message });
  }
});

document.querySelector('#withdraw-actions-form').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const withdrawalId = els.withdrawIdInput.value.trim();
  if (!withdrawalId) {
    setBlock(els.withdrawResult, { error: 'withdrawalId is required' });
    return;
  }

  const action = button.dataset.action;
  const path =
    action === 'get'
      ? `/api/withdrawals/${encodeURIComponent(withdrawalId)}`
      : `/api/withdrawals/${encodeURIComponent(withdrawalId)}/${action}`;
  const method = action === 'get' ? 'GET' : 'POST';

  try {
    const payload = await fetchJson(path, { method });
    setBlock(els.withdrawResult, payload);
    appendLog(`Withdrawal ${action}`, payload);
  } catch (error) {
    setBlock(els.withdrawResult, error.payload ?? { message: error.message });
    appendLog(`Withdrawal ${action} failed`, error.payload ?? { message: error.message });
  }
});

document.querySelector('#scheduler-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const body = {
    timeoutSec: Number(getFormValue(form, 'timeoutSec'))
  };

  try {
    const payload = await fetchJson('/api/scheduler/retry-pending', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setBlock(els.schedulerResult, payload);
    appendLog('Scheduler executed', payload);
  } catch (error) {
    setBlock(els.schedulerResult, error.payload ?? { message: error.message });
    appendLog('Scheduler failed', error.payload ?? { message: error.message });
  }
});

refreshSystem();
