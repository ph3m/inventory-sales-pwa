'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={16} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="input pl-9 pr-8"
      />
      {value && (
        <button onClick={() => onChange('')}
          className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
