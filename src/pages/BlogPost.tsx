import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Trash2 } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { blogService } from '../services/blogService';
import { commentService, Comment } from '../services/commentService';
import type { BlogPost as BlogPostType } from '../types';
import SEOHead from '../components/SEOHead';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import ShareButton from '../components/ui/ShareButton';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: post, loading: postLoading, error: postError } = useSupabaseQuery<BlogPostType>(
    async () => {
      if (!id) {
        navigate('/blog');
        throw new Error('Blog ID is required');
      }
      return blogService.getById(id);
    },
    [id]
  );

  useEffect(() => {
    const loadComments = async () => {
      if (id) {
        try {
          const fetchedComments = await commentService.getComments(id);
          setComments(fetchedComments);
        } catch (err) {
          console.error('Error loading comments:', err);
        }
      }
    };

    loadComments();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim() || !commentAuthor.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const comment = await commentService.addComment(id, commentAuthor, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      setCommentAuthor('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-600 mb-4">
            {postError?.message || 'Error loading blog post'}
          </p>
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/blog/${id}`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.content.substring(0, 155)}
        image={post.image_url} // <--- Make sure this is the news image from Turso
       url={window.location.href} // <--- This provides the slug
        type="article"
        keywords={`${post.title}, Elampillai news, community updates, ${post.author}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.image,
          "articleBody": post.content,
          "datePublished": post.date,
          "dateModified": post.date,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Elampillai Community",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/icon-192x192.png`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        }}
      />

      {/* FIXED: The Portal ensures this floats immediately. Using canonicalUrl variable */}
      <ShareButton
        title={post.title}
        text={`Check out this post: ${post.title}`}
        url={canonicalUrl}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Link 
                to="/blog" 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back to Blog
              </Link>
            </div>

            {post.image && (
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                loading="lazy"
              />
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center space-x-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{post.author}</span>
              </div>
            </div>
            
            <div className="prose max-w-none mb-8">
              <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex justify-between items-center border-t pt-6">
              <WhatsAppButton size="lg" />
            </div>
          </div>
        </article>

        <div className="mt-8 text-center">
          <WhatsAppButton size="lg" showText={true} />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="author"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{comment.author}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}