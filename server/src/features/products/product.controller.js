import * as productService from './product.service.js';

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const getProducts = async (req, res, next) => {
  try {
    const rawLimit = req.query.limit;
    const limit = rawLimit ? Number(rawLimit) : undefined;

    if (rawLimit && (!Number.isInteger(limit) || limit <= 0)) {
      throw createError('limit must be a positive integer', 400);
    }

    const products = await productService.getProducts(limit);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw createError('Invalid product id', 400);
    }

    const product = await productService.getProductById(id);
    if (!product) {
      throw createError('Product not found', 404);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const getProductsMeta = async (req, res, next) => {
  try {
    const meta = await productService.getCacheMeta();
    res.json(meta);
  } catch (err) {
    next(err);
  }
};
