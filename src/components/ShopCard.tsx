import { Shop } from '../types';
import { Phone, MapPin, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShopCard({ shop }: { shop: Shop }) {
  // 1. DATA GUARD: If shop or slug is missing, return null.
  // This prevents the "Blank Page" error if your JSON is incomplete.
  if (!shop || !shop.slug) {
    console.error("ShopCard received invalid shop data:", shop);
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 p-6 hover:shadow-lg transition-shadow animate-fade-in">
      {/* Shop Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
      
      <div className="space-y-2 mb-4">
        {/* Category */}
        <div className="flex items-center text-sm text-blue-600 font-semibold">
          <Tag className="w-4 h-4 mr-2" />
          {shop.category}
        </div>
        
        {/* Address */}
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
          <span className="line-clamp-2">{shop.address}</span>
        </div>

        {/* Phone: Only show if it exists in JSON */}
        {shop.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <a 
              href={`tel:${shop.phone}`} 
              className="hover:text-blue-600 transition-colors"
            >
              {shop.phone}
            </a>
          </div>
        )}

        {/* Rating: Safe check and formatted to 1 decimal place */}
        {shop.rating !== undefined && shop.rating !== null && (
          <div className="flex items-center text-sm text-yellow-500">
            <Star className="w-4 h-4 mr-2 fill-current" />
            <span>{Number(shop.rating).toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Action Link: Uses the slug for SEO-friendly routing */}
      <Link 
        to={`/shops/${shop.slug}`}
        className="block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 rounded-md transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}