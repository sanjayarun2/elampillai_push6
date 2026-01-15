import React from 'react';
import { Shop } from '../types';
import { Phone, MapPin, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 p-6 hover:shadow-lg transition-shadow animate-fade-in">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-blue-600 font-semibold">
          <Tag className="w-4 h-4 mr-2" />
          {shop.category}
        </div>
        
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
          <span>{shop.address}</span>
        </div>

        {/* Only show Phone if it exists */}
        {shop.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${shop.phone}`} className="hover:text-blue-600">
              {shop.phone}
            </a>
          </div>
        )}

        {/* FIX: Only show Rating if it exists to prevent .toString() error */}
        {shop.rating !== undefined && (
          <div className="flex items-center text-sm text-yellow-500">
            <Star className="w-4 h-4 mr-2 fill-current" />
            <span>{shop.rating.toString()}</span>
          </div>
        )}
      </div>

      <Link 
        to={`/shops/${shop.slug}`}
        className="block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 rounded-md transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}