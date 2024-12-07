import React from 'react';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { pushNotificationService } from '../../services/pushNotificationService';

interface Subscription {
  id: string;
  endpoint: string;
  created_at: string;
  last_used: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export default function SubscriptionList() {
  const { data: subscriptions, loading, error } = useSupabaseQuery<Subscription[]>(
    () => pushNotificationService.getAllSubscriptionsWithDetails()
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">
        Error loading subscriptions: {error.message}
      </div>
    );
  }

  if (!subscriptions?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active subscriptions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Device Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subscribed
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {sub.user_agent || 'Unknown Device'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sub.ip_address || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(sub.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sub.last_used 
                  ? new Date(sub.last_used).toLocaleDateString()
                  : 'Never'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}