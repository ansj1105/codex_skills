import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildSystemStatusResponse } from '../src/interfaces/http/routes/system-routes.js';

describe('sandbox assets and runtime status', () => {
  it('builds runtime status payload with contract presets', async () => {
    const payload = buildSystemStatusResponse();

    expect(payload.service.name).toBe('korion-kori-backend');
    expect(Array.isArray(payload.wallets.tracked)).toBe(true);
    expect(payload.wallets.tracked.length).toBeGreaterThan(1);
    expect(payload.contracts.profiles.mainnet).toBeTruthy();
    expect(payload.contracts.profiles.testnet).toBeTruthy();
  });

  it('ships sandbox ui with the main control sections', async () => {
    const html = await readFile(new URL('../public/sandbox/index.html', import.meta.url), 'utf8');

    expect(html).toContain('Operational Sandbox');
    expect(html).toContain('Runtime Status');
    expect(html).toContain('Withdrawal Control');
    expect(html).toContain('Activity Log');
  });
});
