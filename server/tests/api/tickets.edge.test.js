import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { insertTicket, ticketPayload } from '../fixtures/tickets.fixtures.js';

// ─────────────────────────────────────────────────────────────────────────────
// Tickets API — Advanced Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('Tickets API – Validation & Malformed Data', () => {
  it('rejects ticket creation when customerName is missing', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ customerName: undefined }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('rejects ticket creation when customerEmail is missing', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ customerEmail: undefined }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('rejects ticket creation with an invalid email format', async () => {
    const invalidEmails = ['notanemail', 'missing@tld', '@nodomain.com', 'space @example.com'];

    for (const customerEmail of invalidEmails) {
      const res = await request(app)
        .post('/api/tickets')
        .send(ticketPayload({ customerEmail }));

      expect(res.status, `Expected 400 for email "${customerEmail}"`).toBe(400);
      expect(res.body.error).toMatch(/email/i);
    }
  });

  it('rejects ticket creation when customerName is too short (< 2 chars)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ customerName: 'A' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('rejects ticket creation when subject is too short (< 5 chars)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ subject: 'Bug' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/subject/i);
  });

  it('rejects ticket creation when message is too short (< 10 chars)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ message: 'Short' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });

  it('rejects ticket creation for an empty request body', async () => {
    const res = await request(app).post('/api/tickets').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('stores XSS payload as-is (no server-side sanitisation)', async () => {
    // The service validates length but does not sanitise HTML/script tags.
    // This test documents current behaviour: the payload is accepted and stored.
    const xssMessage = '<script>alert("xss")</script> I need help with my order please';

    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ message: xssMessage }));

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(xssMessage);
    expect(res.body.has_ai_first_reply).toBe(true);
  });

  it('rejects a message that exceeds the application maximum length', async () => {
    const hugeMessage = 'A'.repeat(50_000); // 50 KB — within Express body limit

    const res = await request(app)
      .post('/api/tickets')
      .send(ticketPayload({ message: hugeMessage }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot exceed 2000 characters/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Tickets API – State Transition Guards', () => {
  it('returns 404 when fetching a ticket with a numeric (non-TKT) id', async () => {
    const res = await request(app).get('/api/tickets/99999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });

  it('returns 404 when fetching a ticket with special-character id', async () => {
    const res = await request(app).get('/api/tickets/TKT-!!!BAD');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });

  it('rejects closing a ticket that is already closed', async () => {
    const seeded = await insertTicket({ id: 'TKT-EDGE01', status: 'closed' });

    const res = await request(app)
      .patch(`/api/tickets/${seeded.id}/status`)
      .send({ status: 'closed' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already closed/i);
  });

  it('allows reopening a closed ticket (no guard prevents open→close→open)', async () => {
    // Documents that the API permits arbitrary status cycling. A closed ticket
    // can be set back to open without restriction.
    const seeded = await insertTicket({ id: 'TKT-EDGE02', status: 'closed' });

    const res = await request(app)
      .patch(`/api/tickets/${seeded.id}/status`)
      .send({ status: 'open' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('open');
  });

  it('rejects an invalid status value', async () => {
    const seeded = await insertTicket({ id: 'TKT-EDGE03', status: 'open' });

    const res = await request(app)
      .patch(`/api/tickets/${seeded.id}/status`)
      .send({ status: 'pending' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid status/i);
  });

  it('rejects adding a reply when content is empty', async () => {
    const seeded = await insertTicket({ id: 'TKT-EDGE04', status: 'open' });

    const res = await request(app)
      .post(`/api/tickets/${seeded.id}/replies`)
      .send({ content: '   ' }); // whitespace-only

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/content/i);
  });

  it('returns 404 when adding a reply to a non-existent ticket', async () => {
    const res = await request(app)
      .post('/api/tickets/TKT-GHOST1/replies')
      .send({ content: 'Hello, is anyone there?' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Tickets API – Pagination & Limits', () => {
  it('ignores unknown query params like limit=10000 and returns all tickets', async () => {
    // The tickets list endpoint does not support a limit query parameter.
    // An absurdly large ?limit value is silently ignored and all tickets are returned.
    await insertTicket({ id: 'TKT-PG0001', status: 'open' });
    await insertTicket({ id: 'TKT-PG0002', status: 'closed' });

    const res = await request(app).get('/api/tickets?limit=10000');

    expect(res.status).toBe(200);
    // Both tickets are returned — the limit param is not respected.
    expect(res.body.length).toBe(2);
  });
});
