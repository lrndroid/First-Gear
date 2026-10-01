import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCd0wJ-h87ejFi8IynHiryr6LCn7ZPpnqM';

function googleRoadsProxyPlugin(): Plugin {
  return {
    name: 'google-roads-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');

        const activeKey = process.env.VITE_GOOGLE_MAPS_API_KEY || apiKey;

        if (url.pathname === '/api/roads/speed-limits') {
          const pathParam = url.searchParams.get('path');
          const units = url.searchParams.get('units') || 'MPH';
          if (!pathParam) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: 'Missing path parameter'}));
          }

          try {
            const apiUrl = `https://roads.googleapis.com/v1/speedLimits?path=${encodeURIComponent(
              pathParam
            )}&units=${units}&key=${activeKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;

            const gmpRes = await fetch(apiUrl);
            const data = await gmpRes.json();

            res.statusCode = gmpRes.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: err?.message || 'Failed to fetch speed limits'}));
          }
        }

        if (url.pathname === '/api/roads/snap-to-roads') {
          const pathParam = url.searchParams.get('path');
          const interpolate = url.searchParams.get('interpolate') || 'true';
          if (!pathParam) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: 'Missing path parameter'}));
          }

          try {
            const apiUrl = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(
              pathParam
            )}&interpolate=${interpolate}&key=${activeKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;

            const gmpRes = await fetch(apiUrl);
            const data = await gmpRes.json();

            res.statusCode = gmpRes.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: err?.message || 'Failed to snap to roads'}));
          }
        }

        if (url.pathname === '/api/geocode/reverse') {
          const lat = url.searchParams.get('lat');
          const lng = url.searchParams.get('lng');
          if (!lat || !lng) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: 'Missing lat or lng parameter'}));
          }

          try {
            const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${activeKey}`;
            const gmpRes = await fetch(apiUrl);
            const data = await gmpRes.json();

            res.statusCode = gmpRes.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: err?.message || 'Failed to reverse geocode'}));
          }
        }

        if (url.pathname === '/api/download-android') {
          const zipPath = path.resolve('public/teendrive-android-project.zip');
          if (fs.existsSync(zipPath)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="teendrive-guard-android.zip"');
            return fs.createReadStream(zipPath).pipe(res);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({error: 'Archive not found'}));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      googleRoadsProxyPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'TeenDrive Guard',
          short_name: 'TeenDrive',
          description: 'Teen driver speed, braking smoothness, and telemetry monitor with Google Roads API.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
