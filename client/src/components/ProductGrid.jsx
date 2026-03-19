import ProductCard from './ProductCard.jsx';
import { Card, CardContent } from './ui/card.jsx';

const SkeletonCard = () => (
  <Card className="overflow-hidden border-border/80 bg-card/95">
    <div className="aspect-square animate-pulse bg-muted" />
    <CardContent className="space-y-2 p-4">
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-5 w-1/4 animate-pulse rounded bg-muted" />
    </CardContent>
  </Card>
);

export default function ProductGrid({ products, isLoading }) {
  const gridClass = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

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
