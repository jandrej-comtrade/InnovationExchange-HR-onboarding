'use client';

import React from 'react';
import { FormFieldProps } from '@/types';

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  type = 'text',
  options = [],
  rows = 3,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            required={required}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            required={required}
          >
            <option value="">Select an option...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <input
            id={id}
            type="file"
            onChange={handleFileChange}
            className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            accept=".pdf,.doc,.docx,.txt"
          />
        );

      default:
        return (
          <input
            id={id}
            type={type}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`form-input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            required={required}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormField;
