import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Defensive check to prevent crashes if post data is missing
  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      {/* News Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {/* Category Badge - Professional Style */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
            Local News
          </span>
        </div>
      </div>

      {/* News Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span>{post.author || 'Admin'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
          {post.content}
        </p>
        
        {/* Action Section - Removed WhatsApp, Added Clean Link */}
        <div className="pt-4 border-t border-gray-50 mt-auto">
          <Link 
            to={`/blog/${post.id}`}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm inline-flex items-center group/link"
          >
            Read Full Story 
            <ArrowRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}