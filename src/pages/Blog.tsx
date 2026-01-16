import { useState, useEffect } from 'react';
import { ArrowRightCircle } from 'lucide-react'; 
import BlogCard from '../components/BlogCard'; 
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // FIX: Removed unused 'error' state to satisfy TypeScript
  // If you need to show an error UI later, add it back.

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await blogService.getAll();
        setPosts(data || []);
      } catch (err) {
        console.error('Error loading posts:', err);
        // We log the error but don't need to store it if we aren't displaying it
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
    // FIX: Reduced py-4 to py-1 for mobile to start immediately after header
    <div className="relative max-w-[888px] mx-auto px-0 md:px-4 py-1 md:py-8 h-[calc(100vh-64px)] md:h-auto bg-gray-50 md:bg-white">
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
          {/* CONTAINER */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-0 h-full w-full md:flex-col md:gap-6 md:h-auto md:overflow-visible no-scrollbar">
            {posts.map(post => (
              <div key={post.id} className="relative min-w-full w-full snap-center px-2 pt-1 md:px-0 md:pt-0 md:w-auto h-full md:h-auto flex items-start md:block">
                <BlogCard post={post} />
                
                {/* MOBILE SWIPE ARROW ICON (Overlaid on the image area, Top-Right) */}
                <div className="md:hidden absolute top-[15%] right-4 z-50 pointer-events-none animate-pulse text-white/90 drop-shadow-md">
                   <ArrowRightCircle size={32} strokeWidth={1.5} fill="rgba(0,0,0,0.3)" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}