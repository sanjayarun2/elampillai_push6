import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Ensure post exists to prevent crashes
  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col">
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title || 'Blog post image'}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
          {post.title || 'Untitled Post'}
        </h2>
        
        <div className="flex items-center space-x-4 text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{post.date || 'No Date'}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{post.author || 'Admin'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
          {post.content || 'No content available...'}
        </p>
        
        <div className="mt-auto">
          <Link 
            to={`/blog/${post.id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center group"
          >
            Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}