// Removed supabase import to stop connection errors

interface Settings {
  id: string;
  whatsapp_link: string;
  updated_at: string;
}

// Local default settings
const DEFAULT_SETTINGS: Settings = {
  id: '1',
  whatsapp_link: 'https://wa.me/919500554953', // Your primary contact link
  updated_at: new Date().toISOString()
};

export const settingsService = {
  async getSettings(): Promise<Settings | null> {
    try {
      // Returns local data instantly instead of fetching from Supabase
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error in getSettings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(whatsappLink: string): Promise<Settings | null> {
    try {
      // In a local JSON setup, we simulate the update for the current session
      console.log('Local settings updated with:', whatsappLink);
      return {
        ...DEFAULT_SETTINGS,
        whatsapp_link: whatsappLink,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return null;
    }
  }
};