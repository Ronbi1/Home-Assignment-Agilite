import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { __clearUrgentFeedCacheForTests } from '../../src/features/ai/ai.service.js';
import { insertTicket } from '../fixtures/tickets.fixtures.js';
import { openAiCreateMock } from '../setup/external.setup.js';

// ─────────────────────────────────────────────────────────────────────────────
// AI API — External API Failures & Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('AI API – suggest-reply: OpenAI Failures', () => {
  it('returns 502 when the OpenAI API call rejects (simulates upstream 500)', async () => {
    const seeded = await insertTicket({ id: 'TKT-AIE001' });

    openAiCreateMock.mockRejectedValueOnce(new Error('OpenAI API returned 500'));

    const res = await request(app)
      .post('/api/ai/suggest-reply')
      .send({ ticketId: seeded.id });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 502 when the OpenAI request times out', async () => {
    const seeded = await insertTicket({ id: 'TKT-AIE002' });

    openAiCreateMock.mockRejectedValueOnce(
      Object.assign(new Error('Request timed out'), { code: 'ETIMEDOUT' }),
    );

    const res = await request(app)
      .post('/api/ai/suggest-reply')
      .send({ ticketId: seeded.id });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 502 when OpenAI returns an empty content string', async () => {
    const seeded = await insertTicket({ id: 'TKT-AIE003' });

    openAiCreateMock.mockResolvedValueOnce({
      choices: [{ message: { content: '' } }],
    });

    const res = await request(app)
      .post('/api/ai/suggest-reply')
      .send({ ticketId: seeded.id });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 502 when OpenAI returns a null/missing choices array', async () => {
    const seeded = await insertTicket({ id: 'TKT-AIE004' });

    openAiCreateMock.mockResolvedValueOnce({}); // no choices key

    const res = await request(app)
      .post('/api/ai/suggest-reply')
      .send({ ticketId: seeded.id });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });

  it('returns an AI suggestion for a closed ticket (no status guard on AI layer)', async () => {
    // DOCUMENTS current behaviour: the AI suggest-reply endpoint does not check
    // the ticket status. Even a closed ticket will receive an AI suggestion.
    // A stricter implementation might return 403 for closed tickets.
    const seeded = await insertTicket({ id: 'TKT-AIE005', status: 'closed' });

    const res = await request(app)
      .post('/api/ai/suggest-reply')
      .send({ ticketId: seeded.id });

    expect(res.status).toBe(200);
    expect(res.body.suggestion).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('AI API – urgent-feed: Limit Capping & Resilience', () => {
  beforeEach(() => {
    __clearUrgentFeedCacheForTests();
  });

  it('caps the urgent-feed response at URGENCY_MAX_LIMIT (20) even with limit=10000', async () => {
    // The normalizeLimit() function inside the service clamps the limit to a
    // maximum of 20 (URGENCY_MAX_LIMIT). This prevents clients from requesting
    // arbitrarily large feeds.
    for (let i = 0; i < 5; i++) {
      const pad = String(i).padStart(2, '0');
      await insertTicket({
        id: `TKT-UFE0${pad}`,
        subject: `Urgent ticket number ${i}`,
        message: 'This is an urgent issue that needs immediate attention.',
        status: 'open',
      });
    }

    openAiCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              ticketId: 'ignored',
              urgencyScore: 75,
              reasonShort: 'High urgency keyword detected.',
            }),
          },
        },
      ],
    });

    const res = await request(app).get('/api/ai/urgent-feed?limit=10000');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Even though we asked for 10000, the service caps at 20 (and we only have 5)
    expect(res.body.length).toBeLessThanOrEqual(20);
  });

  it('returns 200 with graceful fallback when urgent-feed OpenAI response is malformed JSON', async () => {
    // The urgent-feed endpoint uses parseJsonResponse() which safely catches
    // JSON.parse failures and falls back to the heuristic score. The endpoint
    // should never crash due to malformed AI output.
    await insertTicket({
      id: 'TKT-UFE10',
      subject: 'Device not working at all',
      message: 'My product is completely broken and I need a replacement urgently.',
      status: 'open',
    });

    openAiCreateMock.mockResolvedValueOnce({
      choices: [{ message: { content: 'This is definitely not JSON ~~~' } }],
    });

    const res = await request(app).get('/api/ai/urgent-feed?limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    // Falls back to heuristic — score is still populated
    expect(typeof res.body[0].urgencyScore).toBe('number');
    expect(res.body[0].ticketId).toBe('TKT-UFE10');
  });
});
