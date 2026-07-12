import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = (title, message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      remove(id);
    }, 4000);
  };

  const remove = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show, remove }}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let Icon = CheckCircle;
            let borderClass = 'border-l-success';
            let iconColor = 'text-success';
            
            if (toast.type === 'warning') {
              Icon = AlertTriangle;
              borderClass = 'border-l-warning';
              iconColor = 'text-warning';
            } else if (toast.type === 'error') {
              Icon = AlertCircle;
              borderClass = 'border-l-danger';
              iconColor = 'text-danger';
            } else if (toast.type === 'info') {
              Icon = Info;
              borderClass = 'border-l-primary';
              iconColor = 'text-primary';
            }
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`pointer-events-auto w-80 bg-cardBg border border-borderCol border-l-4 ${borderClass} rounded-md shadow-xl p-4 flex gap-3`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-textPrimary">{toast.title}</div>
                  <div className="text-xs text-textSecondary mt-1">{toast.message}</div>
                </div>
                <button 
                  onClick={() => remove(toast.id)}
                  className="text-textMuted hover:text-textPrimary flex-shrink-0 self-start"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
