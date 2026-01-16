import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 flex flex-col md:flex-row md:h-[280px] md:mb-6 transition-shadow hover:shadow-md">
      
      {/* 1. IMAGE SECTION */}
      {/* Mobile: Fixed height rectangle. Desktop: Left side fixed width. */}
      <div className="relative h-[240px] w-full md:w-[350px] md:h-full flex-shrink-0">
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

        {/* BADGE: Visible ONLY on Mobile (hidden on desktop) */}
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-10 border border-gray-100 md:hidden">
          <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">
            inshorts
          </span>
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-4 pt-5 md:p-6 flex flex-col justify-between flex-grow">
        <div>
          {/* TITLE: Bold/Compact on Mobile. Light/Large on Desktop (Previous Style) */}
          <h2 className="text-[19px] font-bold text-[#2d2d2d] leading-[1.35] mb-3 font-sans md:text-[22px] md:font-light md:text-[#44444d] md:leading-tight md:mb-2">
            {post.title}
          </h2>

          {/* META: Hidden on Mobile. Visible on Desktop. */}
          <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
            <span className="font-bold text-[#44444d]">short</span> by {post.author || 'Admin'} / {post.date}
          </div>

          {/* BODY: Text justified on mobile, clamped on desktop */}
          <p className="text-[#44444d] text-[15px] leading-[1.6] font-light mb-4 text-justify md:text-[16px] md:leading-[22px] md:text-left md:line-clamp-5">
            {post.content}
          </p>
        </div>

        {/* 3. FOOTER SECTION */}
        <div className="mt-2 text-xs text-gray-400 border-t border-gray-50 pt-3 md:border-none md:pt-0 md:mt-0">
          
          {/* Mobile Footer: Matches Screenshot */}
          <div className="flex items-center justify-between w-full md:hidden">
            <span>
              read more at <span className="font-bold text-gray-500">The Hawk</span>
            </span>
            <span>{post.date}</span>
          </div>

          {/* Desktop Footer: Matches Previous Link Style */}
          <div className="hidden md:block">
            <Link 
              to={`/blog/${post.id}`}
              className="text-[12px] text-[#44444d] font-bold uppercase tracking-wider hover:text-blue-600 transition-colors"
            >
              read more at <span className="underline italic ml-1">Elampillai News</span>
            </Link>
          </div>
        </div>
      </div>

    </article>
  );
}