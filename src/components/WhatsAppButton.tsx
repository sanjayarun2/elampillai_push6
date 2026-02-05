import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface WhatsAppButtonProps {
  className?: string;
  showText?: boolean;
  // Props to handle specific news sharing
  url?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WhatsAppButton({ 
  className = '', 
  showText = true, 
  url, 
  title,
  size = 'md' 
}: WhatsAppButtonProps) {
  const { whatsappLink } = useSettings();

  // If url and title exist, we create a sharing message for that specific post
  // This is what triggers the Image and Title preview on WhatsApp
  const finalHref = (url && title)
    ? `https://wa.me/?text=${encodeURIComponent(`*${title}*\n\nதினசரி இளம்பிள்ளை செய்திகளை உடனுக்குடன் தெரிந்து கொள்ள கிளிக் செய்யவும்:\n\n${url}`)}`
    : whatsappLink;

  // Don't render if there is no link at all
  if (!url && !whatsappLink) return null;

  // Handle dynamic sizing
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg font-bold'
  };

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-all transform active:scale-95 shadow-md hover:shadow-lg ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className={`${size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} shrink-0`} />
      {showText && (
        <span className="ml-2">
          {url ? 'வாட்ஸ்அப்பில் பகிரவும் | Share on WhatsApp' : 'எங்கள் சமூகத்தில் சேரவும் | Join Community'}
        </span>
      )}
    </a>
  );
}