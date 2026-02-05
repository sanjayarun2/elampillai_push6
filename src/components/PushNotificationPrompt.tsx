import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { permission, loading, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Logic remains exactly as you provided
    if (!loading && permission === 'default' && !sessionStorage.getItem('hidePushPrompt')) {
      const timer = setTimeout(() => setShowPrompt(true), 3000); // Delay 3s
      return () => clearTimeout(timer);
    }
  }, [loading, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    sessionStorage.setItem('hidePushPrompt', 'true'); // Don't show again this session
  };

  if (!showPrompt) return null;

  return (
    /* This wrapper ensures the prompt is exactly in the center of the screen */
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>

          {/* Tamil Content for Elampillai News */}
          <h3 className="font-bold text-xl text-gray-900 leading-tight">
            இளம்பிள்ளை செய்திகள்
          </h3>
          
          <p className="text-gray-600 mt-2 mb-6">
            தினசரி இளம்பிள்ளை செய்திகளை உடனுக்குடன் தெரிந்து கொள்ள 'Allow' கிளிக் செய்யவும்.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleEnable}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold text-lg transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              அனுமதி (Allow)
            </button>
            <button
              onClick={handleClose}
              className="w-full text-gray-500 py-2 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              பிறகு பார்க்கலாம் (Later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}