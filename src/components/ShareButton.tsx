import React from 'react';
import { createPortal } from 'react-dom'; // Import Portal
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

  // createPortal moves the button to the end of <body> so it's truly fixed
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
      <button
        onClick={handleShare}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-2xl hover:bg-blue-700 transition-colors active:bg-blue-800"
        aria-label="Share"
      >
        <Share2 className="h-5 w-5 mr-2" />
        <span className="font-semibold">Share</span>
      </button>
    </div>,
    document.body
  );
}