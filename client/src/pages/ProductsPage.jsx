import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts.js';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const CATEGORY_ORDER = ['Clothes', 'Electronics', 'Furniture', 'Shoes', 'Miscellaneous'];

function groupByCategory(products) {
  const groups = {};
  for (const product of products) {
    const name = product.category?.name || 'Miscellaneous';
    if (!groups[name]) groups[name] = [];
    groups[name].push(product);
  }

  return Object.entries(groups).sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts(40);
  const grouped = useMemo(() => groupByCategory(products), [products]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <Package size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Products Catalog</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Browse all available products from our store</p>
      </div>

      {error ? (
        <ErrorMessage message="Failed to load products. Please check your connection and try again." />
      ) : isLoading ? (
        <ProductGrid products={[]} isLoading />
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            {products.length} products available
          </p>
          {grouped.map(([category, items]) => (
            <section key={category} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{category}</h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {items.length} {items.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              <ProductGrid products={items} />
            </section>
          ))}
        </>
      )}
    </div>
  );
}
