import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { insertReply, insertTicket, ticketPayload } from '../fixtures/tickets.fixtures.js';

describe('Tickets API', () => {
  it('creates a ticket with generated id', async () => {
    const res = await request(app).post('/api/tickets').send(ticketPayload());

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^TKT-[A-Z0-9]{6}$/);
    expect(res.body.status).toBe('open');
    expect(res.body.subject).toBe('Package arrived damaged');
  });

  it('returns 404 for missing ticket', async () => {
    const res = await request(app).get('/api/tickets/TKT-NOPE00');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });

  it('returns stats for existing tickets', async () => {
    await insertTicket({ id: 'TKT-OPEN01', status: 'open' });
    await insertTicket({ id: 'TKT-CLOSE1', status: 'closed' });

    const res = await request(app).get('/api/tickets/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 2, open: 1, closed: 1 });
  });

  it('updates ticket status', async () => {
    const seeded = await insertTicket({ id: 'TKT-OPEN02', status: 'open' });

    const res = await request(app).patch(`/api/tickets/${seeded.id}/status`).send({ status: 'closed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  it('returns replies for a ticket', async () => {
    const seeded = await insertTicket({ id: 'TKT-OPEN03' });
    await insertReply(seeded.id, { content: 'First support message' });
    await insertReply(seeded.id, { author: 'Seed User', content: 'Customer follow-up' });

    const res = await request(app).get(`/api/tickets/${seeded.id}/replies`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].content).toBe('First support message');
  });

  it('blocks replies on closed tickets', async () => {
    const seeded = await insertTicket({ id: 'TKT-CLOSE2', status: 'closed' });

    const res = await request(app).post(`/api/tickets/${seeded.id}/replies`).send({ content: 'Can you help?' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Cannot reply to a closed ticket' });
  });
});
