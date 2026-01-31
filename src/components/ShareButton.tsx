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
    /* Modern floating share button with glassmorphism and gradient */
    <button
      onClick={handleShare}
      className="!fixed !bottom-6 !right-4 sm:!right-6 !z-[9999] group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-full shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-600/60 transition-all duration-300 hover:scale-110 active:scale-95 sm:border-2 sm:border-white/20 backdrop-blur-sm animate-button-pulse"
      aria-label="Share"
    >
      <Share2 className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
    </button>,
    document.body
  );
}