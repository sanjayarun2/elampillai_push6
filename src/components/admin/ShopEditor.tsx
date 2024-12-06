import React, { useState } from 'react';
import { shopService } from '../../services/shopService';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import type { Shop } from '../../types';

export function ShopEditor() {
  const { data: shops, loading, error, refetch } = useSupabaseQuery<Shop[]>(
    () => shopService.getAll()
  );
  const [currentShop, setCurrentShop] = useState<Partial<Shop>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop.name?.trim()) return;

    try {
      if (currentShop.id) {
        await shopService.update(currentShop.id, currentShop);
      } else {
        await shopService.create({
          name: currentShop.name,
          description: currentShop.description || '',
          address: currentShop.address || '',
          rating: currentShop.rating || 0,
          category: currentShop.category || 'General',
          phone: currentShop.phone
        });
      }
      setCurrentShop({});
      refetch();
    } catch (error) {
      console.error('Error saving shop:', error);
    }
  };

  const deleteShop = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        await shopService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting shop:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading shops: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={currentShop.name || ''}
              onChange={e => setCurrentShop({ ...currentShop, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={currentShop.category || ''}
              onChange={e => setCurrentShop({ ...currentShop, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={currentShop.phone || ''}
              onChange={e => setCurrentShop({ ...currentShop, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={currentShop.rating || ''}
              onChange={e => setCurrentShop({ ...currentShop, rating: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={currentShop.address || ''}
              onChange={e => setCurrentShop({ ...currentShop, address: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={currentShop.description || ''}
              onChange={e => setCurrentShop({ ...currentShop, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            {currentShop.id ? 'Update Shop' : 'Add Shop'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Existing Shops</h3>
        <div className="space-y-4">
          {shops?.map(shop => (
            <div key={shop.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h4 className="font-medium">{shop.name}</h4>
                <p className="text-sm text-gray-600">{shop.category}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentShop(shop)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteShop(shop.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}