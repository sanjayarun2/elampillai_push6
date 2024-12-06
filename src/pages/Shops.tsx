import React from 'react';
import ShopCard from '../components/ShopCard';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { shopService } from '../services/shopService';
import type { Shop } from '../types';
import SEOHead from '../components/SEOHead';

export default function Shops() {
  const { data: shops, loading, error } = useSupabaseQuery<Shop[]>(
    () => shopService.getAll()
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Local Shops</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Local Shops</h1>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading shops. Please try again later.</p>
        </div>
      </div>
    );
  }

  const shopKeywords = shops?.map(shop => `${shop.name}, ${shop.category} in Elampillai`).join(', ');

  return (
    <>
      <SEOHead
        title="Local Shops in Elampillai - Directory & Information"
        description="Find local shops in Elampillai. Browse our directory of textile shops, retailers, and businesses in Elampillai, Tamil Nadu."
        url={`${window.location.origin}/shops`}
        type="website"
        keywords={`Elampillai shops, textile shops in Elampillai, local businesses Elampillai, Tamil Nadu shops, ${shopKeywords}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": shops?.map((shop, index) => ({
            "@type": "LocalBusiness",
            "position": index + 1,
            "name": shop.name,
            "description": shop.description,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": shop.address,
              "addressLocality": "Elampillai",
              "addressRegion": "Tamil Nadu",
              "postalCode": "637502",
              "addressCountry": "IN"
            },
            "telephone": shop.phone,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": shop.rating,
              "bestRating": "5",
              "worstRating": "1"
            }
          }))
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Local Shops</h1>
        {!shops || shops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No shops available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}