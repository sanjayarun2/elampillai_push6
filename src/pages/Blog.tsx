import { useState, useEffect } from 'react'; // Removed unused 'React' to fix warning

// USE ../ TO GO UP FROM 'PAGES' TO 'COMPONENTS'
import BlogCard from '../components/BlogCard'; 
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await blogService.getAll();
        setPosts(data || []);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load news. Please check your database connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[888px] mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[888px] mx-auto px-4 py-8">
      <SEOHead 
        title="News & Updates - Elampillai" 
        description="Stay updated with the latest news from Elampillai."
        // Safe check for window to prevent build crashes
        url={typeof window !== 'undefined' ? window.location.href : ''} 
      />
      
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">News & Updates</h1>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 italic">
          No news updates available at the moment.
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