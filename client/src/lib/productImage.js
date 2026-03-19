const FALLBACK = 'https://placehold.co/300x300?text=No+Image';

const DEAD_HOSTS = ['placeimg.com'];
const BLOCKED_PATH_PREFIXES = ['/api/v1/files/'];

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
    if (!cleaned?.startsWith('http')) continue;

    try {
      const parsed = new URL(cleaned);
      if (DEAD_HOSTS.includes(parsed.hostname)) continue;

      const isEscuelaFileHost =
        parsed.hostname === 'api.escuelajs.co' &&
        BLOCKED_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix));
      if (isEscuelaFileHost) continue;

      return cleaned;
    } catch {
      // Skip malformed values returned by external API.
      continue;
    }
  }
  return FALLBACK;
};
