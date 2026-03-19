const DEAD_HOSTS = new Set(['placeimg.com']);

const isSafeImageUrl = (value) => {
  if (!value || typeof value !== 'string') return false;

  const cleaned = value.replace(/[\[\]"\\]/g, '').trim();
  if (!cleaned.startsWith('http')) return false;

  try {
    const parsed = new URL(cleaned);
    if (DEAD_HOSTS.has(parsed.hostname)) return false;

    const isEscuelaFileHost =
      parsed.hostname === 'api.escuelajs.co' && parsed.pathname.startsWith('/api/v1/files/');
    if (isEscuelaFileHost) return false;

    return true;
  } catch {
    return false;
  }
};

export const getSafeImageUrl = (images) => {
  const candidates = Array.isArray(images) ? images : [images];
  for (const candidate of candidates) {
    if (isSafeImageUrl(candidate)) {
      return candidate.replace(/[\[\]"\\]/g, '').trim();
    }
  }
  return null;
};

export const normalizeProduct = (rawProduct) => {
  const id = Number(rawProduct?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const safeImage = getSafeImageUrl(rawProduct?.images);
  if (!safeImage) return null;

  return {
    id,
    title: rawProduct?.title || `Product #${id}`,
    price: Number(rawProduct?.price) || 0,
    description: rawProduct?.description || '',
    category: rawProduct?.category
      ? {
          id: Number(rawProduct.category.id) || 0,
          name: rawProduct.category.name || 'Miscellaneous',
          slug: rawProduct.category.slug || '',
        }
      : null,
    images: [safeImage],
  };
};
