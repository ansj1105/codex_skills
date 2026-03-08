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
  onchainLookupResult: document.querySelector('#onchain-lookup-result'),
  onchainSendResult: document.querySelector('#onchain-send-result'),
  onchainSendNote: document.querySelector('#onchain-send-note'),
  fundingPill: document.querySelector('#funding-pill'),
  fundingHotWallet: document.querySelector('#funding-hot-wallet'),
  fundingNetwork: document.querySelector('#funding-network'),
  fundingBalances: document.querySelector('#funding-balances'),
  fundingStatus: document.querySelector('#funding-status'),
  fundingExplorerLink: document.querySelector('#funding-explorer-link'),
  fundingFaucetLink: document.querySelector('#funding-faucet-link'),
  onchainNetworkMeta: document.querySelector('#onchain-network-meta'),
  onchainNetworkPill: document.querySelector('#onchain-network-pill'),
  log: document.querySelector('#activity-log'),
  withdrawIdInput: document.querySelector('#withdraw-actions-form input[name="withdrawalId"]'),
  contractProfileForm: document.querySelector('#contract-profile-form'),
  bindingForm: document.querySelector('#binding-form'),
  onchainLookupForm: document.querySelector('#onchain-lookup-form'),
  onchainSendForm: document.querySelector('#onchain-send-form'),
  onchainTabs: Array.from(document.querySelectorAll('#onchain-tabs .tab-button'))
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
let activeOnchainNetwork = 'testnet';
const networkResources = {
  mainnet: {
    explorerBaseUrl: 'https://tronscan.org/#/address/',
    faucetUrl: null
  },
  testnet: {
    explorerBaseUrl: 'https://nile.tronscan.org/#/address/',
    faucetUrl: 'http://nileex.io/join/getJoinPage'
  }
};

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

