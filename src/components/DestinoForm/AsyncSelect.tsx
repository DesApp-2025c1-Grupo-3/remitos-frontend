import React, { useState, useEffect } from 'react';

interface Option {
  id: string;
  nombre: string;
}

interface AsyncSelectProps {
  label: string;
  value: string;
  onChange: (value: string, option?: Option) => void;
  fetchOptions: (input: string) => Promise<Option[]>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = '',
  required = false,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOptions(input).then(opts => {
      if (active) setOptions(opts);
      setLoading(false);
    });
    return () => { active = false; };
  }, [input, fetchOptions]);

  return (
    <div style={{ width: '100%' }}>
      <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>{label}</label>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', marginBottom: 4, padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc' }}
        disabled={disabled}
      />
      <select
        value={value}
        onChange={e => {
          const selected = options.find(o => o.id === e.target.value);
          onChange(e.target.value, selected);
        }}
        required={required}
        disabled={disabled || loading}
        style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc' }}
      >
        <option value="">{loading ? 'Cargando...' : 'Seleccione una opción'}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.nombre}</option>
        ))}
      </select>
    </div>
  );
};
