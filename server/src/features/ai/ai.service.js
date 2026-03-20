import getOpenAI from '../../config/openai.js';
import * as ticketRepo from '../tickets/ticket.repository.js';
import * as repliesRepo from '../tickets/replies.repository.js';

export const AI_SUPPORT_AUTHOR = 'AI Support Agent';

const SYSTEM_PROMPT = `You are a professional, empathetic customer-support agent for an e-commerce platform.
Draft a helpful reply to the customer based on the ticket and conversation below.
Rules:
- Be concise (2-4 sentences)
- Be solution-oriented and empathetic
- Do not invent information you don't have
- Do not include greetings like "Dear customer" — just the reply body`;

const URGENCY_SYSTEM_PROMPT = `You score support ticket urgency from 0 to 100.
Return STRICT JSON ONLY with this exact shape:
{"ticketId":"string","urgencyScore":0,"reasonShort":"one sentence"}
Rules:
- urgencyScore must be a number between 0 and 100
- reasonShort must be one concise sentence
- do not include markdown, code fences, or extra keys`;
const URGENCY_CACHE_TTL_MS = 90_000;
const URGENCY_DEFAULT_LIMIT = 5;
const URGENCY_MAX_LIMIT = 20;
const URGENCY_CANDIDATE_LIMIT = 30;
const URGENCY_KEYWORDS = [
  'urgent',
  'asap',
  'as soon as possible',
  'not working',
  'broken',
  'refund',
  'replacement',
  'damaged',
  'scratched',
  'item arrived damaged',
  'immediately',
  'right now',
];
const urgencyFeedCache = new Map();

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const clampScore = (score) => Math.min(100, Math.max(0, score));

const normalizeLimit = (rawLimit) => {
  const limit = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(limit)) return URGENCY_DEFAULT_LIMIT;
  return Math.max(1, Math.min(URGENCY_MAX_LIMIT, limit));
};

