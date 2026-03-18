import ProductCard from './ProductCard.jsx';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
    <div className="aspect-square bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse w-1/3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse w-2/3" />
      <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse w-1/4" />
    </div>
  </div>
);

export default function ProductGrid({ products, isLoading }) {
  const gridClass = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
