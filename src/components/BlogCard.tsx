import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Container - Fixed Height for consistency */}
      <div className="relative h-52 w-full overflow-hidden">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
            News Image
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            Latest
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Meta Data: Date and Author placed at the top of content */}
        <div className="flex items-center gap-3 text-gray-500 text-[11px] mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author || 'Admin'}
          </span>
        </div>

        {/* Title - Important placement and size */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        {/* Excerpt/Content Snippet */}
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-6">
          {post.content}
        </p>
        
        {/* Footer Link - Placement at the very bottom */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link 
            to={`/blog/${post.id}`}
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group/link"
          >
            Read Full Story
            <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}