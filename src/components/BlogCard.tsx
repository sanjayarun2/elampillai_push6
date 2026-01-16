import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) return null;

  return (
    <article className="bg-white rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.16)] overflow-hidden mb-6 flex flex-col md:flex-row h-auto md:h-[280px]">
      
      {/* 1. IMAGE: Fixed width on desktop to match Inshorts aspect ratio */}
      <div className="md:w-[40%] lg:w-[350px] h-60 md:h-full flex-shrink-0">
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

      {/* 2. CONTENT: Large padding and clean typography */}
      <div className="p-4 md:p-6 flex flex-col justify-between flex-grow">
        <div>
          {/* Title: Bold and tight */}
          <h2 className="text-[18px] md:text-[22px] font-light text-[#44444d] leading-tight mb-2">
            {post.title}
          </h2>

          {/* Meta: Inshorts signature author/date style */}
          <div className="text-[12px] text-[#80808b] mb-3">
            <span className="font-bold text-[#44444d]">short</span> by {post.author || 'Admin'} / {post.date}
          </div>
          
          {/* Excerpt: Max height to keep card size stable */}
          <p className="text-[#44444d] text-[15px] md:text-[16px] leading-[22px] font-light line-clamp-4 md:line-clamp-5">
            {post.content}
          </p>
        </div>
        
        {/* 3. FOOTER: Only the link, no buttons */}
        <div className="mt-4 md:mt-0">
          <Link 
            to={`/blog/${post.id}`}
            className="text-[12px] text-[#44444d] font-bold uppercase tracking-wider hover:text-blue-600 transition-colors"
          >
            read more at <span className="underline italic ml-1">Elampillai News</span>
          </Link>
        </div>
      </div>
    </article>
  );
}