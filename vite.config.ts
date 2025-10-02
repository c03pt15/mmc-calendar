import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  base: mode === 'production' && process.env.VERCEL ? '/' : command === 'build' ? '/mmc-calendar/' : '/', // Different base paths for dev, GitHub Pages, and Vercel
  define: {
    // Define environment variables for production builds
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://zmbptzxjuuveqmcevtaz.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYnB0enhqdXV2ZXFtY2V2dGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDU0MzcsImV4cCI6MjA2ODg4MTQzN30.Q48N5K21lLF0iB3Hr_YNwP6J6qq5jHROOda1yLuGAos'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
    open: true,
  },
})); 