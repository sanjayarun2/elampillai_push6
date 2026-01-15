import shopsData from '../data/shops.json';

export interface Shop {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  slug: string;
}

export const shopService = {
  // Get all 100 shops instantly
  getAllShops: async (): Promise<Shop[]> => {
    return shopsData as Shop[];
  },

  // Get a single shop by its slug (for detail pages)
  getShopBySlug: async (slug: string): Promise<Shop | undefined> => {
    return (shopsData as Shop[]).find(shop => shop.slug === slug);
  },

  // Filter shops by category (e.g., "Grocery")
  getShopsByCategory: async (category: string): Promise<Shop[]> => {
    return (shopsData as Shop[]).filter(shop => shop.category === category);
  }
};