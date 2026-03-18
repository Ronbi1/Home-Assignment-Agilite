import { getProductImage } from '../lib/productImage.js';

const FALLBACK_IMAGE = 'https://placehold.co/300x300?text=No+Image';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="aspect-square overflow-hidden bg-slate-100">
        <img
          src={getProductImage(product.images)}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
          {product.category?.name || 'Uncategorized'}
        </span>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">
          {product.title}
        </h3>
        <p className="text-base font-bold text-slate-900">${product.price?.toLocaleString()}</p>
      </div>
    </div>
  );
}
