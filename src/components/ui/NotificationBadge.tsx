
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info } from 'lucide-react';
import { EventType } from '@/services/events/types';
import { useEventListener } from '@/services/events/hooks';
import { cn } from '@/lib/utils';
import { CONNECTION_EVENTS } from '@/services/ConnectionMonitorService';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationBadgeProps {
  className?: string;
  eventTypes?: EventType[];
}

const NOTIFICATION_TIMEOUT = 7000; // 7 seconds

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className,
  eventTypes = ['connection-restored', 'connection-lost', 'bulk-upload-completed', 'call-uploaded', 'sentiment-updated']
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle notification events
  useEventListener('bulk-upload-completed', (data) => {
    addNotification('success', 'Bulk upload completed', `${data.data?.fileCount || ''} files processed`);
  });

  useEventListener('call-uploaded', (data) => {
    addNotification('success', 'Call uploaded', data.data?.filename || 'New call available');
  });

  useEventListener(CONNECTION_EVENTS.LOST, () => {
    addNotification('error', 'Connection lost', 'Working in offline mode');
  });

  useEventListener(CONNECTION_EVENTS.RESTORED, () => {
    addNotification('success', 'Connection restored', 'You are back online');
  });

  useEventListener('sentiment-updated', (data) => {
    addNotification('info', 'Sentiment analysis updated', data.data?.filename || 'Call analysis completed');
  });

  // Add notification with auto-remove after timeout
  const addNotification = (type: NotificationType, message: string, description?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      description,
      createdAt: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    setUnreadCount(count => count + 1);

    // Auto remove after timeout
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, NOTIFICATION_TIMEOUT);
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(count - 1, 0));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllAsRead(); }}
      >
        <Bell className="h-5 w-5" />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-md shadow-lg border dark:border-gray-700 z-50"
          >
            <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              <button
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div>
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "p-3 border-b dark:border-gray-700 last:border-b-0",
                      !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.message}</p>
                        {notification.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.description}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
