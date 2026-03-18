import { Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts.js';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts(40);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <Package size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Products Catalog</h1>
        </div>
        <p className="text-slate-500 text-sm">Browse all available products from our store</p>
      </div>

      {error ? (
        <ErrorMessage message="Failed to load products. Please check your connection and try again." />
      ) : (
        <>
          {!isLoading && (
            <p className="text-sm text-slate-500 mb-5">
              {products.length} products available
            </p>
          )}
          <ProductGrid products={products} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
