import {
  getCategoryDefaultImage,
  getImageCandidates,
  normalizeProductBase,
} from './product.utils.js';

const PRODUCTS_API = 'https://api.escuelajs.co/api/v1/products?limit=200';

let cachedProducts = [];
let cachedById = new Map();
let cacheLoadedAt = null;
let loadingPromise = null;
let cacheMeta = {
  sourceTotal: 0,
  keptTotal: 0,
  droppedTotal: 0,
  validatedImageTotal: 0,
  defaultImageTotal: 0,
  loadedAt: null,
};

const createError = (message, status = 500) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const IMAGE_REQUEST_TIMEOUT_MS = 3500;
const MAX_IMAGE_CANDIDATES_PER_PRODUCT = 3;
const PRODUCT_CONCURRENCY = 10;

const evaluateImageResponse = (response) => {
  if (!response.ok) return false;

  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('image/')) return false;

  const corp = response.headers.get('cross-origin-resource-policy')?.toLowerCase();
  if (corp && corp !== 'cross-origin') return false;

  return true;
};

const fetchWithTimeout = async (url, method, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
    });
  } finally {
    clearTimeout(timer);
  }
};

const isImageUrlReachable = async (url) => {
  try {
    const headResponse = await fetchWithTimeout(url, 'HEAD', IMAGE_REQUEST_TIMEOUT_MS);
    if (evaluateImageResponse(headResponse)) return true;
  } catch {
    // Fall through to GET fallback.
  }

  try {
    const getResponse = await fetchWithTimeout(url, 'GET', IMAGE_REQUEST_TIMEOUT_MS);
    const valid = evaluateImageResponse(getResponse);
    if (getResponse.body) {
      await getResponse.body.cancel();
    }
    return valid;
  } catch {
    return false;
  }
};

const mapWithConcurrency = async (items, limit, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
};

const loadProductsOnce = async () => {
  if (cachedProducts.length > 0) return cachedProducts;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const res = await fetch(PRODUCTS_API);
    if (!res.ok) {
      throw createError(`Products source returned ${res.status}`, 502);
    }

    const sourceProducts = await res.json();
    const stats = {
      sourceTotal: sourceProducts.length,
      keptTotal: 0,
      droppedTotal: 0,
      validatedImageTotal: 0,
      defaultImageTotal: 0,
      loadedAt: null,
    };

    const normalizedProducts = (
      await mapWithConcurrency(sourceProducts, PRODUCT_CONCURRENCY, async (rawProduct) => {
        const base = normalizeProductBase(rawProduct);
        if (!base) {
          stats.droppedTotal += 1;
          return null;
        }

        const candidates = getImageCandidates(rawProduct?.images).slice(0, MAX_IMAGE_CANDIDATES_PER_PRODUCT);
        let chosenImage = null;

        for (const candidate of candidates) {
          if (await isImageUrlReachable(candidate)) {
            chosenImage = candidate;
            stats.validatedImageTotal += 1;
            break;
          }
        }

        if (!chosenImage) {
          chosenImage = getCategoryDefaultImage(base.category?.name);
          stats.defaultImageTotal += 1;
        }

        stats.keptTotal += 1;
        return {
          ...base,
          images: [chosenImage],
        };
      })
    ).filter(Boolean);

    if (normalizedProducts.length === 0) {
      throw createError('No valid products available from source.', 502);
    }

    cachedProducts = normalizedProducts;
    cachedById = new Map(normalizedProducts.map((product) => [product.id, product]));
    cacheLoadedAt = new Date().toISOString();
    stats.loadedAt = cacheLoadedAt;
    cacheMeta = stats;
    return cachedProducts;
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
};

export const getProducts = async (limit) => {
  const products = await loadProductsOnce();
  if (!limit) return products;
  return products.slice(0, limit);
};

export const getProductById = async (id) => {
  await loadProductsOnce();
  return cachedById.get(id) || null;
};

export const getCacheMeta = async () => {
  await loadProductsOnce();
  return cacheMeta;
};
