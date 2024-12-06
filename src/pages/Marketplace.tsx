import React from 'react';
import ProductCard from '../components/ProductCard';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { marketplaceService } from '../services/marketplaceService';
import type { Product } from '../types';
import SEOHead from '../components/SEOHead';

export default function Marketplace() {
  const { data: products, loading, error } = useSupabaseQuery<Product[]>(
    () => marketplaceService.getAll()
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Marketplace"
        description="Discover local products and connect with sellers in Elampillai's marketplace"
        url={`${window.location.origin}/marketplace`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>
        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}