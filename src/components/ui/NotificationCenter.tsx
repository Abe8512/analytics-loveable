
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New call transcript ready',
      description: 'A new call has been transcribed and analyzed.',
      read: false,
      time: '10 minutes ago'
    },
    {
      id: 2,
      title: 'Team meeting reminder',
      description: 'Scheduled for today at 3:00 PM.',
      read: true,
      time: '1 hour ago'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No notifications
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`p-2 rounded-md text-sm ${notification.read ? 'bg-background' : 'bg-muted'}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{notification.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
