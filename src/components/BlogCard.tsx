import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const postUrl = `${window.location.origin}/blog/${post.id}`;
    const tamilText = `*${post.title}*\n\nதினசரி இளம்பிள்ளை செய்திகளை உடனுக்குடன் தெரிந்து கொள்ள கிளிக் செய்யவும்:\n\n`;
    window.open(`https://wa.me/?text=${encodeURIComponent(tamilText + postUrl)}`, '_blank');
  };

  return (
    /* Changed height to 85vh to ensure 15% space for footer on all mobile screens */
    <article className="bg-white overflow-hidden flex flex-col h-[85vh] w-full max-w-2xl mx-auto shadow-lg">
      
      {/* 1. IMAGE SECTION (Strict 30%) */}
      <div className="h-[30%] w-full flex-shrink-0 bg-gray-100 relative">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION (70%) */}
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
        
        {/* px-1 strictly reduces side margins for maximum width */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pt-3">
          {/* Reduced Title Font to 18px */}
          <h2 className="text-[18px] leading-tight font-bold text-[#2d2d2d] mb-2 px-1">
            {post.title}
          </h2>
          
          {/* Reduced Content Font to 15px */}
          <p className="text-[#44444d] text-[15px] leading-[1.5] font-light text-left whitespace-pre-wrap px-1 pb-16">
            {post.content}
          </p>
        </div>

        {/* Floating WhatsApp Button */}
        <div className="absolute bottom-5 right-3 z-10">
          <button 
            onClick={handleShare}
            className="active:scale-90 transition-transform"
            aria-label="Share"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
              alt="WhatsApp" 
              className="w-11 h-11 drop-shadow-md" 
            />
          </button>
        </div>
      </div>

    </article>
  );
}