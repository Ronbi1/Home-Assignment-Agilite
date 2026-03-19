import axios from 'axios';

const PRODUCTS_BASE = 'https://api.escuelajs.co/api/v1/products';

export const fetchProducts = async (limit = 20) => {
  const { data } = await axios.get(`${PRODUCTS_BASE}?limit=${limit}`);
  return data;
};

export const fetchProductById = async (id) => {
  try {
    const { data } = await axios.get(`${PRODUCTS_BASE}/${id}`);
    return data;
  } catch (error) {
    // External catalog IDs can go stale; treat expected client errors as soft-miss.
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        return null;
      }
    }
    throw error;
  }
};
