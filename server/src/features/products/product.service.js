import { normalizeProduct } from './product.utils.js';

const PRODUCTS_API = 'https://api.escuelajs.co/api/v1/products?limit=200';

let cachedProducts = [];
let cachedById = new Map();
let cacheLoadedAt = null;
let loadingPromise = null;

const createError = (message, status = 500) => {
  const err = new Error(message);
  err.status = status;
  return err;
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
    const normalizedProducts = sourceProducts.map(normalizeProduct).filter(Boolean);

    if (normalizedProducts.length === 0) {
      throw createError('No valid products available from source.', 502);
    }

    cachedProducts = normalizedProducts;
    cachedById = new Map(normalizedProducts.map((product) => [product.id, product]));
    cacheLoadedAt = new Date().toISOString();
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
  return {
    count: cachedProducts.length,
    loadedAt: cacheLoadedAt,
  };
};
