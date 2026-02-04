import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const text = `${post.title} - Read more on Elampillai News`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  return (
    /* FIXED: Mobile height changed to h-[calc(100vh-64px)] to reach the bottom of the phone. Desktop stays md:h-[280px] */
    <article className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[280px] w-full transition-shadow hover:shadow-lg">
      
      {/* 1. IMAGE SECTION */}
      {/* Mobile: Height 35%. Desktop: Fixed width 350px. */}
      <div className="relative h-[35%] md:h-full w-full md:w-[350px] flex-shrink-0 bg-gray-50">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="relative flex flex-col h-[65%] md:h-full flex-grow bg-white">
        {/* Scrollable content area - stops before share button */}
        <div className="flex-1 overflow-y-auto pt-3 px-4 md:p-6">
          <div className="pb-2 md:pb-20">
            {/* TITLE: InShorts style header */}
            <h2 className="text-[18px] leading-[1.3] font-bold text-[#2d2d2d] mb-1.5 font-sans md:text-[22px] md:mb-3 md:font-light md:text-[#44444d] md:leading-tight">
              {post.title}
            </h2>

            {/* META (Desktop Only) */}
            <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
               {post.date}
            </div>

            {/* BODY: Fully justified (text-justify) and increased font sizes */}
            <p className="text-[#44444d] text-[15px] leading-[1.5] font-light md:text-[18px] md:leading-[1.6] text-justify md:line-clamp-6 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* 3. FOOTER / SHARE SECTION */}
        {/* Mobile: Fixed at bottom. Desktop: Sticky within content */}
        <div className="flex-none md:sticky bottom-0 pt-2.5 pb-3 px-4 md:pt-3 md:pb-2 flex justify-end items-end w-full bg-white/95 backdrop-blur-sm border-t border-gray-100">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 active:opacity-70 transition-opacity"
            >
              <span className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">Share</span>
              {/* WhatsApp Logo SVG */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 2.135.882 3.803.882 3.182 0 5.769-2.586 5.769-5.766.001-3.18-2.584-5.766-5.766-5.766zm9.069 5.766c0 5.004-4.068 9.071-9.069 9.071-1.612 0-3.137-.417-4.48-1.139l-4.997 1.311 1.336-4.871c-.783-1.373-1.229-2.96-1.23-4.379 0-5.002 4.069-9.068 9.071-9.068 5.001 0 9.069 4.067 9.069 9.068z"/>
              </svg>
            </button>
        </div>
      </div>

    </article>
  );
}