const updateOnchainConsole = (status) => {
  const networkInfo = status?.networks?.[activeOnchainNetwork];
  const sandbox = status?.sandbox ?? {};
  const runtime = status?.runtime ?? {};
  const walletAddress = status?.wallets?.hot ?? '';
  const networkLinks = networkResources[activeOnchainNetwork];
  const sendEnabled =
    sandbox.directOnchainSendEnabled &&
    (activeOnchainNetwork !== 'mainnet' || sandbox.mainnetDirectOnchainSendEnabled) &&
    runtime.tronGatewayMode === 'trc20';

  els.onchainTabs.forEach((tab) => {
    const isActive = tab.dataset.network === activeOnchainNetwork;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  els.onchainNetworkPill.textContent = activeOnchainNetwork;
  els.onchainNetworkMeta.textContent = networkInfo
    ? `${networkInfo.tronApiUrl} | contract ${networkInfo.contractAddress}`
    : 'network status unavailable';
  els.fundingNetwork.textContent = activeOnchainNetwork;
  els.fundingHotWallet.textContent = walletAddress || 'not configured';
  els.fundingExplorerLink.href = walletAddress ? `${networkLinks.explorerBaseUrl}${walletAddress}` : '#';
  els.fundingExplorerLink.setAttribute('aria-disabled', String(!walletAddress));
  if (networkLinks.faucetUrl) {
    els.fundingFaucetLink.href = networkLinks.faucetUrl;
    els.fundingFaucetLink.hidden = false;
  } else {
    els.fundingFaucetLink.href = '#';
    els.fundingFaucetLink.hidden = true;
  }

  const submitButton = els.onchainSendForm.querySelector('button[type="submit"]');
  submitButton.disabled = !sendEnabled;

  if (!sandbox.directOnchainSendEnabled) {
    els.onchainSendNote.innerHTML =
      'Direct hot wallet send is disabled by <code>ALLOW_SANDBOX_DIRECT_ONCHAIN_SEND</code>.';
    return;
  }

  if (activeOnchainNetwork === 'mainnet' && !sandbox.mainnetDirectOnchainSendEnabled) {
    els.onchainSendNote.innerHTML =
      'Mainnet direct send is blocked by default. Enable <code>ALLOW_MAINNET_SANDBOX_DIRECT_ONCHAIN_SEND=true</code> only when you intend to use it.';
    return;
  }

  if (runtime.tronGatewayMode !== 'trc20') {
    els.onchainSendNote.innerHTML =
      'Direct hot wallet send requires <code>TRON_GATEWAY_MODE=trc20</code>. Current mode is mock.';
    return;
  }

  els.onchainSendNote.innerHTML =
    'Direct hot wallet send is enabled for this tab. This sends actual KORI from the configured hot wallet on the selected network.';
};

const refreshFundingStatus = async () => {
  const hotWalletAddress = currentStatus?.wallets?.hot;
  if (!hotWalletAddress) {
    els.fundingPill.textContent = 'missing';
    els.fundingBalances.textContent = 'hot wallet not configured';
    setBlock(els.fundingStatus, { error: 'HOT_WALLET_ADDRESS is not configured' });
    return;
  }

  els.fundingPill.textContent = 'checking';
  els.fundingBalances.textContent = 'checking';

  try {
    const payload = await fetchJson(
      `/api/onchain/networks/${encodeURIComponent(activeOnchainNetwork)}/wallets/${encodeURIComponent(hotWalletAddress)}/balance`
    );
    const wallet = payload.wallet;
    const trxBalance = wallet?.trxBalance ?? 'unavailable';
    const tokenBalance = wallet?.tokenBalance ?? 'unavailable';
    const ready = wallet?.status === 'ok' && Number(trxBalance) > 0;

    els.fundingPill.textContent = ready ? 'ready' : wallet?.status ?? 'error';
    els.fundingBalances.textContent = `TRX ${trxBalance} | KORI ${tokenBalance}`;
    setBlock(els.fundingStatus, payload);
    appendLog('Funding status refreshed', payload);
  } catch (error) {
    els.fundingPill.textContent = 'error';
    els.fundingBalances.textContent = 'lookup failed';
    setBlock(els.fundingStatus, error.payload ?? { message: error.message });
    appendLog('Funding status failed', error.payload ?? { message: error.message });
  }
};

const refreshSystem = async () => {
  try {
    const [health, status] = await Promise.all([fetchJson('/health'), fetchJson('/api/system/status')]);
    currentStatus = status;
    if (status.contracts.activeProfile === 'mainnet' || status.contracts.activeProfile === 'testnet') {
      activeOnchainNetwork = status.contracts.activeProfile;
    }
    els.runtimePill.textContent = health.status;
    setBlock(els.systemStatus, { health, status });
    renderWallets(status.wallets);
    hydrateContractForm(status.contracts);
    updateOnchainConsole(status);
    await refreshFundingStatus();
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
    activeTronApiUrl: contracts.activeTronApiUrl,
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
    updateOnchainConsole(payload.status);
    await refreshFundingStatus();
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

els.onchainTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeOnchainNetwork = tab.dataset.network;
    updateOnchainConsole(currentStatus);
    refreshFundingStatus();
    appendLog('On-chain tab switched', { network: activeOnchainNetwork });
  });
});

document.querySelector('#check-hot-wallet').addEventListener('click', refreshFundingStatus);

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
    updateOnchainConsole(payload);
    setBlock(els.systemStatus, { health: await fetchJson('/health'), status: payload });
    appendLog('Contract profile updated', payload.contracts);
  } catch (error) {
    setBlock(els.contractResult, error.payload ?? { message: error.message });
    appendLog('Contract profile update failed', error.payload ?? { message: error.message });
  }
});

els.onchainLookupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const address = getFormValue(els.onchainLookupForm, 'address');

  try {
    const payload = await fetchJson(
      `/api/onchain/networks/${encodeURIComponent(activeOnchainNetwork)}/wallets/${encodeURIComponent(address)}/balance`
    );
    setBlock(els.onchainLookupResult, payload);
    appendLog('On-chain lookup completed', payload);
  } catch (error) {
    setBlock(els.onchainLookupResult, error.payload ?? { message: error.message });
    appendLog('On-chain lookup failed', error.payload ?? { message: error.message });
  }
});

els.onchainSendForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = {
    toAddress: getFormValue(els.onchainSendForm, 'toAddress'),
    amount: Number(getFormValue(els.onchainSendForm, 'amount'))
  };

  try {
    const payload = await fetchJson(`/api/onchain/networks/${encodeURIComponent(activeOnchainNetwork)}/transfers`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setBlock(els.onchainSendResult, payload);
    await refreshFundingStatus();
    appendLog('On-chain transfer sent', payload);
  } catch (error) {
    setBlock(els.onchainSendResult, error.payload ?? { message: error.message });
    appendLog('On-chain transfer failed', error.payload ?? { message: error.message });
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
