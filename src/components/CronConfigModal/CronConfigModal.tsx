import React, { useState, useEffect } from 'react';
import { cronConfigService, CronConfig } from '../../services/cronConfigService';
import { emailRecipientsService, EmailRecipient } from '../../services/emailRecipientsService';
import { EmailChipsInput } from '../EmailChipsInput/EmailChipsInput';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './CronConfigModal.module.css';

interface CronConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export const CronConfigModal: React.FC<CronConfigModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hora, setHora] = useState('09:00');
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const { showNotification } = useNotification();

  // Cargar configuración actual al abrir el modal
  useEffect(() => {
    if (open) {
      loadCurrentConfig();
      loadRecipients();
    }
  }, [open]);

  const loadCurrentConfig = async () => {
    try {
      setLoading(true);
      const currentConfig = await cronConfigService.getConfig();
      
      // Usar la hora del backend
      setHora(currentConfig.hora || '09:00');
    } catch (error) {
      console.error('Error cargando configuración:', error);
      showNotification('Error al cargar la configuración actual', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      setRecipientsLoading(true);
      const recipientsData = await emailRecipientsService.getRecipients();
      setRecipients(recipientsData);
    } catch (error) {
      console.error('Error cargando destinatarios:', error);
      showNotification('Error al cargar los destinatarios', 'error');
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHora(event.target.value);
  };

  const handleSave = async () => {
    // Validar formato de hora
    if (!cronConfigService.validateTimeFormat(hora)) {
      showNotification('Formato de hora inválido. Use HH:MM (ej: 09:00)', 'error');
      return;
    }

    try {
      setSaving(true);
      await cronConfigService.saveConfig({
        hora: hora,
        activo: true
      });
      
      showNotification('Configuración del cron guardada exitosamente', 'success');
      onClose();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showNotification('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecipient = async (email: string) => {
    try {
      const newRecipient = await emailRecipientsService.createRecipient(email);
      setRecipients(prev => [...prev, newRecipient]);
      showNotification('Destinatario agregado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error agregando destinatario:', error);
      // Re-throw con mensaje más específico
      throw new Error(error?.message || 'No se pudo agregar el destinatario');
    }
  };

  const handleRemoveRecipient = async (id: number) => {
    try {
      await emailRecipientsService.deleteRecipient(id);
      setRecipients(prev => prev.filter(r => r.id !== id));
      showNotification('Destinatario eliminado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error eliminando destinatario:', error);
      // Re-throw con mensaje más específico
      throw new Error(error?.message || 'No se pudo eliminar el destinatario');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Configurar Horario</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleCancel}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {loading || recipientsLoading ? (
            <div className={styles.loading}>
              <p>Cargando configuración actual...</p>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="hora" className={styles.label}>
                  Horario de envío:
                </label>
                <input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={handleTimeChange}
                  className={styles.timeInput}
                  disabled={saving}
                />
                <small className={styles.helpText}>
                  El cron se ejecutará diariamente a esta hora para enviar las notificaciones
                </small>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Destinatarios de recordatorios:
                </label>
                <EmailChipsInput
                  recipients={recipients}
                  onRecipientsChange={setRecipients}
                  onAddRecipient={handleAddRecipient}
                  onRemoveRecipient={handleRemoveRecipient}
                  disabled={saving || recipientsLoading}
                  placeholder="Agregar email y presionar Enter..."
                />
                <small className={styles.helpText}>
                  Los recordatorios se enviarán a todos los emails configurados aquí
                </small>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || loading || recipientsLoading}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};
