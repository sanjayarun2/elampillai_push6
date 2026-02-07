import { useState, useEffect } from 'react';
import { ArrowRightCircle } from 'lucide-react'; 
import BlogCard from '../components/BlogCard'; 
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import SEOHead from '../components/SEOHead';

const INITIAL_LOAD_COUNT = 10; // Load only 10 posts initially for faster loading

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD_COUNT);
  const [error, setError] = useState<string | null>(null);
  // FIX: Track active post for dynamic SEO metadata
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const data = await blogService.getAll();
        // Ensure we always have an array
        const postsData = Array.isArray(data) ? data : [];
        setPosts(postsData);
        
        // FIX: Prioritize setting active post from URL query (?id=) then fallback to hash for social media crawlers
        const urlParams = new URLSearchParams(window.location.search);
        const postIdFromQuery = urlParams.get('id');
        const hash = window.location.hash;
        
        // Source of truth: Query param first, then hash fragment
        const targetId = postIdFromQuery || (hash.startsWith('#post-') ? hash.replace('#post-', '') : null);
        
        if (targetId) {
          const foundPost = postsData.find(p => p.id === targetId);
          if (foundPost) {
            setActivePost(foundPost);
          } else if (postsData.length > 0) {
            setActivePost(postsData[0]);
          }
        } else if (postsData.length > 0) {
          setActivePost(postsData[0]);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // FIX: Added Effect to auto-scroll to a specific post if the URL contains a hash (e.g., #post-123)
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        // Timeout ensures the DOM is fully rendered before jumping
        setTimeout(() => {
          const targetElement = document.querySelector(hash);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            // Set scrolled post as active SEO target
            const postId = hash.replace('#post-', '');
            const foundPost = posts.find(p => p.id === postId);
            if (foundPost) setActivePost(foundPost);
          }
        }, 100);
      }
    }
  }, [loading, posts]);

  // Shared share logic for the fixed mobile button
  const handleShare = (post: BlogPost) => {
    // Update SEO head immediately before opening WhatsApp
    setActivePost(post);

    // 1. Create a readable slug for visual appeal in the text
    const readableSlug = post.title
      .replace(/[^\u0B80-\u0BFFa-zA-Z0-9 ]/g, '') 
      .trim()
      .replace(/\s+/g, '-');
      
    // 2. Construct URL
    // FIX: Pointing to '/blog' path directly to prevent Router 404s while keeping id/hash for data/scrolling.
    const postUrl = `${window.location.origin}/blog?id=${post.id}#post-${post.id}`;
    
    // 3. Construct the message with bold title and the slug text for visual appeal
    const message = `*${post.title}*\n\nRead more: ${postUrl}`;
    
    // 4. Encode the final message for the wa.me link
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-[888px] mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show only a limited number of posts initially
  const displayedPosts = posts.slice(0, displayCount);
  const hasMore = posts.length > displayCount;

  return (
    // FIX: Added touch-none (mobile) and overscroll-none to lock the card position against the header
    <div className="relative max-w-[888px] mx-auto px-0 md:px-4 py-1 pb-[12vh] md:py-8 h-[calc(100vh-64px)] md:h-auto bg-gray-50 md:bg-white overflow-hidden overscroll-none touch-none md:touch-auto">
      {/* FIX: Dynamically update SEOHead based on active post */}
      <SEOHead 
        title={activePost ? activePost.title : "News & Updates - Elampillai"} 
        description={activePost ? activePost.content.substring(0, 150) : "Stay updated with the latest news from Elampillai."}
        image={activePost?.image}
        url={typeof window !== 'undefined' ? window.location.href : ''} 
      />
      
      <div className="hidden md:block mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">News & Updates</h1>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 italic">
          No news updates available.
        </div>
      ) : (
        <>
          {/* CONTAINER */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-0 h-full w-full md:flex-col md:gap-6 md:h-auto md:overflow-visible no-scrollbar overscroll-x-none touch-pan-x">
            {displayedPosts.map(post => (
              <div key={post.id} id={`post-${post.id}`} className="relative min-w-full w-full snap-center px-2 pt-1 md:px-0 md:pt-0 md:w-auto h-full md:h-auto flex items-stretch md:block">
                <BlogCard post={post} />
                
                {/* MOBILE FIXED WHATSAPP BUTTON (Pinned to viewport bottom right, clearing footer) */}
                <div className="md:hidden absolute bottom-6 right-4 z-[60]">
                  <button 
                    onClick={() => handleShare(post)}
                    className="active:scale-90 transition-transform"
                    aria-label="Share"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                      alt="WhatsApp" 
                      className="w-11 h-11 drop-shadow-md" 
                    />
                  </button>
                </div>

                {/* MOBILE SWIPE ARROW ICON (Overlaid on the image area, Top-Right) */}
                <div className="md:hidden absolute top-[15%] right-4 z-50 pointer-events-none animate-pulse text-white/90 drop-shadow-md">
                    <ArrowRightCircle size={32} strokeWidth={1.5} fill="rgba(0,0,0,0.3)" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button for desktop */}
          {hasMore && (
            <div className="hidden md:flex justify-center mt-8">
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label={`Load 10 more posts (${posts.length - displayCount} remaining)`}
              >
                Load More Posts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}