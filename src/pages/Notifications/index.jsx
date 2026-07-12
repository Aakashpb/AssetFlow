import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import { Bell, Trash2, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const Notifications = () => {
  const { show } = useToast();
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(mockApi.getNotifications());
  }, []);

  const handleMarkRead = (id) => {
    mockApi.markNotificationRead(id);
    setList(mockApi.getNotifications());
  };

  const handleClearAll = () => {
    mockApi.clearNotifications();
    setList([]);
    show('Alerts Cleared', 'All notifications cleared successfully.', 'info');
  };

  const getAlertDetails = (type) => {
    const details = {
      success: { icon: CheckCircle, bg: 'bg-emerald-500/10 text-emerald-500 border-l-emerald-500' },
      warning: { icon: AlertTriangle, bg: 'bg-amber-500/10 text-amber-500 border-l-amber-500' },
      error: { icon: AlertCircle, bg: 'bg-rose-500/10 text-rose-500 border-l-rose-500' },
      request: { icon: Bell, bg: 'bg-blue-500/10 text-blue-500 border-l-blue-500' }
    };
    return details[type] || { icon: Info, bg: 'bg-slate-500/10 text-slate-500 border-l-slate-500' };
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Notification Center</h2>
          <p className="text-xs text-textSecondary">Security alerts, transfer checks, and audit milestones.</p>
        </div>
        <button 
          onClick={handleClearAll}
          className="btn btn-secondary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          disabled={list.length === 0}
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Alerts</span>
        </button>
      </div>

      <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm overflow-hidden flex flex-col p-5">
        {list.length === 0 ? (
          <div className="text-center py-12 text-sm text-textSecondary">
            <Bell className="w-12 h-12 text-textMuted mx-auto mb-4" />
            <div className="font-heading font-semibold text-lg text-textPrimary">No new alerts</div>
            <p className="text-xs text-textSecondary mt-1">You are all caught up for the day!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(notif => {
              const { icon: Icon, bg } = getAlertDetails(notif.type);
              
              return (
                <div 
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className={`border border-borderCol border-l-4 ${bg} rounded-md p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-hoverBg/10 transition-colors ${!notif.read ? 'ring-1 ring-primary/20' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm text-textPrimary flex items-center gap-2">
                        <span>{notif.title}</span>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-textMuted whitespace-nowrap self-start sm:self-center">{notif.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
