import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../src/app.js';

// ─────────────────────────────────────────────────────────────────────────────
// Products API — External API Failure & Edge Cases
//
// IMPORTANT: The product service caches products in module-level state
// (cachedProducts). Each test file runs in its own Vitest worker, so the cache
// starts empty for this file. The failure tests below intentionally prevent the
// cache from being populated, so each subsequent test encounters an empty cache
// and triggers a fresh fetch. The default fetch mock is restored by
// external.setup.js's beforeEach before every test.
// ─────────────────────────────────────────────────────────────────────────────

describe('Products API – External API Failures', () => {
  it('returns 502 when the external products API responds with 500', async () => {
    // Override the global fetch to simulate an upstream 500 error.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Internal Server Error', { status: 500 })),
    );

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 when the external products API has a network-level failure', async () => {
    // The product service only wraps non-ok HTTP responses as 502. A raw network
    // error (fetch throwing) is not caught and re-thrown with a 502 status — the
    // unhandled Error reaches the errorHandler which defaults to 500.
    // Returning 500 for this case is acceptable for the scope of this project.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED: connection refused');
      }),
    );

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 when the external products API returns malformed JSON', async () => {
    // res.json() throws a native SyntaxError which has no .status property, so
    // the errorHandler defaults to 500. Returning 500 for this case is acceptable
    // for the scope of this project.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{ this is not : valid JSON !!!', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Products API – Limit Validation', () => {
  // These tests run after the failure tests above. At this point the cache is
  // still empty (all previous tests failed to populate it). The default fetch
  // mock (restored by external.setup.js beforeEach) will successfully load 2
  // products on the first successful request.

  it('returns all available products when limit exceeds the total count', async () => {
    // The service has no server-side cap on the limit parameter: it simply
    // slices the cached array up to the requested limit. With a real upstream
    // dataset of 200 products this endpoint could return all 200 with a single
    // request, which may be undesirable.
    const res = await request(app).get('/api/products?limit=10000');

    expect(res.status).toBe(200);
    // Mock dataset contains exactly 2 products — both are returned.
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('returns 400 for a negative limit value', async () => {
    const res = await request(app).get('/api/products?limit=-1');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/limit/i);
  });

  it('returns 400 for a non-integer limit value', async () => {
    const res = await request(app).get('/api/products?limit=abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/limit/i);
  });
});
