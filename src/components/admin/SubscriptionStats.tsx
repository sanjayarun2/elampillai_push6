import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import SubscriptionList from './SubscriptionList';

export default function SubscriptionStats() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const total = await subscriptionService.getCount();
        setCount(total);
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Push Notification Subscribers</h3>
          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            <Users className="h-5 w-5" />
            <span className="text-2xl font-bold">{loading ? '-' : count}</span>
          </div>
        </div>
        <SubscriptionList />
      </div>
    </div>
  );
}