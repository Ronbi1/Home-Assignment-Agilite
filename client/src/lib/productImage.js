const FALLBACK = 'https://placehold.co/300x300?text=No+Image';

const DEAD_HOSTS = ['placeimg.com'];

/**
 * Normalizes a product's images field to a clean, usable URL.
 * The escuelajs API sometimes returns images as escaped JSON strings
 * like ["\"https://url.com/img.jpg\""], so we strip those artifacts.
 * It also returns URLs from defunct hosts (e.g. placeimg.com) which are
 * filtered out in favour of the fallback.
 *
 * @param {string | string[]} images - The images field from the product API
 * @returns {string} A clean image URL or the fallback placeholder
 */
export const getProductImage = (images) => {
  const candidates = Array.isArray(images) ? images : [images];
  for (const raw of candidates) {
    const cleaned = raw?.replace(/[\[\]"\\]/g, '').trim();
    if (cleaned?.startsWith('http') && !DEAD_HOSTS.some((h) => cleaned.includes(h))) {
      return cleaned;
    }
  }
  return FALLBACK;
};
