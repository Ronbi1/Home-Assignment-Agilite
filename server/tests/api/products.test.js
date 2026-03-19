import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app.js';

describe('Products API', () => {
  it('returns products and supports limit', async () => {
    const res = await request(app).get('/api/products?limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 101,
      title: 'Keyboard',
      category: { name: 'Electronics' },
    });
    expect(res.body[0].images[0]).toContain('keyboard.png');
  });

  it('returns products cache metadata', async () => {
    const res = await request(app).get('/api/products/meta');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      sourceTotal: 2,
      keptTotal: 2,
      droppedTotal: 0,
    });
    expect(res.body.loadedAt).toBeTruthy();
  });

  it('validates product id path param', async () => {
    const res = await request(app).get('/api/products/not-a-number');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid product id' });
  });

  it('returns 404 for unknown product', async () => {
    const res = await request(app).get('/api/products/999999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
  });
});
