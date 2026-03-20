import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import pool from '../../src/config/db.js';
import { __clearUrgentFeedCacheForTests } from '../../src/features/ai/ai.service.js';
import { insertReply, insertTicket } from '../fixtures/tickets.fixtures.js';
import { openAiCreateMock } from '../setup/external.setup.js';

describe('AI API', () => {
  beforeEach(() => {
    __clearUrgentFeedCacheForTests();
  });

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

  it('returns urgent feed with minimal response shape', async () => {
    const ticket = await insertTicket({
      id: 'TKT-UF0001',
      subject: 'Order issue',
      message: 'My order is delayed.',
      status: 'open',
    });

    openAiCreateMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ ticketId: ticket.id, urgencyScore: 88, reasonShort: 'Customer may churn soon.' }) } }],
    });

    const res = await request(app).get('/api/ai/urgent-feed?limit=1');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].ticketId).toBe(ticket.id);
    expect(res.body[0].reasonShort).toBe('Customer may churn soon.');
    expect(res.body[0].ticketUrl).toBe(`/tickets/${ticket.id}`);
    expect(res.body[0].urgencyScore).toBeGreaterThanOrEqual(60);
    expect(res.body[0].urgencyScore).toBeLessThanOrEqual(100);
    expect(Object.keys(res.body[0]).sort()).toEqual(['reasonShort', 'ticketId', 'ticketUrl', 'urgencyScore']);
  });

  it('sorts urgent feed by final score descending and respects open tickets only', async () => {
    const urgentOpen = await insertTicket({
      id: 'TKT-UF0002',
      subject: 'Urgent: device is broken',
      message: 'This is not working and I need a refund asap.',
      status: 'open',
    });
    const mildOpen = await insertTicket({
      id: 'TKT-UF0003',
      subject: 'Question about product',
      message: 'Can you clarify warranty details?',
      status: 'open',
    });
    await insertTicket({
      id: 'TKT-UF0004',
      subject: 'Urgent closed ticket',
      message: 'Broken and urgent.',
      status: 'closed',
    });

    await insertReply(mildOpen.id, { content: 'We are looking into it.' });
    await pool.query("UPDATE tickets SET created_at = NOW() - INTERVAL '30 hours' WHERE id = $1", [urgentOpen.id]);
    await pool.query("UPDATE tickets SET created_at = NOW() - INTERVAL '2 hours' WHERE id = $1", [mildOpen.id]);

    openAiCreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ ticketId: 'ignored', urgencyScore: 'NaN', reasonShort: '' }) } }],
    });

    const res = await request(app).get('/api/ai/urgent-feed?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.map((item) => item.ticketId)).toEqual([urgentOpen.id, mildOpen.id]);
    expect(res.body[0].urgencyScore).toBeGreaterThan(res.body[1].urgencyScore);
    expect(res.body.every((item) => item.ticketId !== 'TKT-UF0004')).toBe(true);
  });

  it('falls back to heuristic scoring when AI call fails', async () => {
    const ticket = await insertTicket({
      id: 'TKT-UF0005',
      subject: 'Urgent account issue',
      message: 'This is broken and not working.',
      status: 'open',
    });
    await pool.query("UPDATE tickets SET created_at = NOW() - INTERVAL '24 hours' WHERE id = $1", [ticket.id]);

    openAiCreateMock.mockRejectedValueOnce(new Error('AI unavailable'));

    const res = await request(app).get('/api/ai/urgent-feed?limit=1');

    expect(res.status).toBe(200);
    expect(res.body[0].ticketId).toBe(ticket.id);
    expect(res.body[0].urgencyScore).toBeGreaterThanOrEqual(70);
    expect(res.body[0].reasonShort).toContain('urgency keywords');
  });

  it('returns empty array when there are no open tickets', async () => {
    const res = await request(app).get('/api/ai/urgent-feed?limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
