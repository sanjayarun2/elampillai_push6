import React from 'react';
import { Users } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { pushNotificationService } from '../services/pushNotificationService';

export default function SubscriptionCount() {
  const { data: count, loading, error } = useSupabaseQuery<number>(
    () => pushNotificationService.getSubscriptionCount()
  );

  if (loading || error || !count) return null;

  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <Users className="h-5 w-5" />
      <span>{count} subscribers</span>
    </div>
  );
}