import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { insertTicket } from '../fixtures/tickets.fixtures.js';

describe('AI API', () => {
  it('requires ticketId in request body', async () => {
    const res = await request(app).post('/api/ai/suggest-reply').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ticketId is required' });
  });

  it('returns 404 when ticket is missing', async () => {
    const res = await request(app).post('/api/ai/suggest-reply').send({ ticketId: 'TKT-NOPE00' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });

  it('returns ai suggestion for existing ticket', async () => {
    const seeded = await insertTicket({ id: 'TKT-AI0001' });

    const res = await request(app).post('/api/ai/suggest-reply').send({ ticketId: seeded.id });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      suggestion: 'Thanks for contacting us. We are on it.',
    });
  });
});
