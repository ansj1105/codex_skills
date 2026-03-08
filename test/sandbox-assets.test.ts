import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { createSystemRoutes } from '../src/interfaces/http/routes/system-routes.js';

describe('sandbox assets and runtime status', () => {
  it('returns system status payload from the route handler', async () => {
    const router = createSystemRoutes();
    const layer = router.stack.find((entry) => entry.route?.path === '/status');
    const handler = layer?.route?.stack?.[0]?.handle;

    expect(typeof handler).toBe('function');

    let jsonPayload;
    await handler(
      {},
      {
        json(payload) {
          jsonPayload = payload;
        }
      }
    );

    expect(jsonPayload.service.name).toBe('korion-kori-backend');
    expect(Array.isArray(jsonPayload.wallets.tracked)).toBe(true);
    expect(jsonPayload.wallets.tracked.length).toBeGreaterThan(1);
  });

  it('ships sandbox ui with the main control sections', async () => {
    const html = await readFile(new URL('../public/sandbox/index.html', import.meta.url), 'utf8');

    expect(html).toContain('Operational Sandbox');
    expect(html).toContain('Runtime Status');
    expect(html).toContain('Withdrawal Control');
    expect(html).toContain('Activity Log');
  });
});
