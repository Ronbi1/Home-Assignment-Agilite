import axios from 'axios';

const PRODUCTS_BASE = 'https://api.escuelajs.co/api/v1/products';

export const fetchProducts = async (limit = 20) => {
  const { data } = await axios.get(`${PRODUCTS_BASE}?limit=${limit}`);
  return data;
};

export const fetchProductById = async (id) => {
  const { data } = await axios.get(`${PRODUCTS_BASE}/${id}`);
  return data;
};
