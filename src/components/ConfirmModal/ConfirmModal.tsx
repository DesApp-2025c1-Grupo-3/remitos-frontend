import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.content}>
          {message}
        </div>
        <div className={styles.footer}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 