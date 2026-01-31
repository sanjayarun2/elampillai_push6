import React from 'react';
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
      // Don't log if the user just cancelled the share sheet
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    /* Changed 'sticky' to 'fixed' and increased z-index to 9999 
       This ensures the button floats in the corner of the screen. */
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={handleShare}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors active:bg-blue-800"
        aria-label="Share"
      >
        <Share2 className="h-5 w-5 mr-2" />
        <span>Share</span>
      </button>
    </div>
  );
}