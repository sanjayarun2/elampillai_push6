import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    /* Changed height to 88vh to ensure 12% space for footer */
    /* FIX: Added id={`post-${post.id}`} so the app can auto-scroll to this specific card when shared */
    <article id={`post-${post.id}`} className="bg-white overflow-hidden flex flex-col h-[88vh] w-full max-w-2xl mx-auto shadow-lg relative">
      
      {/* 1. IMAGE SECTION (Strict 30%) - Fixed mobile sliding by using z-20 and flex-shrink-0 */}
      <div className="h-[30%] w-full flex-shrink-0 bg-gray-100 relative z-20 shadow-sm">
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

      {/* 2. CONTENT SECTION (70%) - Added z-10 to ensure it layers correctly beneath the image section */}
      <div className="flex-1 w-full flex flex-col overflow-hidden relative z-10 bg-white">
        
        {/* px-1 strictly reduces side margins for maximum width */}
        {/* FIX: Added overscroll-contain to isolate scroll momentum and prevent the card from pulling under the header */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pt-3 overscroll-contain">
          {/* Reduced Title Font to 17px per latest request */}
          <h2 className="text-[17px] leading-tight font-bold text-[#2d2d2d] mb-2 px-1">
            {post.title}
          </h2>
          
          {/* Reduced Content Font to 14px per latest request */}
          <p className="text-[#44444d] text-[14px] leading-[1.6] font-light text-left whitespace-pre-wrap px-1 pb-28">
            {post.content}
          </p>
        </div>
      </div>

    </article>
  );
}