import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useProducts } from '../hooks/useProducts.js';
import { getProductImage } from '../lib/productImage.js';

const FALLBACK_IMAGE = 'https://placehold.co/60x60?text=?';

export default function ProductSelectorModal({ selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const { data: products = [], isLoading } = useProducts(100);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-800">Select a Product</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="w-11 h-11 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No products found</p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSelect(product);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  selected?.id === product.id
                    ? 'bg-indigo-50 ring-1 ring-indigo-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <img
                  src={getProductImage(product.images)}
                  alt={product.title}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-slate-100 border border-slate-200"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{product.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">${product.price}</p>
                </div>
                {selected?.id === product.id && (
                  <Check size={15} className="text-indigo-600 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
