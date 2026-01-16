import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[280px] w-full transition-shadow hover:shadow-md">
      
      {/* 1. IMAGE SECTION */}
      {/* Mobile: Height reduced to 35%. Desktop: Fixed width 350px on left. */}
      <div className="relative h-[35%] md:h-full w-full md:w-[350px] flex-shrink-0">
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
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-5 md:p-6 flex flex-col h-[65%] md:h-full justify-start md:justify-between flex-grow overflow-y-auto">
        <div>
          {/* TITLE */}
          <h2 className="text-[20px] font-bold text-[#2d2d2d] leading-[1.3] mb-3 font-sans md:text-[22px] md:font-light md:text-[#44444d] md:leading-tight">
            {post.title}
          </h2>

          {/* META (Desktop Only) */}
          <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
            <span className="font-bold text-[#44444d]">short</span> by {post.author || 'Admin'} / {post.date}
          </div>

          {/* BODY */}
          <p className="text-[#44444d] text-[16px] leading-[1.6] font-light md:text-justify md:text-[16px] md:line-clamp-5">
            {post.content}
          </p>
        </div>

        {/* 3. FOOTER SECTION */}
        {/* Hidden on Mobile. Visible on Desktop. */}
        <div className="hidden md:block mt-2 border-t border-gray-50 pt-3 md:border-none md:pt-0">
          <div className="text-[12px] text-[#44444d] font-bold uppercase tracking-wider">
            read more at <span className="underline italic ml-1 cursor-default">Elampillai News</span>
          </div>
        </div>
      </div>

    </article>
  );
}