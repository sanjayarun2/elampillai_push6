import React from 'react';
import { createPortal } from 'react-dom';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
      } else {
        // Fallback to WhatsApp sharing
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return createPortal(
    /* Floating share button - clean circular design for mobile */
    <button
      onClick={handleShare}
      className="!fixed !bottom-20 !right-4 !z-[9999] flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Share"
    >
      <Share2 className="h-6 w-6" />
    </button>,
    document.body
  );
}