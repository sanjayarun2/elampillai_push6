import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { blogService } from '../../services/blogService';
import type { BlogPost } from '../../types';

// REMOVED: import { pushNotificationService } ... (File no longer exists)

export function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    image: '',
    author: 'Admin',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await blogService.getAll();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPost(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.content) return;

    try {
      const postToSave = {
        ...currentPost,
        id: currentPost.id || Date.now().toString(), // Simple ID generation
        date: currentPost.date || new Date().toISOString().split('T')[0],
        readTime: '3 min read' // Default
      } as BlogPost;

      if (isEditing) {
        // Update logic (if your blogService supports it)
        // await blogService.update(postToSave); 
        // For now, we might just be re-saving or handling via specific logic
        console.log('Update not fully implemented in demo, saving as new/overwrite');
        await blogService.add(postToSave);
      } else {
        // Create new
        await blogService.add(postToSave);

        // NOTE: Notification logic is disabled because pushNotificationService was removed.
        // To re-enable, you will need a backend function to read from Turso and send web push.
        // console.log('Sending notifications...');
      }

      // Reset and Reload
      setIsEditing(false);
      setCurrentPost({ title: '', content: '', image: '', author: 'Admin', date: new Date().toISOString().split('T')[0] });
      loadPosts();
      alert('Post saved successfully!');

    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await blogService.delete(id);
      loadPosts();
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Edit Blog Post' : 'Create New Post'}
        </h2>
        {isEditing && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setCurrentPost({ title: '', content: '', image: '', author: 'Admin', date: new Date().toISOString().split('T')[0] });
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <X size={18} /> Cancel Edit
          </button>
        )}
      </div>

      {/* EDITOR FORM */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-10">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={currentPost.title}
            onChange={e => setCurrentPost(p => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter post title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={currentPost.content}
            onChange={e => setCurrentPost(p => ({ ...p, content: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
            placeholder="Write your content here..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              value={currentPost.author}
              onChange={e => setCurrentPost(p => ({ ...p, author: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={currentPost.date}
              onChange={e => setCurrentPost(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <div className="flex items-center gap-4">
            <div className="relative overflow-hidden w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          {currentPost.image && (
            <div className="mt-4 w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
              <img src={currentPost.image} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCurrentPost(p => ({ ...p, image: '' }))}
                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <Save size={20} />
          {isEditing ? 'Update Post' : 'Publish Post'}
        </button>
      </form>

      {/* POST LIST */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Posts</h3>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition bg-gray-50">
              <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{post.date} • {post.author}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleEdit(post)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-gray-500 py-4">No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}