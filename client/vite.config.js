import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apkDownloadHeaders = {
  name: 'apk-download-headers',
  configureServer(server) {
    server.middlewares.use('/downloads/unibot.apk', (_req, res, next) => {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="UniBot.apk"');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), apkDownloadHeaders],
  server: {
    host: true, // Enables local network access from mobile devices
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
