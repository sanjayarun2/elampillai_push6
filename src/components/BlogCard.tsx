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
    /* MOBILE: Full Screen Height. DESKTOP: Fixed Height. */
    <article className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[280px] w-full transition-shadow hover:shadow-lg">
      
      {/* 1. IMAGE SECTION */}
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
      <div className="relative flex flex-col h-[65%] md:h-full flex-grow bg-white overflow-hidden">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pt-3 px-4 md:p-6 scroll-smooth">
          <div className="relative pb-4">
            {/* TITLE */}
            <h2 className="text-[18px] leading-[1.3] font-bold text-[#2d2d2d] mb-1.5 font-sans md:text-[22px] md:mb-3 md:font-light md:text-[#44444d] md:leading-tight">
              {post.title}
            </h2>

            {/* META (Desktop Only) */}
            <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
               {post.date}
            </div>

            {/* BODY: Fully Justified Text */}
            <p className="text-[#44444d] text-[16px] leading-[1.6] font-light md:text-[18px] md:leading-[1.7] text-justify md:line-clamp-6 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 3. STICKY WHATSAPP BUTTON: Styled as a real floating action button */}
          <div className="sticky bottom-10 float-right z-30 ml-4 mb-2">
              <button 
                onClick={handleShare}
                className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] active:scale-90 transition-all duration-200 border-2 border-white"
                aria-label="Share on WhatsApp"
              >
                {/* Clean Image Icon for WhatsApp */}
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WA" 
                  className="w-8 h-8 brightness-0 invert" 
                />
              </button>
          </div>
        </div>
      </div>

    </article>
  );
}