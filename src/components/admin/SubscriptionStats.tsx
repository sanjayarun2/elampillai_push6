import React from 'react';
import { Users } from 'lucide-react';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { pushNotificationService } from '../../services/pushNotificationService';

export default function SubscriptionStats() {
  const { data: count, loading, error } = useSupabaseQuery<number>(
    () => pushNotificationService.getSubscriptionCount()
  );

  if (loading) {
    return <div className="text-gray-600">Loading subscription stats...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading subscription stats</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Push Notification Subscribers</h3>
        <div className="flex items-center space-x-2 text-blue-600">
          <Users className="h-6 w-6" />
          <span className="text-2xl font-bold">{count || 0}</span>
        </div>
      </div>
    </div>
  );
}