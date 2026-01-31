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
    /* Fixed at bottom-right to be visible from the start on all devices */
    <button
      onClick={handleShare}
      className="!fixed !bottom-6 !right-4 sm:!right-6 !z-[9999] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
      aria-label="Share"
    >
      <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>,
    document.body
  );
}