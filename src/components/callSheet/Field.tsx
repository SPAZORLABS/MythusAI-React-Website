import React from 'react';
import { useCallSheet } from '@/contexts/CallSheetContext';

interface BaseFieldProps {
  path: string;
  className?: string;
  placeholder?: string;
}

interface TextFieldProps extends BaseFieldProps {
  multiline?: boolean;
  rows?: number;
}

interface TimeFieldProps extends BaseFieldProps {
  ampmPath: string;
}

interface LabeledOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends BaseFieldProps {
  options: Array<string | LabeledOption>;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function TextField({ path, className = '', placeholder, multiline = false, rows = 1 }: TextFieldProps) {
  const { data, dispatch } = useCallSheet();
  
  const getValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return current?.[arrayKey]?.[parseInt(index)] || '';
      }
      return current?.[key] || '';
    }, obj);
  };

  const value = getValue(data, path);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_FIELD', path, value: e.target.value });
  };

  const baseClasses = `font-print text-xs border-0 bg-transparent p-0 m-0 outline-none resize-none leading-4 whitespace-pre-wrap break-words ${className}`;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={baseClasses}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
}

export function TimeField({ path, ampmPath, className = '', placeholder }: TimeFieldProps) {
  const { data, dispatch } = useCallSheet();
  
  const getValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return current?.[arrayKey]?.[parseInt(index)] || '';
      }
      return current?.[key] || '';
    }, obj);
  };

  const timeValue = getValue(data, path);
  const ampmValue = getValue(data, ampmPath);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', path, value: e.target.value });
  };

  const handleAMPMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_FIELD', path: ampmPath, value: e.target.value });
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        placeholder={placeholder}
        className={`font-print text-xs border-0 bg-transparent p-0 m-0 outline-none w-16 ${className}`}
      />
      <select
        value={ampmValue}
        onChange={handleAMPMChange}
        className="font-print text-xs border-0 bg-transparent p-0 m-0 outline-none"
      >
        <option value="">--</option>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export function SelectField({ path, options, className = '', placeholder, onChange }: SelectFieldProps) {
  const { data, dispatch } = useCallSheet();
  
  const getValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return current?.[arrayKey]?.[parseInt(index)] || '';
      }
      return current?.[key] || '';
    }, obj);
  };

  const value = getValue(data, path);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_FIELD', path, value: e.target.value });
    if (onChange) onChange(e);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`font-print text-xs border-0 bg-transparent p-0 m-0 outline-none leading-4 ${className}`}
    >
      <option value="">{placeholder || '--'}</option>
      {options.map((option) => {
        const key = typeof option === 'string' ? option : option.value;
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        return (
          <option key={key} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
