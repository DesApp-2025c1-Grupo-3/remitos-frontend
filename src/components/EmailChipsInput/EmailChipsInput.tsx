import React, { useState, KeyboardEvent } from 'react';
import styles from './EmailChipsInput.module.css';
import { X, AlertCircle } from 'lucide-react';

export interface EmailRecipient {
  id?: number;
  email: string;
  nombre?: string;
  activo?: boolean;
}

interface EmailChipsInputProps {
  recipients: EmailRecipient[];
  onRecipientsChange: (recipients: EmailRecipient[]) => void;
  onAddRecipient: (email: string) => Promise<void>;
  onRemoveRecipient: (id: number) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const EmailChipsInput: React.FC<EmailChipsInputProps> = ({
  recipients,
  onRecipientsChange,
  onAddRecipient,
  onRemoveRecipient,
  disabled = false,
  placeholder = "Agregar email y presionar Enter..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): { isValid: boolean; message?: string } => {
    const trimmedEmail = email.trim();
    
    // Si está vacío, considerarlo válido (se maneja en handleAddEmail)
    if (!trimmedEmail) {
      return { isValid: true };
    }
    
    if (trimmedEmail.length > 254) {
      return { isValid: false, message: 'El email es demasiado largo' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: 'Formato de email inválido' };
    }
    
    // Validar que no tenga espacios
    if (trimmedEmail.includes(' ')) {
      return { isValid: false, message: 'El email no puede contener espacios' };
    }
    
    return { isValid: true };
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      await handleAddEmail();
    }
  };

  const clearError = () => {
    if (error) {
      setError(null);
    }
  };

  const handleAddEmail = async () => {
    // Limpiar errores previos
    clearError();
    
    const email = inputValue.trim();
    
    // Si está vacío, simplemente no hacer nada (no mostrar error)
    if (!email) {
      return;
    }

    // Validar formato del email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.message || 'Email inválido');
      return;
    }

    // Verificar si el email ya existe
    const emailExists = recipients.some(recipient => 
      recipient.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      setError('Este email ya está agregado');
      return;
    }

    try {
      setIsValidating(true);
      await onAddRecipient(email);
      setInputValue('');
      clearError(); // Limpiar errores al éxito
    } catch (error: any) {
      console.error('Error agregando destinatario:', error);
      const errorMessage = error?.message || 'Error al agregar el destinatario';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveEmail = async (id: number) => {
    try {
      clearError(); // Limpiar errores al intentar remover
      await onRemoveRecipient(id);
    } catch (error: any) {
      console.error('Error removiendo destinatario:', error);
      const errorMessage = error?.message || 'Error al remover el destinatario';
      setError(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <div className={styles.chipsContainer}>
          {recipients.map((recipient) => (
            <div key={recipient.id || recipient.email} className={styles.chip}>
              <span className={styles.chipText}>
                {recipient.nombre ? `${recipient.nombre} (${recipient.email})` : recipient.email}
              </span>
              {!disabled && (
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => handleRemoveEmail(recipient.id!)}
                  disabled={isValidating}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <input
          type="email"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            clearError(); // Limpiar errores al escribir
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleAddEmail}
          placeholder={recipients.length === 0 ? placeholder : "Agregar otro email..."}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          disabled={disabled || isValidating}
        />
      </div>
      {isValidating && (
        <div className={styles.loading}>
          Agregando destinatario...
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
