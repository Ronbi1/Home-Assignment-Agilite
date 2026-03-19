import { beforeEach, vi } from 'vitest';

const { openAiCreateMock } = vi.hoisted(() => ({
  openAiCreateMock: vi.fn(),
}));

const sampleProducts = [
  {
    id: 101,
    title: 'Keyboard',
    price: 49,
    description: 'Mechanical keyboard',
    category: { id: 1, name: 'Electronics', slug: 'electronics' },
    images: ['https://cdn.example.com/keyboard.png'],
  },
  {
    id: 202,
    title: 'Chair',
    price: 149,
    description: 'Ergonomic chair',
    category: { id: 2, name: 'Furniture', slug: 'furniture' },
    images: ['https://cdn.example.com/chair.png'],
  },
];

const defaultFetchMock = async (input) => {
  const url = String(input);

  if (url.startsWith('https://api.escuelajs.co/api/v1/products')) {
    return new Response(JSON.stringify(sampleProducts), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response('', {
    status: 200,
    headers: {
      'content-type': 'image/png',
      'cross-origin-resource-policy': 'cross-origin',
    },
  });
};

vi.mock('../../src/config/openai.js', () => ({
  default: () => ({
    chat: {
      completions: {
        create: openAiCreateMock,
      },
    },
  }),
}));

beforeEach(() => {
  openAiCreateMock.mockReset();
  openAiCreateMock.mockResolvedValue({
    choices: [{ message: { content: 'Thanks for contacting us. We are on it.' } }],
  });

  vi.stubGlobal('fetch', vi.fn(defaultFetchMock));
});
