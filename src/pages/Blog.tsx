import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
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
        setError('Failed to load news.');
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
    <div className="relative max-w-[888px] mx-auto px-0 md:px-4 py-4 md:py-8 h-[calc(100vh-64px)] md:h-auto bg-gray-50 md:bg-white">
      <SEOHead 
        title="News & Updates - Elampillai" 
        description="Stay updated with the latest news from Elampillai."
        url={typeof window !== 'undefined' ? window.location.href : ''} 
      />
      
      <div className="hidden md:block mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">News & Updates</h1>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 italic">
          No news updates available.
        </div>
      ) : (
        <>
          {/* MOBILE: Horizontal Scroll. DESKTOP: Vertical Stack. */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-0 h-full w-full md:flex-col md:gap-6 md:h-auto md:overflow-visible no-scrollbar">
            {posts.map(post => (
              <div key={post.id} className="min-w-full w-full snap-center px-4 md:px-0 md:w-auto h-full md:h-auto flex items-center md:block">
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {/* SWIPE INDICATOR (Mobile Only) */}
          <div className="md:hidden absolute bottom-6 right-6 z-50 pointer-events-none animate-pulse">
            <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
              <span>Swipe</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}