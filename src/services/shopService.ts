import shopsData from '../data/shops.json';
import { githubService } from './githubService';

export interface Shop {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  slug: string;
  hidden?: boolean; // THE FIX: Added hidden property
}

export const shopService = {
  // Public only see visible shops
  getAllShops: async (): Promise<Shop[]> => {
    const all = shopsData as Shop[];
    return all.filter(shop => !shop.hidden);
  },

  // Admin sees everything (including hidden)
  getAdminShops: async (): Promise<Shop[]> => {
    return shopsData as Shop[];
  },

  getShopBySlug: async (slug: string): Promise<Shop | undefined> => {
    return (shopsData as Shop[]).find(shop => shop.slug === slug);
  },

  getShopsByCategory: async (category: string): Promise<Shop[]> => {
    const all = shopsData as Shop[];
    return all.filter(shop => shop.category === category && !shop.hidden);
  },

  updateShops: async (updatedShops: Shop[]): Promise<boolean> => {
    return await githubService.updateJsonFile('src/data/shops.json', updatedShops);
  }
};