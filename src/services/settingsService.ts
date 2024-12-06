import { supabase } from '../lib/supabase';

interface Settings {
  id: string;
  whatsapp_link: string;
  updated_at: string;
}

export const settingsService = {
  async getSettings(): Promise<Settings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', '1')
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSettings:', error);
      return null;
    }
  },

  async updateSettings(whatsappLink: string): Promise<Settings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({
          whatsapp_link: whatsappLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', '1')
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return null;
    }
  }
};