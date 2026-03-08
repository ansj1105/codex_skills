const els = {
  runtimePill: document.querySelector('#runtime-pill'),
  systemStatus: document.querySelector('#system-status'),
  walletList: document.querySelector('#wallet-list'),
  contractResult: document.querySelector('#contract-result'),
  balanceResult: document.querySelector('#balance-result'),
  depositResult: document.querySelector('#deposit-result'),
  transferResult: document.querySelector('#transfer-result'),
  withdrawResult: document.querySelector('#withdraw-result'),
  schedulerResult: document.querySelector('#scheduler-result'),
  log: document.querySelector('#activity-log'),
  withdrawIdInput: document.querySelector('#withdraw-actions-form input[name="withdrawalId"]'),
  contractProfileForm: document.querySelector('#contract-profile-form')
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
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
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

  profile.value = contracts.activeProfile;
  mainnetContract.value = contracts.profiles.mainnet ?? '';
  testnetContract.value = contracts.profiles.testnet ?? '';
  if (contracts.activeProfile !== 'custom') {
    customContractAddress.value = contracts.activeContractAddress ?? '';
  }

  setBlock(els.contractResult, {
    activeProfile: contracts.activeProfile,
    activeContractAddress: contracts.activeContractAddress,
    runtimeDefaultContractAddress: contracts.runtimeDefaultContractAddress,
    runtimeEditable: contracts.runtimeEditable
  });
};

const renderWallets = (wallets) => {
  els.walletList.innerHTML = '';

  const rows = [
    ['treasury', wallets.treasury],
    ...wallets.deposits.map((value, index) => [`deposit-${index + 1}`, value]),
    ['hot', wallets.hot]
  ];

  for (const [kind, value] of rows) {
    const item = document.createElement('li');
    item.innerHTML = `<span class="wallet-kind">${escapeHtml(kind)}</span><span class="wallet-value">${escapeHtml(value)}</span>`;
    els.walletList.append(item);
  }
};

document.querySelector('#refresh-system').addEventListener('click', refreshSystem);
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
  const userId = getFormValue(form, 'userId');

  try {
    const payload = await fetchJson(`/api/wallets/${encodeURIComponent(userId)}/balance`);
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
    userId: getFormValue(form, 'userId'),
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
    fromUserId: getFormValue(form, 'fromUserId'),
    toUserId: getFormValue(form, 'toUserId'),
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
    userId: getFormValue(form, 'userId'),
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
