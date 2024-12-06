import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import type { Product } from '../../types';

export function MarketplaceEditor() {
  const [products, setProducts] = useState<Product[]>(() => 
    storage.get('products', [])
  );
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    storage.set('products', products);
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name?.trim()) return;

    if (currentProduct.id) {
      setProducts(products.map(product => 
        product.id === currentProduct.id ? { ...product, ...currentProduct } : product
      ));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: currentProduct.name,
        description: currentProduct.description || '',
        price: currentProduct.price || 0,
        seller: currentProduct.seller || '',
        whatsappLink: currentProduct.whatsappLink || '',
        image: currentProduct.image || '',
        category: currentProduct.category || 'General'
      };
      setProducts([...products, newProduct]);
    }
    setCurrentProduct({});
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name *</label>
            <input
              type="text"
              value={currentProduct.name || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={currentProduct.category || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              value={currentProduct.price || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Seller Name</label>
            <input
              type="text"
              value={currentProduct.seller || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, seller: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Link</label>
            <input
              type="url"
              value={currentProduct.whatsappLink || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, whatsappLink: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={currentProduct.image || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={currentProduct.description || ''}
              onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              {currentProduct.id ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Existing Products</h3>
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentProduct(product)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
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