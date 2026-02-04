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
    /* MOBILE: Full screen height (h-[calc(100vh-64px)]). DESKTOP: Fixed height (md:h-[280px]). */
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
          <div className="relative">
            {/* TITLE */}
            <h2 className="text-[18px] leading-[1.3] font-bold text-[#2d2d2d] mb-1.5 font-sans md:text-[22px] md:mb-3 md:font-light md:text-[#44444d] md:leading-tight">
              {post.title}
            </h2>

            {/* META (Desktop Only) */}
            <div className="hidden md:block text-[12px] text-[#80808b] mb-3">
               {post.date}
            </div>

            {/* BODY: Fully justified and increased font size */}
            <p className="text-[#44444d] text-[16px] leading-[1.6] font-light md:text-[18px] md:leading-[1.7] text-justify md:line-clamp-6 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 3. STICKY WHATSAPP BUTTON: Latched to bottom-right of scrollable area */}
          <div className="sticky bottom-4 float-right z-20 mt-4 ml-4">
              <button 
                onClick={handleShare}
                className="flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Share on WhatsApp"
              >
                {/* Official WhatsApp Logo SVG with white background circle */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.954 4 4 12.954 4 24C4 27.834 5.076 31.42 6.942 34.468L4.048 43.152L13.012 40.3L16.276 42.446C18.618 43.446 21.24 44 24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 -24 4Z" fill="#25D366"/>
                  <path d="M19.056 14.544C18.708 13.788 18.348 13.776 18.012 13.764C17.724 13.752 17.388 13.752 17.052 13.752C16.716 13.752 16.164 13.884 15.696 14.388C15.228 14.892 13.908 16.128 13.908 18.636C13.908 21.144 15.732 23.568 15.984 23.904C16.236 24.24 19.524 29.316 24.588 31.488C28.796 33.288 29.652 32.928 30.564 32.844C31.476 32.76 33.516 31.644 33.936 30.468C34.356 29.292 34.356 28.284 34.224 28.068C34.092 27.852 33.732 27.732 33.216 27.468C32.7 27.204 30.168 25.956 29.688 25.788C29.208 25.62 28.86 25.536 28.512 26.04C28.164 26.544 27.168 27.732 26.856 28.068C26.544 28.404 26.232 28.44 25.716 28.176C25.2 27.912 23.544 27.372 21.576 25.608C20.04 24.24 19.008 22.548 18.708 22.044C18.408 21.54 18.684 21.264 18.948 21.012C19.188 20.784 19.476 20.4 19.74 20.088C20.004 19.776 20.088 19.56 20.268 19.188C20.448 18.816 20.352 18.492 20.22 18.228C20.088 17.964 19.452 16.38 19.056 14.544Z" fill="white"/>
                </svg>
              </button>
          </div>
        </div>
      </div>

    </article>
  );
}