import React from 'react';
import BlogCard from '../components/BlogCard';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';

export default function Blog() {
  const { data: posts, loading, error } = useSupabaseQuery<BlogPost[]>(
    () => blogService.getAll()
  );

  if (loading) {
    return (
      <div className="max-w-[888px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">News & Updates</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[888px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">News & Updates</h1>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[888px] mx-auto px-4 py-8">
      <SEOHead 
        title="News & Updates - Elampillai City Portal" 
        description="Stay updated with the latest news, events, and announcements from Elampillai."
      />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-100 pb-4 inline-block">
          News & Updates
        </h1>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No posts available yet.</p>
        </div>
      ) : (
        /* Removed the 3-column grid to allow Inshorts horizontal cards to stack properly */
        <div className="flex flex-col gap-6">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}