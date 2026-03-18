import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductById } from '../api/products.api.js';

export const useProducts = (limit = 20) => {
  return useQuery({
    queryKey: ['products', limit],
    queryFn: () => fetchProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
