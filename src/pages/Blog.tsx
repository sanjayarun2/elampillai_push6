import React, { useState, useEffect } from 'react';
// FIX 1: Ensure this path is correct. If your file is in src/pages, this is correct.
import BlogCard from '../components/BlogCard'; 
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await blogService.getAll();
        setPosts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

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
        // FIX 2: Added missing required url prop
        url={typeof window !== 'undefined' ? window.location.href : ''} 
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
        <div className="flex flex-col gap-6">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}