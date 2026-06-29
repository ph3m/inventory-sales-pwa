import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'TZS') {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export function isLowStock(quantity: number, minStock: number) {
  return quantity <= minStock;
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function generateReceiptNumber() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `RCP-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'ADMIN':      return 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300';
    case 'SUPERVISOR': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'WORKER':     return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:           return 'bg-slate-100 text-slate-700';
  }
}
