import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { blogService } from '../services/blogService';
import type { BlogPost as BlogPostType } from '../types';
import SEOHead from '../components/SEOHead';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import ShareButton from '../components/ui/ShareButton';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{postError?.message || 'Error loading blog post'}</p>
        <Link to="/blog" className="text-blue-600 font-semibold">← Return to Blog</Link>
      </div>
    );
  }

  // Generate clean Tamil-to-English transliterated slug for the canonical URL
  const cleanSlug = blogService.generateSlug(post.title);
  const canonicalUrl = `${window.location.origin}/blog/${cleanSlug}?id=${post.id}`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.content.substring(0, 155)}
        image={post.image} 
        url={canonicalUrl}
        type="article"
        author={post.author}
        publishedTime={post.date}
      />

      <ShareButton title={post.title} url={canonicalUrl} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <Link to="/blog" className="text-blue-600 mb-6 inline-block">← Back to Blog</Link>

          {post.image && (
            <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-4 text-gray-500 mb-6 text-sm">
            <Calendar className="h-4 w-4" /> <span>{post.date}</span>
            <User className="h-4 w-4" /> <span>{post.author}</span>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="border-t pt-6 flex justify-center">
            <WhatsAppButton 
              size="lg" 
              url={canonicalUrl} 
              title={post.title}
            />
          </div>
        </article>
      </div>
    </>
  );
}