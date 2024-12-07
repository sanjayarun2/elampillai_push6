import React, { useState } from 'react';
import { blogService } from '../../services/blogService';
import { pushNotificationService } from '../../services/pushNotificationService';
import type { BlogPost } from '../../types';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { Bell } from 'lucide-react';
import SubscriptionStats from './SubscriptionStats';

export function BlogEditor() {
  const { data: posts, loading, error, refetch } = useSupabaseQuery<BlogPost[]>(
    () => blogService.getAll()
  );
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title?.trim()) return;

    try {
      if (currentPost.id) {
        await blogService.update(currentPost.id, currentPost);
      } else {
        await blogService.create({
          title: currentPost.title,
          content: currentPost.content || '',
          date: new Date().toISOString().split('T')[0],
          author: 'Admin',
          image: currentPost.image
        });
      }
      setCurrentPost({});
      refetch();
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  };

  const deletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  const sendPushNotification = async (post: BlogPost) => {
    try {
      setSendingNotification(true);
      setNotificationStatus('Sending notification...');
      const result = await pushNotificationService.sendNotification(post.id, post.title);
      
      if (result.success) {
        setNotificationStatus('Notification sent successfully!');
        // Show a notification to the admin as confirmation
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Notification Sent', {
            body: `Successfully sent notification for: ${post.title}`,
            icon: '/icon-192x192.png',
            tag: 'admin-notification',
            vibrate: [200, 100, 200]
          });
        }
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setNotificationStatus(error instanceof Error ? error.message : 'Error sending notification');
    } finally {
      setSendingNotification(false);
      setTimeout(() => setNotificationStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubscriptionStats />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={currentPost.title || ''}
              onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={currentPost.content || ''}
              onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={currentPost.image || ''}
              onChange={e => setCurrentPost({ ...currentPost, image: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
          >
            {currentPost.id ? 'Update Post' : 'Add Post'}
          </button>
        </div>
      </form>

      {notificationStatus && (
        <div className={`${
          notificationStatus.includes('Error') ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
        } px-4 py-3 rounded relative border animate-fade-in`}>
          {notificationStatus}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Existing Posts</h3>
        <div className="space-y-4">
          {posts?.map(post => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded hover:border-blue-500 transition-colors duration-200">
              <div>
                <h4 className="font-medium">{post.title}</h4>
                <p className="text-sm text-gray-600">{post.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPost(post)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => sendPushNotification(post)}
                  disabled={sendingNotification}
                  className={`inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors ${sendingNotification ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Bell className={`h-5 w-5 ${sendingNotification ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No posts yet. Create your first post above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}