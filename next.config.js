/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Static assets — serve from cache immediately
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 500, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Pages — network first, fall back to cache
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
      },
    },
    // Supabase API — network first, fall back to cache
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 },
      },
    },
    // Google Fonts — cache first
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // HTML pages — network first
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Split large packages into separate chunks
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@supabase/supabase-js'],
  },

  // Security + caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Long cache for static assets (they have content hashes)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
