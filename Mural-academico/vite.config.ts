import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// A API local (SQLite) só é carregada no `npm run dev`, sob demanda.
// Assim o `npm run build` (ex.: no Amplify) não depende de node:sqlite / Node 22.
function apiPlugin(): Plugin {
  return {
    name: 'quadro-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          // URL dinâmica: impede que o bundler da config embuta node:sqlite no build
          const apiUrl = new URL('./server/api.mjs', import.meta.url).href;
          const { handleApiRequest } = await import(/* @vite-ignore */ apiUrl);
          const handled = await handleApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
})
