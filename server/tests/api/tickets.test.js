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

  it('soft deletes a closed ticket and hides it from reads', async () => {
    const seeded = await insertTicket({ id: 'TKT-CLOSE3', status: 'closed' });

    const deleteRes = await request(app).delete(`/api/tickets/${seeded.id}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.id).toBe(seeded.id);
    expect(deleteRes.body.status).toBe('closed');
    expect(deleteRes.body.deleted_at).toBeTruthy();

    const listRes = await request(app).get('/api/tickets');
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((ticket) => ticket.id === seeded.id)).toBe(false);

    const statsRes = await request(app).get('/api/tickets/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body).toEqual({ total: 0, open: 0, closed: 0 });

    const detailRes = await request(app).get(`/api/tickets/${seeded.id}`);
    expect(detailRes.status).toBe(404);
    expect(detailRes.body).toEqual({ error: 'Ticket not found' });
  });

  it('rejects deleting an open ticket', async () => {
    const seeded = await insertTicket({ id: 'TKT-OPEN04', status: 'open' });

    const res = await request(app).delete(`/api/tickets/${seeded.id}`);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Only closed tickets can be deleted' });
  });

  it('returns 404 when deleting a missing ticket', async () => {
    const res = await request(app).delete('/api/tickets/TKT-NOPE01');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
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
