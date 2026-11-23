import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  if (process.env.NETLIFY === 'true') {
    const api = new URL(environment.VITE_API_URL || 'http://localhost');
    if (api.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(api.hostname)) {
      throw new Error('Netlify necesita VITE_API_URL con la dirección HTTPS pública de la API.');
    }
  }
  return { plugins: [react(), tailwindcss()], server: { port: 5173, strictPort: true }, esbuild: { legalComments: 'none' } };
});
