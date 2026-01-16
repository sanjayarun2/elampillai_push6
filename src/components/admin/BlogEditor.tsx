import React, { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import { pushNotificationService } from '../../services/pushNotificationService';
import type { BlogPost } from '../../types';
import { Bell, Save, Trash2, Edit2, Loader2, AlertCircle, Plus } from 'lucide-react';
import SubscriptionStats from './SubscriptionStats';

export function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [sendingNotification, setSendingNotification] = useState(false);

  // Load posts from Turso SQL on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAll(); // Now calls Turso SQL
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  // 1. LOCAL ADD/UPDATE (No SQL/GitHub call yet)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title?.trim()) return;

    if (currentPost.id) {
      // Update local state
      setPosts(posts.map(p => p.id === currentPost.id ? { ...p, ...currentPost as BlogPost } : p));
    } else {
      // Create local new post
      const newPost: BlogPost = {
        id: crypto.randomUUID(),
        title: currentPost.title,
        content: currentPost.content || '',
        date: new Date().toISOString().split('T')[0],
        author: 'Admin',
        image: currentPost.image || ''
      };
      setPosts([newPost, ...posts]);
    }
    setCurrentPost({});
    setHasUnsavedChanges(true);
  };

  // 2. LOCAL DELETE
  const deleteLocalPost = (id: string) => {
    if (!window.confirm('Delete this post from the local list?')) return;
    setPosts(posts.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  };

  // 3. THE MAIN PUSH (Saves everything to Turso SQL in one go)
  const pushAllChanges = async () => {
    if (!window.confirm(`Push all ${posts.length} posts to the database?`)) return;
    setIsSaving(true);
    try {
      // This will now use your Turso save logic
      const success = await blogService.syncAllPosts(posts);
      if (success) {
        alert('Blog updated in Turso SQL!');
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      alert('Error syncing with database.');
    } finally {
      setIsSaving(false);
    }
  };

  const sendPushNotification = async (post: BlogPost) => {
    try {
      setSendingNotification(true);
      setNotificationStatus('Sending notification...');
      
      // Fetches user tokens from Turso subscriptions table
      const result = await pushNotificationService.sendNotification(post.id, post.title);
      
      if (result.success) {
        setNotificationStatus(`Successfully sent to ${result.totalSent} subscribers!`);
      }
    } catch (error) {
      setNotificationStatus('Error sending notification');
    } finally {
      setSendingNotification(false);
      setTimeout(() => setNotificationStatus(''), 5000);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <SubscriptionStats />

      {/* UNSAVED CHANGES BANNER */}
      {hasUnsavedChanges && (
        <div className="sticky top-4 z-20 bg-blue-50 border-l-4 border-blue-500 p-4 shadow-lg flex justify-between items-center animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center">
            <AlertCircle className="text-blue-500 mr-3" />
            <p className="text-blue-700 font-medium">Post updates ready to sync!</p>
          </div>
          <button
            onClick={pushAllChanges}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            SAVE ALL TO SQL DATABASE
          </button>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> {currentPost.id ? 'Edit Blog' : 'Write New Blog Post'}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Title *"
            value={currentPost.title || ''}
            onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
          <textarea
            placeholder="Blog Content..."
            value={currentPost.content || ''}
            onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            rows={4}
          />
          <input
            type="url"
            placeholder="Image URL"
            value={currentPost.image || ''}
            onChange={e => setCurrentPost({ ...currentPost, image: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {currentPost.id ? 'Apply Edit to List' : 'Add Post to List'}
          </button>
        </div>
      </form>

      {notificationStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {notificationStatus}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Current List ({posts.length})</h3>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{post.title}</h4>
                <p className="text-xs text-gray-500">{post.date} • {post.author}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => sendPushNotification(post)}
                  disabled={sendingNotification}
                  title="Send Push Notification to Subscribers"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                >
                  <Bell className={`h-5 w-5 ${sendingNotification ? 'animate-bounce' : ''}`} />
                </button>
                <button onClick={() => setCurrentPost(post)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteLocalPost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}