import { getProductImage } from '../lib/productImage.js';
import { Badge } from './ui/badge.jsx';
import { Card, CardContent } from './ui/card.jsx';

const FALLBACK_IMAGE = 'https://placehold.co/300x300?text=No+Image';

export default function ProductCard({ product }) {
  return (
    <Card className="group overflow-hidden border-border/80 bg-card/95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={getProductImage(product.images)}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 font-medium">
          {product.category?.name || 'Uncategorized'}
        </Badge>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.title}
        </h3>
        <p className="text-base font-bold text-foreground">${product.price?.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
