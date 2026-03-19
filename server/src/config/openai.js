import OpenAI from 'openai';

let openai;

const createError = (message, status = 500) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export default function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw createError('AI service is not configured.', 503);
  }

  if (!openai) {
    openai = new OpenAI({ apiKey });
  }
  return openai;
}
