import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100 flex flex-col w-full max-w-md mx-auto">
      
      {/* 1. TOP IMAGE SECTION */}
      <div className="relative h-[240px] w-full">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* 2. THE "INSHORTS" BADGE (Overlapping pill) */}
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-10 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">
            inshorts
          </span>
        </div>
      </div>

      {/* 3. CONTENT SECTION */}
      <div className="p-4 pt-5">
        
        {/* Headline */}
        <h2 className="text-[19px] font-bold text-[#2d2d2d] leading-[1.35] mb-3 font-sans">
          {post.title}
        </h2>

        {/* Body Text */}
        <p className="text-[#44444d] text-[15px] leading-[1.6] font-light mb-4 text-justify">
          {post.content}
        </p>

        {/* Footer / Source */}
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-50 pt-3">
          <span>
            read more at <span className="font-bold text-gray-500">The Hawk</span>
          </span>
          <span>{post.date}</span>
        </div>
      </div>

    </div>
  );
}