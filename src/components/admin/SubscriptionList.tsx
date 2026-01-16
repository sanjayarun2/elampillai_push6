import React, { useEffect, useState } from 'react';
import { subscriptionService, type Subscription } from '../../services/subscriptionService';
import { Trash2, RefreshCw } from 'lucide-react';

export default function SubscriptionList() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubs();
  }, []);

  async function loadSubs() {
    setLoading(true);
    try {
      const data = await subscriptionService.getAll();
      // Client-side deduping just in case legacy bad data exists
      const uniqueData = Array.from(new Map(data.map(item => [item.endpoint, item])).values());
      setSubs(uniqueData);
    } catch (error) {
      console.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('Delete this subscriber?')) {
      const success = await subscriptionService.delete(id);
      if (success) {
        setSubs(prev => prev.filter(s => s.id !== id));
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Subscribers List</h3>
        <button onClick={loadSubs} className="text-gray-500 hover:text-blue-600 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subs.map((sub, index) => (
              <tr key={sub.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">#{sub.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(sub.id)} 
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}