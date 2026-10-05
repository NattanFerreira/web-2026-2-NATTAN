import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  // 1. Tenta tratar como requisição da API REST
  const handled = await handleApiRequest(req, res);
  if (handled) return;

  // 2. Se não for /api, serve os arquivos estáticos do frontend (dist)
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let safePath = path.normalize(urlObj.pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // Se o arquivo solicitado existe no dist, serve-o
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA Fallback: serve dist/index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.end('Build do frontend não encontrado. Execute `npm run build` primeiro.');
});

server.listen(PORT, () => {
  console.log(`[Servidor Quadro] Rodando com sucesso em http://localhost:${PORT}`);
  console.log(`[Servidor Quadro] API REST pronta em http://localhost:${PORT}/api`);
});

