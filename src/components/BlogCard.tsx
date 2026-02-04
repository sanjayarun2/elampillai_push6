import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  index?: number; // Added index to prioritize the first card
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  if (!post) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const text = `${post.title} - Read more on Elampillai News`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  return (
    <article className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-135px)] md:h-[280px] w-full transition-shadow hover:shadow-lg">
      
      {/* 1. IMAGE SECTION */}
      <div className="relative h-[35%] md:h-full w-full md:w-[350px] flex-shrink-0 bg-gray-200">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            /* PERFORMANCE FIX: Priority for the first card, Lazy load for others */
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            /* Help browser prioritize the main image */
            fetchPriority={index === 0 ? "high" : "low"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="relative flex flex-col h-[65%] md:h-full flex-grow bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-3 px-4 md:p-6 scroll-smooth">
          <div className="relative pb-4">
            <h2 className="text-[18px] leading-[1.3] font-bold text-[#2d2d2d] mb-1.5 font-sans md:text-[22px] md:mb-3 md:font-light md:text-[#44444d] md:leading-tight">
              {post.title}
            </h2>

            <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
               {post.date}
            </div>

            <p className="text-[#44444d] text-[16px] leading-[1.6] font-light md:text-[18px] md:leading-[1.7] text-justify md:line-clamp-6 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 3. STICKY WHATSAPP BUTTON */}
          <div className="sticky bottom-6 float-right z-30 ml-4 mb-2">
              <button 
                onClick={handleShare}
                className="flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Share on WhatsApp"
              >
                {/* PERFORMANCE TIP: Using a local SVG or a base64 string here would be even faster than an external URL */}
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WhatsApp" 
                  className="w-12 h-12 block drop-shadow-md" 
                />
              </button>
          </div>
        </div>
      </div>
    </article>
  );
}