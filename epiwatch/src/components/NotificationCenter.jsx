import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, BellOff, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'critical',
    title: 'Surge in Cases: Brazil',
    message: 'R0 has exceeded 1.5 in the last 24 hours. Immediate attention recommended.',
    time: '10 mins ago',
    read: false,
    icon: <AlertTriangle size={18} className="text-red-500" />
  },
  {
    id: 2,
    type: 'warning',
    title: 'Vaccination Gap: South Africa',
    message: 'Current vaccination rate at 45% is 40% below herd immunity threshold.',
    time: '2 hours ago',
    read: false,
    icon: <AlertTriangle size={18} className="text-amber-500" />
  },
  {
    id: 3,
    type: 'success',
    title: 'Decline in Cases: Japan',
    message: 'Consistent week-over-week decline in cases. R0 stable at 0.81.',
    time: '1 day ago',
    read: true,
    icon: <CheckCircle size={18} className="text-emerald-500" />
  },
  {
    id: 4,
    type: 'info',
    title: 'Model Update Complete',
    message: 'Global growth simulation models updated successfully.',
    time: '2 days ago',
    read: true,
    icon: <Info size={18} className="text-blue-500" />
  }
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center backdrop-blur-sm"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/5 dark:bg-black/40 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-14 w-[340px] sm:w-[380px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">Alerts History</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar min-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="h-full py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <BellOff size={36} className="mb-3 opacity-40 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new alerts to show.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {notifications.map((notification) => (
                      <motion.div 
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                        className={`group relative p-3.5 rounded-xl border border-transparent flex items-start gap-3.5 transition-all duration-200 ${
                          notification.read 
                            ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:border-slate-100 dark:hover:border-slate-700' 
                            : 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                        }`}
                      >
                        {/* Status Line for Unread */}
                        {!notification.read && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-blue-500 rounded-r-full" />
                        )}

                        <div className={`mt-0.5 shrink-0 flex items-center justify-center w-10 h-10 rounded-full shadow-sm border ${
                          notification.read 
                            ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' 
                            : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/50'
                        }`}>
                          {notification.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className={`text-[13px] tracking-tight mb-1 flex items-center gap-2 ${
                            notification.read 
                              ? 'text-slate-600 dark:text-slate-300 font-medium' 
                              : 'text-slate-900 dark:text-white font-bold'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-[12px] leading-relaxed mb-1.5 ${
                            notification.read 
                              ? 'text-slate-500 dark:text-slate-400' 
                              : 'text-slate-700 dark:text-slate-300 font-medium'
                          }`}>
                            {notification.message}
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
                            {notification.time}
                          </span>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="absolute right-3 top-3.5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                            title="Remove alert"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center flex justify-between items-center px-4">
                <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors flex items-center gap-1.5">
                  <Settings size={14} /> Alert Settings
                </button>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                   Active Systems: <span className="text-emerald-500 font-medium">Auto-Monitoring</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

