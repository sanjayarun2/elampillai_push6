import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

interface SettingsContextType {
  whatsappLink: string;
  setWhatsappLink: (link: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const SettingsContext = createContext<SettingsContextType>({
  whatsappLink: '',
  setWhatsappLink: async () => {},
  loading: true,
  error: null
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [whatsappLink, setWhatsappLinkState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await settingsService.getSettings();
        if (mounted) {
          setWhatsappLinkState(settings.whatsapp_link || '');
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading settings:', err);
          setError(err instanceof Error ? err : new Error('Failed to load settings'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const setWhatsappLink = async (link: string) => {
    try {
      setLoading(true);
      const settings = await settingsService.updateSettings(link);
      setWhatsappLinkState(settings.whatsapp_link);
      setError(null);
    } catch (err) {
      console.error('Error updating WhatsApp link:', err);
      setError(err instanceof Error ? err : new Error('Failed to update WhatsApp link'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ whatsappLink, setWhatsappLink, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);