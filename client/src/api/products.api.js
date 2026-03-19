import axios from 'axios';
import api from '../lib/axios.js';

const PRODUCTS_BASE = '/api/products';

export const fetchProducts = async (limit = 20) => {
  const { data } = await api.get(PRODUCTS_BASE, { params: { limit } });
  return data;
};

export const fetchProductById = async (id) => {
  try {
    const { data } = await api.get(`${PRODUCTS_BASE}/${id}`);
    return data;
  } catch (error) {
    // A missing product in the backend cache should not break the UI.
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        return null;
      }
    }
    throw error;
  }
};
