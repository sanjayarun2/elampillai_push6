import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

export function SettingsEditor() {
  const { whatsappLink: currentWhatsappLink, setWhatsappLink, loading } = useSettings();
  const [whatsappLink, setWhatsappLinkState] = useState(currentWhatsappLink);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await setWhatsappLink(whatsappLink);
      setSuccess('WhatsApp link updated successfully!');
    } catch (err) {
      setError('Failed to update WhatsApp link. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Community Link</label>
            <input
              type="url"
              value={whatsappLink}
              onChange={e => setWhatsappLinkState(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm">{success}</div>
          )}
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}