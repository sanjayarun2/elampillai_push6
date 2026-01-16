import React, { useState, useEffect } from 'react';
import { shopService, Shop } from '../../services/shopService';
import { Save, Trash2, Edit2, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function ShopEditor() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track changes
  const [currentShop, setCurrentShop] = useState<Partial<Shop>>({});

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    const data = await shopService.getAdminShops();
    setShops(data);
    setLoading(false);
    setHasUnsavedChanges(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  // 1. LOCAL TOGGLE (No GitHub Push)
  const toggleHide = (id: string) => {
    setShops(shops.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s));
    setHasUnsavedChanges(true);
  };

  // 2. LOCAL DELETE (No GitHub Push)
  const deleteShop = (id: string) => {
    if (!window.confirm('Delete this shop from the list?')) return;
    setShops(shops.filter(s => s.id !== id));
    setHasUnsavedChanges(true);
  };

  // 3. LOCAL ADD/UPDATE (No GitHub Push)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShop.name?.trim()) return;

    if (currentShop.id) {
      setShops(shops.map(s => s.id === currentShop.id ? { ...s, ...currentShop as Shop, slug: generateSlug(currentShop.name!) } : s));
    } else {
      const newShop: Shop = {
        id: crypto.randomUUID(),
        name: currentShop.name,
        category: currentShop.category || 'General',
        address: currentShop.address || '',
        phone: currentShop.phone || '',
        slug: generateSlug(currentShop.name),
        hidden: false
      };
      setShops([...shops, newShop]);
    }
    setCurrentShop({});
    setHasUnsavedChanges(true);
  };

  // 4. THE ONLY GITHUB PUSH FUNCTION
  const pushToGithub = async () => {
    if (!window.confirm(`Push ${shops.length} shops to live site? This will trigger a rebuild.`)) return;
    
    setIsSaving(true);
    const success = await shopService.updateShops(shops);
    if (success) {
      alert('Successfully pushed to GitHub!');
      setHasUnsavedChanges(false);
    } else {
      alert('Error pushing to GitHub. Check your Token.');
    }
    setIsSaving(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>;

  return (
    <div className="space-y-6">
      {/* GLOBAL SAVE BUTTON */}
      {hasUnsavedChanges && (
        <div className="sticky top-4 z-10 bg-amber-50 border-l-4 border-amber-400 p-4 shadow-lg flex justify-between items-center animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center">
            <AlertCircle className="text-amber-400 mr-3" />
            <p className="text-amber-700 font-medium">You have unsaved changes!</p>
          </div>
          <button
            onClick={pushToGithub}
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            PUSH ALL CHANGES TO GITHUB
          </button>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">{currentShop.id ? 'Edit Shop' : 'Add New Shop'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Shop Name"
            value={currentShop.name || ''}
            onChange={e => setCurrentShop({ ...currentShop, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={currentShop.category || ''}
            onChange={e => setCurrentShop({ ...currentShop, category: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={currentShop.phone || ''}
            onChange={e => setCurrentShop({ ...currentShop, phone: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={currentShop.address || ''}
            onChange={e => setCurrentShop({ ...currentShop, address: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          {currentShop.id ? 'Apply Edit to List' : 'Add to List'}
        </button>
      </form>

      {/* List Section */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Local List ({shops.length} shops)</h3>
        <div className="grid gap-4">
          {shops.map(shop => (
            <div key={shop.id} className={`flex items-center justify-between p-4 rounded border ${shop.hidden ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
              <div>
                <h4 className="font-bold">{shop.name} {shop.hidden && '(Hidden)'}</h4>
                <p className="text-xs text-gray-500">{shop.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleHide(shop.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  {shop.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={() => setCurrentShop(shop)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteShop(shop.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}