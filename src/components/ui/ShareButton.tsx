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
    /* Fixed at top-right to be visible from the start on all devices */
    <button
      onClick={handleShare}
      className="!fixed !top-20 !right-4 sm:!right-6 !z-[9999] inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
      aria-label="Share"
    >
      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
      <span className="font-semibold hidden sm:inline">Share</span>
    </button>,
    document.body
  );
}