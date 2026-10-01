import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Social networks need absolute image/page URLs, so the site's public address
// is baked into index.html at build time.
function siteOrigin(env) {
  const configured = env.SITE_URL || env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://northi.vercel.app';
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const origin = siteOrigin(env);

  return {
    plugins: [
      react(),
      {
        name: 'site-origin',
        transformIndexHtml: {
          order: 'pre',
          handler: (html) => html.replaceAll('%SITE_ORIGIN%', origin),
        },
      },
    ],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': { target: 'http://localhost:4000', changeOrigin: true },
        '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
      },
    },
  };
});
