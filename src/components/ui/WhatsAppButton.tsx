import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface WhatsAppButtonProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function WhatsAppButton({ 
  className = '', 
  showText = true, 
  size = 'md' 
}: WhatsAppButtonProps) {
  const { whatsappLink } = useSettings();

  if (!whatsappLink) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${sizeClasses[size]} bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors active:bg-green-700 ${className}`}
    >
      <MessageCircle className={iconSizes[size]} />
      {showText && (
        <span className="ml-2 whitespace-nowrap">
          <span className="hidden sm:inline">எங்கள் சமூகத்தில் சேரவும் | </span>
          Join Community
        </span>
      )}
    </a>
  );
}