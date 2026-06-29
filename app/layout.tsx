import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'react-hot-toast';

// Self-hosted by Next.js — zero layout shift, no blocking network request
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Mary Shop — Inventory & Sales Management',
  description: 'Modern multi-shop inventory and sales management system',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Mary Shop' },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-[var(--surface)] !text-[var(--text-primary)] !shadow-card !border !border-[var(--border)] !rounded-xl !text-sm',
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
