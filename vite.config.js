import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, /api se reenvía al proxy Express (donde vive la key).
    proxy: { '/api': 'http://localhost:3001' },
  },
});
