import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Bell, CheckCheck, Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationsPanel: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100/80' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100/80' };
      case 'warning':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100/80' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100/80' };
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--fh-border)] text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors"
        title="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-[var(--fh-card)] flex items-center justify-center text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />,
          document.body
        )}

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-4 top-14 w-[calc(100vw-2rem)] sm:w-96 max-h-[600px] bg-[var(--fh-card)] rounded-xl shadow-2xl border border-[var(--fh-border)] overflow-hidden flex flex-col z-50 max-w-[calc(100vw-2rem)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--fh-border)] bg-[var(--fh-gray-50)]">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--fh-text)]">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-[var(--fh-muted)]">{unreadCount} não lidas</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={32} className="text-[var(--fh-muted)] mb-4 opacity-50" />
                <p className="text-[var(--fh-muted)]">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--fh-border)]">
                {notifications.map((notification) => {
                  const { icon: Icon, color, bg } = getIconAndColor(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 hover:bg-[var(--fh-gray-50)] transition-colors cursor-pointer ${
                        !notification.read ? 'bg-[var(--fh-primary)]/5' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                  <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`${color} w-5 h-5`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-[var(--fh-text)] text-xs sm:text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-[var(--fh-primary)] flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--fh-muted)] mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[var(--fh-muted)] mt-2">
                            {new Date(notification.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-[var(--fh-muted)] hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-[var(--fh-border)] bg-[var(--fh-gray-50)] flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[var(--fh-text)] border border-[var(--fh-border)] hover:bg-[var(--fh-card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">Marcar como lidas</span>
                <span className="sm:hidden">Lidas</span>
              </button>
              <button
                onClick={() => clearNotifications()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 border border-red-200/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Limpar tudo</span>
                <span className="sm:hidden">Limpar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationsPanel;