const hasUrgencyKeywords = (text) => {
  const normalized = String(text || '').toLowerCase();
  return URGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const buildHeuristicScore = (ticket, latestReply, repliesCount) => {
  const textForKeywords = `${ticket.subject || ''} ${ticket.message || ''} ${latestReply?.content || ''}`;
  const hasKeywords = hasUrgencyKeywords(textForKeywords);
  const noReplies = repliesCount === 0;

  const createdAtMs = new Date(ticket.created_at).getTime();
  const ageInHours = Number.isFinite(createdAtMs)
    ? Math.max(0, (Date.now() - createdAtMs) / (1000 * 60 * 60))
    : 0;

  let score = 0;
  if (hasKeywords) score += 40;
  if (noReplies) score += 20;
  score += Math.min(ageInHours * 2, 40);
  score = clampScore(score);

  const roundedHours = Math.max(1, Math.round(ageInHours));
  let reasonShort = `Open ticket for ${roundedHours}h awaiting support review`;
  if (noReplies && hasKeywords) {
    reasonShort = `Unanswered ticket for ${roundedHours}h with urgency keywords`;
  } else if (noReplies) {
    reasonShort = `Unanswered ticket for ${roundedHours}h`;
  } else if (hasKeywords) {
    reasonShort = `Open ticket for ${roundedHours}h with urgency keywords`;
  }

  return { heuristicScore: score, reasonShort };
};

const parseJsonResponse = (content) => {
  if (!content) return null;
  const cleaned = String(content)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const buildUserPrompt = (ticket, replies) => {
  let prompt = `Subject: ${ticket.subject}\nCustomer message: ${ticket.message}`;

  if (replies.length > 0) {
    prompt += '\n\nConversation so far:';
    for (const reply of replies) {
      prompt += `\n[${reply.author}]: ${reply.content}`;
    }
  }

  return prompt;
};

const buildUrgencyPrompt = (ticket, latestReply) => {
  const latestReplyContent = latestReply?.content?.trim() ? latestReply.content.trim() : 'No replies yet';
  return `Ticket ID: ${ticket.id}
Subject: ${ticket.subject}
Initial message: ${ticket.message}
Latest reply: ${latestReplyContent}`;
};

const generateReplySuggestion = async (ticket, replies) => {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(ticket, replies) },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const suggestion = completion?.choices?.[0]?.message?.content?.trim();
  if (!suggestion) {
    throw createError('AI returned an empty suggestion.', 502);
  }

  return suggestion;
};

export const generateReplySuggestionForTicket = async (ticketId) => {
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw createError('Ticket not found', 404);

  const replies = await repliesRepo.findByTicketId(ticketId);

  try {
    return await generateReplySuggestion(ticket, replies);
  } catch (err) {
    if (err.status) throw err;
    throw createError('Failed to generate suggestion. Please try again later.', 502);
  }
};

export const suggestReply = async (ticketId) => {
  const suggestion = await generateReplySuggestionForTicket(ticketId);
  return { suggestion };
};

const scoreTicketUrgency = async (ticket, aiEnabled) => {
  if (!ticket?.id || !ticket?.subject || !ticket?.message) return null;

  const replies = await repliesRepo.findByTicketId(ticket.id);
  const latestReply = replies.at(-1);
  const { heuristicScore, reasonShort: heuristicReason } = buildHeuristicScore(ticket, latestReply, replies.length);

  let aiScore = heuristicScore;
  let reasonShort = heuristicReason;

  if (aiEnabled) {
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: URGENCY_SYSTEM_PROMPT },
          { role: 'user', content: buildUrgencyPrompt(ticket, latestReply) },
        ],
        temperature: 0.1,
        max_tokens: 160,
      });

      const parsed = parseJsonResponse(completion?.choices?.[0]?.message?.content);
      const rawAiScore = parsed?.urgencyScore;
      let normalizedAiScore = Number(rawAiScore);
      if (Number.isNaN(normalizedAiScore)) {
        normalizedAiScore = heuristicScore;
      }
      aiScore = clampScore(normalizedAiScore);

      if (typeof parsed?.reasonShort === 'string' && parsed.reasonShort.trim()) {
        reasonShort = parsed.reasonShort.trim();
      }
    } catch {
      aiScore = heuristicScore;
      reasonShort = heuristicReason;
    }
  }

  const finalScore = clampScore((0.7 * aiScore) + (0.3 * heuristicScore));

  return {
    ticketId: ticket.id,
    finalScore,
    reasonShort,
    ticketUrl: `/tickets/${ticket.id}`,
  };
};

export const getUrgentFeed = async (limitRaw) => {
  const limit = normalizeLimit(limitRaw);
  const cacheKey = `limit:${limit}`;
  const cached = urgencyFeedCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const openTickets = await ticketRepo.findAll('open');
  if (openTickets.length === 0) {
    urgencyFeedCache.set(cacheKey, {
      data: [],
      expiresAt: Date.now() + URGENCY_CACHE_TTL_MS,
    });
    return [];
  }

  const candidates = openTickets.slice(0, URGENCY_CANDIDATE_LIMIT);
  let aiEnabled = true;
  try {
    getOpenAI();
  } catch {
    aiEnabled = false;
  }

  const scored = await Promise.all(candidates.map((ticket) => scoreTicketUrgency(ticket, aiEnabled)));
  const sorted = scored
    .filter(Boolean)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit)
    .map((item) => ({
      ticketId: item.ticketId,
      urgencyScore: item.finalScore,
      reasonShort: item.reasonShort,
      ticketUrl: item.ticketUrl,
    }));

  urgencyFeedCache.set(cacheKey, {
    data: sorted,
    expiresAt: Date.now() + URGENCY_CACHE_TTL_MS,
  });

  return sorted;
};

export const __clearUrgentFeedCacheForTests = () => {
  urgencyFeedCache.clear();
};
