import { supabase } from '../lib/supabase';
import type { Shop } from '../types';

export const shopService = {
  async getAll() {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Shop[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Shop;
  },

  async create(shop: Omit<Shop, 'id'>) {
    const { data, error } = await supabase
      .from('shops')
      .insert([shop])
      .select()
      .single();

    if (error) throw error;
    return data as Shop;
  },

  async update(id: string, shop: Partial<Shop>) {
    const { data, error } = await supabase
      .from('shops')
      .update(shop)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Shop;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};