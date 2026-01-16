import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
      {/* Image Container with News Badge */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 text-sm italic">No image available</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Latest News
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Meta info: Date & Author */}
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{post.author || 'Admin'}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        
        {/* Description Snippet */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {post.content}
        </p>
        
        {/* Footer Link */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <Link 
            to={`/blog/${post.id}`}
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors gap-1 group/btn"
          >
            Read Full Story
            <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          <div className="flex items-center text-gray-400 text-[10px]">
            <Clock className="h-3 w-3 mr-1" />
            <span>2 min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}