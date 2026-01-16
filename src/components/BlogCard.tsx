import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[280px] w-full transition-shadow hover:shadow-xl">
      
      {/* 1. IMAGE SECTION */}
      {/* Mobile: Height 35%. Desktop: Fixed width. */}
      <div className="relative h-[35%] md:h-full w-full md:w-[350px] flex-shrink-0 bg-gray-100">
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

      {/* 2. CONTENT SECTION */}
      <div className="p-5 md:p-6 flex flex-col h-[65%] md:h-full justify-start md:justify-between flex-grow overflow-y-auto bg-white">
        <div>
          {/* TITLE */}
          <h2 className="text-[20px] font-bold text-[#2d2d2d] leading-[1.3] mb-3 font-sans md:text-[22px] md:font-light md:text-[#44444d] md:leading-tight">
            {post.title}
          </h2>

          {/* META (Desktop Only) */}
          {/* REMOVED 'Admin' text as requested. Shows only Date. */}
          <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
            <span className="font-bold text-[#44444d]">short</span> / {post.date}
          </div>

          {/* BODY */}
          <p className="text-[#44444d] text-[16px] leading-[1.6] font-light md:text-justify md:text-[16px] md:line-clamp-6">
            {post.content}
          </p>
        </div>

        {/* 3. FOOTER SECTION */}
        {/* COMPLETELY REMOVED 'Read More' link/text for both Mobile and Desktop as requested */}
      </div>

    </article>
  );
}