import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './Notification.module.css';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'error':
        return <AlertCircle className={styles.icon} />;
      case 'info':
        return <Info className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} className={styles.closeButton}>
        <X size={18} />
      </button>
    </div>
  );
}; 