import { useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts.js';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PageLoadingState from '../components/PageLoadingState.jsx';
import { Badge } from '../components/ui/badge.jsx';

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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: products = [], isLoading, error } = useProducts(40);
  const grouped = useMemo(() => groupByCategory(products), [products]);
  const visibleGroups = useMemo(
    () => (categoryFilter === 'all' ? grouped : grouped.filter(([category]) => category === categoryFilter)),
    [grouped, categoryFilter]
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <Package size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Products Catalog</h1>
        </div>
        <p className="text-sm text-muted-foreground">Browse all available products from our store</p>
      </div>

      {error ? (
        <ErrorMessage message="Failed to load products. Please check your connection and try again." />
      ) : isLoading ? (
        <PageLoadingState message="Loading products catalog..." />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} products available
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="categoryFilter" className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="all">All categories</option>
                {grouped.map(([category]) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {visibleGroups.map(([category, items]) => (
            <section key={category} className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">{category}</h2>
                <Badge variant="secondary" className="font-medium">
                  {items.length} {items.length === 1 ? 'product' : 'products'}
                </Badge>
              </div>
              <ProductGrid products={items} />
            </section>
          ))}
        </>
      )}
    </div>
  );
}
