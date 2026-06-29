'use client';

import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', danger = false, loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm"
      footer={
        <>
          <button onClick={onClose}   className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} disabled={loading}>
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
