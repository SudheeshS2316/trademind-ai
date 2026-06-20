import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-terminal-600 bg-terminal-900 px-4 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50',
            'hover:border-terminal-500',
            !!icon && 'pl-10',
            !!error && 'border-bearish focus:border-bearish focus:ring-bearish/50',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-bearish">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-terminal-600 bg-terminal-900 px-4 py-2.5 text-sm text-text-primary',
          'transition-colors duration-200',
          'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50',
          'hover:border-terminal-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
