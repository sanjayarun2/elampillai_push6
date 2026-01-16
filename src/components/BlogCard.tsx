import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-6 flex flex-col md:flex-row">
      {/* 1. Left Side: Image (Inshorts Style - Large & Square/Rect) */}
      <div className="md:w-2/5 lg:w-1/3 h-64 md:h-auto overflow-hidden">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* 2. Right Side: Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        {/* Title: Bold and Professional */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 leading-tight">
          {post.title}
        </h2>

        {/* Short Meta Info (Similar to "Short by Author / Date") */}
        <div className="flex items-center text-[13px] text-gray-500 mb-4">
          <span className="font-bold text-gray-700 mr-2">short</span>
          <span className="flex items-center">
            by {post.author || 'Admin'} / {post.date}
          </span>
        </div>
        
        {/* Main Content Snippet */}
        <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">
          {post.content}
        </p>
        
        {/* 3. Bottom Link (No Buttons, Just Text) */}
        <div className="mt-auto">
          <Link 
            to={`/blog/${post.id}`}
            className="text-sm font-bold text-gray-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            read more at <span className="underline italic">Elampillai News</span>
          </Link>
        </div>
      </div>
    </article>
  );
}