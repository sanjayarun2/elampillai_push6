import React, { useState, useEffect } from 'react';
import { shopService, Shop } from '../../services/shopService';
import { Save, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

export function ShopEditor() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentShop, setCurrentShop] = useState<Partial<Shop>>({});

  // Load shops on mount
  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    const data = await shopService.getAllShops();
    setShops(data);
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop.name?.trim()) return;

    let updatedShops: Shop[];

    if (currentShop.id) {
      // Update existing
      updatedShops = shops.map(s => s.id === currentShop.id ? { ...s, ...currentShop as Shop, slug: generateSlug(currentShop.name!) } : s);
    } else {
      // Add new
      const newShop: Shop = {
        id: crypto.randomUUID(),
        name: currentShop.name,
        category: currentShop.category || 'General',
        address: currentShop.address || '',
        phone: currentShop.phone || '',
        slug: generateSlug(currentShop.name)
      };
      updatedShops = [...shops, newShop];
    }

    setIsSaving(true);
    const success = await shopService.updateShops(updatedShops);
    if (success) {
      setShops(updatedShops);
      setCurrentShop({});
      alert('Changes pushed to GitHub successfully!');
    } else {
      alert('Failed to save. Check your VITE_GITHUB_TOKEN.');
    }
    setIsSaving(false);
  };

  const deleteShop = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;

    const updatedShops = shops.filter(s => s.id !== id);
    setIsSaving(true);
    const success = await shopService.updateShops(updatedShops);
    if (success) {
      setShops(updatedShops);
    }
    setIsSaving(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {currentShop.id ? 'Edit Shop' : 'Add New Local Shop'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Name *</label>
            <input
              type="text"
              value={currentShop.name || ''}
              onChange={e => setCurrentShop({ ...currentShop, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g. Nithi Tex"
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
              placeholder="e.g. Textiles"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={currentShop.phone || ''}
              onChange={e => setCurrentShop({ ...currentShop, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={currentShop.address || ''}
              onChange={e => setCurrentShop({ ...currentShop, address: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition"
          >
            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            {currentShop.id ? 'Update and Push' : 'Add and Push to GitHub'}
          </button>
          {currentShop.id && (
            <button
              type="button"
              onClick={() => setCurrentShop({})}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Registered Shops ({shops.length})</h3>
          <p className="text-xs text-gray-500 italic">Changes here will trigger a Vercel rebuild.</p>
        </div>
        
        <div className="grid gap-4">
          {shops.map(shop => (
            <div key={shop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition">
              <div>
                <h4 className="font-bold text-gray-800">{shop.name}</h4>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {shop.category}
                  </span>
                  <span className="text-xs text-gray-500">{shop.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentShop(shop)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteShop(shop.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}