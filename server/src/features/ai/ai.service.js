import getOpenAI from '../../config/openai.js';
import * as ticketRepo from '../tickets/ticket.repository.js';
import * as repliesRepo from '../tickets/replies.repository.js';

const SYSTEM_PROMPT = `You are a professional, empathetic customer-support agent for an e-commerce platform.
Draft a helpful reply to the customer based on the ticket and conversation below.
Rules:
- Be concise (2-4 sentences)
- Be solution-oriented and empathetic
- Do not invent information you don't have
- Do not include greetings like "Dear customer" — just the reply body`;

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
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

export const suggestReply = async (ticketId) => {
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw createError('Ticket not found', 404);

  const replies = await repliesRepo.findByTicketId(ticketId);

  try {
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

    return { suggestion };
  } catch (err) {
    if (err.status) throw err;
    throw createError('Failed to generate suggestion. Please try again later.', 502);
  }
};
