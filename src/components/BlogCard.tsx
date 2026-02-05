import React from 'react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const postUrl = `${window.location.origin}/blog/${post.id}`;
    const tamilText = `*${post.title}*\n\nதினசரி இளம்பிள்ளை செய்திகளை உடனுக்குடன் தெரிந்து கொள்ள கிளிக் செய்யவும்:\n\n`;
    window.open(`https://wa.me/?text=${encodeURIComponent(tamilText + postUrl)}`, '_blank');
  };

  return (
    <article className="bg-white overflow-hidden flex flex-col h-[calc(100vh-80px)] w-full max-w-2xl mx-auto shadow-lg">
      
      {/* 1. IMAGE SECTION (30%) */}
      <div className="h-[30%] w-full flex-shrink-0 bg-gray-100 relative">
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

      {/* 2. CONTENT SECTION (50%) */}
      <div className="h-[60%] w-full flex flex-col p-5 overflow-hidden relative">
        <h2 className="text-[20px] leading-tight font-bold text-[#2d2d2d] mb-3">
          {post.title}
        </h2>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-[#44444d] text-[16px] leading-[1.6] font-light text-justify whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Floating WhatsApp Button inside Content Area */}
        <div className="absolute bottom-4 right-4 z-10">
          <button 
            onClick={handleShare}
            className="active:scale-90 transition-transform"
            aria-label="Share"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
              alt="WhatsApp" 
              className="w-12 h-12 drop-shadow-lg" 
            />
          </button>
        </div>
      </div>

      {/* 3. AD SPACE SECTION (20%) */}
      <div className="h-[10%] w-full bg-gray-50  flex items-center justify-center">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">
          Advertisement Space
        </span>
        {/* Place your Ad component or script here */}
      </div>

    </article>
  );
}
