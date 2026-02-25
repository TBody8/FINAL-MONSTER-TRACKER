import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const Notifications = ({ notifications, onDismiss }) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide) {
        setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration || 5000);
      }
    });
  }, [notifications, onDismiss]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400';
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      case 'info':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3 max-w-md w-full px-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className={`bg-gradient-to-r ${getColors(notification.type)} backdrop-blur-md rounded-xl p-4 border shadow-lg mx-auto`}
          >
            <div className="flex items-start gap-3">
              <div className={`${getColors(notification.type).split(' ')[4]} mt-0.5`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 text-center">
                <h4 className="font-semibold text-white mb-1 monster-subtitle">{notification.title}</h4>
                <p className="text-sm text-gray-300">{notification.message}</p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {notification.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${notification.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">{notification.progress}% of daily limit</p>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;