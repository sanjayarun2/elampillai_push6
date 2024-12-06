import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // Check if settings table exists and has data
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', '1')
      .maybeSingle();

    if (!settings && !settingsError) {
      // Settings don't exist, create them
      const { error: insertError } = await supabase
        .from('settings')
        .upsert([
          {
            id: '1',
            whatsapp_link: '',
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'id'
        });

      if (insertError) {
        console.error('Error initializing settings:', insertError);
      }
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}