import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Bell, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<NotificationItem[]>('/notifications');
      setNotifications(data);
    } catch {
      // Handled by api fallback
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Slideout Panel */}
      <div className="relative w-full max-w-sm bg-surface shadow-2xl h-full flex flex-col z-10 border-l border-govborder animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-govborder flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-govblue-600" />
            <h3 className="font-bold text-sm text-navy-800">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-govblue-600 hover:text-govblue-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/50"
              title="Mark all read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-mutedtext text-xs">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-mutedtext">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium">No pending notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = notif.status !== 'read';
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isUnread
                      ? 'bg-govblue-50/50 border-govblue-200 shadow-sm'
                      : 'bg-white border-govborder hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-navy-800">{notif.title}</span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-saffron-500 flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-2">{notif.message}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
