import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    /* Changed height to 88vh to ensure 12% space for footer */
    <article className="bg-white overflow-hidden flex flex-col h-[88vh] w-full max-w-2xl mx-auto shadow-lg relative">
      
      {/* 1. IMAGE SECTION (Strict 30%) - Added sticky top-0 and z-10 to prevent sliding behind header */}
      <div className="h-[30%] w-full flex-shrink-0 bg-gray-100 relative sticky top-0 z-10">
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
      <div className="flex-1 w-full flex flex-col overflow-hidden">
        
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
      </div>

    </article>
  );
}