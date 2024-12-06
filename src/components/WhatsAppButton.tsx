import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface WhatsAppButtonProps {
  className?: string;
  showText?: boolean;
}

export default function WhatsAppButton({ className = '', showText = true }: WhatsAppButtonProps) {
  const { whatsappLink } = useSettings();

  if (!whatsappLink) return null;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors active:bg-green-700 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      {showText && (
        <span className="ml-2">எங்கள் சமூகத்தில் சேரவும் | Join Community</span>
      )}
    </a>
  );
}