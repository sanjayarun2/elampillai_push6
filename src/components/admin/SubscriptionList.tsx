import React, { useState, useEffect } from 'react';
// FIX: Go up 2 levels (../../) to find 'types' in src/
import type { BlogPost } from '../../types';
// FIX: Go up 2 levels (../../) to find 'services' in src/
import { blogService } from '../../services/blogService';
// FIX: Go up 1 level (../) to find 'SEOHead' in src/components/
import SEOHead from '../SEOHead';
// FIX: Go up 1 level (../) to find 'BlogCard' in src/components/
import BlogCard from '../BlogCard';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await blogService.getAll();
        setPosts(data);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load news.');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading news...</div>;

  return (
    <div className="max-w-[888px] mx-auto px-4 py-8">
      <SEOHead 
        title="News & Updates - Elampillai" 
        description="Stay updated with the latest news from Elampillai."
        url={typeof window !== 'undefined' ? window.location.href : ''} 
      />
      
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">News & Updates</h1>
      </div>

      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}