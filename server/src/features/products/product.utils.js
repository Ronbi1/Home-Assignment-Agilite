const DEAD_HOSTS = new Set(['placeimg.com']);

const CATEGORY_DEFAULT_IMAGES = {
  Electronics: 'https://placehold.co/600x600/0f172a/94a3b8?text=Electronics',
  'Casual Clothes': 'https://placehold.co/600x600/1e293b/94a3b8?text=Clothes',
  Clothes: 'https://placehold.co/600x600/1e293b/94a3b8?text=Clothes',
  Furniture: 'https://placehold.co/600x600/334155/94a3b8?text=Furniture',
  Shoes: 'https://placehold.co/600x600/0f172a/94a3b8?text=Shoes',
  Miscellaneous: 'https://placehold.co/600x600/1f2937/94a3b8?text=Product',
};

const normalizeImageCandidate = (value) => {
  if (!value || typeof value !== 'string') return null;

  const cleaned = value.replace(/[\[\]"\\]/g, '').trim();
  if (!cleaned.startsWith('http')) return null;

  try {
    const parsed = new URL(cleaned);
    if (DEAD_HOSTS.has(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

export const getImageCandidates = (images) => {
  const candidates = Array.isArray(images) ? images : [images];
  return candidates
    .map(normalizeImageCandidate)
    .filter(Boolean);
};

export const getCategoryDefaultImage = (categoryName) =>
  CATEGORY_DEFAULT_IMAGES[categoryName] || CATEGORY_DEFAULT_IMAGES.Miscellaneous;

export const normalizeProductBase = (rawProduct) => {
  const id = Number(rawProduct?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const category = rawProduct?.category
    ? {
        id: Number(rawProduct.category.id) || 0,
        name: rawProduct.category.name || 'Miscellaneous',
        slug: rawProduct.category.slug || '',
      }
    : {
        id: 0,
        name: 'Miscellaneous',
        slug: '',
      };

  return {
    id,
    title: rawProduct?.title || `Product #${id}`,
    price: Number(rawProduct?.price) || 0,
    description: rawProduct?.description || '',
    category,
    images: [],
  };
};
