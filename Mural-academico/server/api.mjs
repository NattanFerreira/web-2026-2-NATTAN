import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbRepository } from './db.mjs';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Criação de arquivo de exemplo para o edital padrão se não existir
const defaultPdfPath = path.join(UPLOADS_DIR, 'edital-monitoria-2026-2.pdf');
if (!fs.existsSync(defaultPdfPath)) {
  fs.writeFileSync(
    defaultPdfPath,
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
  );
}

// Utilitário para parsear body JSON de requisição HTTP
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON inválido no corpo da requisição'));
      }
    });
    req.on('error', reject);
  });
}

// Resposta JSON padronizada
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Extrai usuário autenticado do cabeçalho Authorization
function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload || !payload.id_usuario) {
    return null;
  }
  const user = dbRepository.findUserById(payload.id_usuario);
  if (!user) return null;

  const { senha_hash, salt, ...safeUser } = user;
  return safeUser;
}

/**
 * Middleware e Roteador Principal da API REST
 */
export async function handleApiRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return true;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Rota só atua em caminhos que começam com /api
  if (!pathname.startsWith('/api')) {
    return false;
  }

  try {
    // -------------------------------------------------------------
    // ROTAS DE ARQUIVOS E UPLOAD (/api/files & /api/upload)
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/files/') && req.method === 'GET') {
      const filename = path.basename(pathname.replace('/api/files/', ''));
      const filePath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        sendJson(res, 404, { error: 'Arquivo não encontrado no servidor.' });
        return true;
      }

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return true;
    }

    if (pathname === '/api/upload' && req.method === 'POST') {
      const body = await parseBody(req);
      const { filename, base64Data } = body;

      if (!filename || !base64Data) {
        sendJson(res, 400, { error: 'Arquivo e nome são obrigatórios para upload.' });
        return true;
      }

      const cleanName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(UPLOADS_DIR, cleanName);

      // Remove prefixo data:...;base64, se houver
      const base64Content = base64Data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, fileBuffer);

      const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);
      const sizeDisplay = fileBuffer.length < 1024 * 1024
        ? `${Math.round(fileBuffer.length / 1024)} KB`
        : `${sizeMB} MB`;

      sendJson(res, 201, {
        filename: cleanName,
        originalName: filename,
        url: `/api/files/${cleanName}`,
        tamanho: sizeDisplay,
      });
      return true;
    }

    // -------------------------------------------------------------
    // ROTAS DE AUTENTICAÇÃO E USUÁRIOS (/api/auth)
    // -------------------------------------------------------------
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { nome, email_institucional, cargo, senha } = body;

      if (!nome || !email_institucional || !senha) {
        sendJson(res, 400, { error: 'Todos os campos obrigatórios devem ser preenchidos.' });
        return true;
      }

      const cleanEmail = email_institucional.toLowerCase().trim();

      // Regra do documento: Administradores são cadastrados direto no código!
      if (cleanEmail === 'admin@ufersa.edu.br' || cleanEmail.startsWith('admin.')) {
        sendJson(res, 403, {
          error: 'Contas de administrador são restritas e não podem ser criadas via formulário público.',
        });
        return true;
      }

      const existing = dbRepository.findUserByEmail(cleanEmail);
      if (existing) {
        sendJson(res, 400, { error: 'E-mail institucional já cadastrado no sistema.' });
        return true;
      }

      const nameParts = nome.trim().split(/\s+/);
      const avatar =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : nome.slice(0, 2).toUpperCase();

      const { hash, salt } = hashPassword(senha);
      const id_usuario = `usr-${Date.now()}`;

      const created = dbRepository.createUser({
        id_usuario,
        nome: nome.trim(),
        email_institucional: cleanEmail,
        perfil: 'LEITOR', // Regra: Cadastro público sempre gera perfil LEITOR
        cargo: cargo?.trim() || 'Discente · Comunidade Acadêmica',
        avatar,
        senha_hash: hash,
        salt,
      });

      const token = generateToken({
        id_usuario: created.id_usuario,
        email_institucional: created.email_institucional,
        perfil: created.perfil,
      });

      const { senha_hash, salt: userSalt, ...safeUser } = created;
      sendJson(res, 201, { user: safeUser, token });
      return true;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { email, senha } = body;

      if (!email || !senha) {
        sendJson(res, 400, { error: 'E-mail institucional e senha são obrigatórios.' });
        return true;
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = dbRepository.findUserByEmail(cleanEmail);

      if (!user) {
        sendJson(res, 401, { error: 'Credenciais inválidas. Usuário não encontrado.' });
        return true;
      }

      const isValidPassword = verifyPassword(senha, user.senha_hash, user.salt);
      if (!isValidPassword) {
        sendJson(res, 401, { error: 'Senha incorreta para o e-mail informado.' });
        return true;
      }

      const token = generateToken({
        id_usuario: user.id_usuario,
        email_institucional: user.email_institucional,
        perfil: user.perfil,
      });

      const { senha_hash, salt, ...safeUser } = user;
      sendJson(res, 200, { user: safeUser, token });
      return true;
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getAuthenticatedUser(req);
      if (!user) {
        sendJson(res, 401, { error: 'Não autenticado.' });
        return true;
      }
      sendJson(res, 200, { user });
      return true;
    }

    if (pathname === '/api/usuarios' && req.method === 'GET') {
      const users = dbRepository.listUsers();
      sendJson(res, 200, users);
      return true;
    }

    // -------------------------------------------------------------
    // ROTAS DE AVISOS ACADÊMICOS (/api/avisos)
    // -------------------------------------------------------------
    if (pathname === '/api/avisos' && req.method === 'GET') {
      const categoria = searchParams.get('categoria');
      const busca = searchParams.get('busca');
      const avisos = dbRepository.listAvisos({ categoria, busca });
      sendJson(res, 200, avisos);
      return true;
    }

    if (pathname.startsWith('/api/avisos/') && req.method === 'GET') {
      const id = pathname.replace('/api/avisos/', '');
      const aviso = dbRepository.findAvisoById(id);
      if (!aviso) {
        sendJson(res, 404, { error: 'Aviso não encontrado.' });
        return true;
      }
      sendJson(res, 200, aviso);
      return true;
    }

    if (pathname === '/api/avisos' && req.method === 'POST') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser || authUser.perfil !== 'ADMINISTRADOR') {
        sendJson(res, 403, {
          error: 'Apenas administradores podem publicar comunicados institucionais.',
        });
        return true;
      }

      const body = await parseBody(req);
      const { titulo, conteudo, categoria, local_bloco, nome_anexo, url_anexo, tamanho_anexo } =
        body;

      if (!titulo || !conteudo || !categoria || !local_bloco) {
        sendJson(res, 400, { error: 'Campos obrigatórios do comunicado estão incompletos.' });
        return true;
      }

      const novo = dbRepository.createAviso({
        id_aviso: `aviso-${Date.now()}`,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        categoria,
        local_bloco: local_bloco.trim(),
        id_autor: authUser.id_usuario,
        nome_autor: `${authUser.nome} (${authUser.cargo})`,
        nome_anexo,
        url_anexo,
        tamanho_anexo,
        data_publicacao: new Date().toISOString(),
      });

      sendJson(res, 201, novo);
      return true;
    }

    if (pathname.startsWith('/api/avisos/') && req.method === 'PUT') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser || authUser.perfil !== 'ADMINISTRADOR') {
        sendJson(res, 403, { error: 'Apenas administradores podem editar comunicados.' });
        return true;
      }

      const id = pathname.replace('/api/avisos/', '');
      const body = await parseBody(req);
      const updated = dbRepository.updateAviso(id, body);

      if (!updated) {
        sendJson(res, 404, { error: 'Aviso não encontrado para atualização.' });
        return true;
      }

      sendJson(res, 200, updated);
      return true;
    }

    if (pathname.startsWith('/api/avisos/') && req.method === 'DELETE') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser || authUser.perfil !== 'ADMINISTRADOR') {
        sendJson(res, 403, { error: 'Apenas administradores podem excluir comunicados.' });
        return true;
      }

      const id = pathname.replace('/api/avisos/', '');
      dbRepository.deleteAviso(id);
      sendJson(res, 200, { success: true });
      return true;
    }

    // -------------------------------------------------------------
    // ROTAS DE OCORRÊNCIAS (/api/ocorrencias)
    // -------------------------------------------------------------
    if (pathname === '/api/ocorrencias' && req.method === 'GET') {
      const authUser = getAuthenticatedUser(req);
      const status = searchParams.get('status');
      const busca = searchParams.get('busca');

      // Se for leitor, lista prioritariamente as ocorrências dele; se for admin, vê todas
      const id_solicitante =
        authUser && authUser.perfil === 'LEITOR' ? authUser.id_usuario : undefined;

      const ocorrencias = dbRepository.listOcorrencias({ id_solicitante, status, busca });
      sendJson(res, 200, ocorrencias);
      return true;
    }

    if (pathname === '/api/ocorrencias' && req.method === 'POST') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser) {
        sendJson(res, 401, {
          error: 'É necessário estar autenticado para registrar uma ocorrência.',
        });
        return true;
      }

      const body = await parseBody(req);
      const { titulo, descricao, categoria, local_bloco, url_foto } = body;

      if (!titulo || !descricao || !categoria || !local_bloco) {
        sendJson(res, 400, { error: 'Preencha todos os campos obrigatórios da ocorrência.' });
        return true;
      }

      const nova = dbRepository.createOcorrencia({
        id_ocorrencia: `oco-${Date.now()}`,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        local_bloco: local_bloco.trim(),
        id_solicitante: authUser.id_usuario,
        nome_solicitante: authUser.nome,
        url_foto,
      });

      sendJson(res, 201, nova);
      return true;
    }

    if (pathname.startsWith('/api/ocorrencias/') && (req.method === 'PATCH' || req.method === 'PUT')) {
      const authUser = getAuthenticatedUser(req);
      if (!authUser || authUser.perfil !== 'ADMINISTRADOR') {
        sendJson(res, 403, {
          error: 'Apenas administradores podem atualizar o status e parecer da ocorrência.',
        });
        return true;
      }

      const id = pathname.replace('/api/ocorrencias/', '');
      const body = await parseBody(req);
      const { status, parecer_atendimento } = body;

      const updated = dbRepository.updateOcorrenciaStatus(id, { status, parecer_atendimento });
      if (!updated) {
        sendJson(res, 404, { error: 'Ocorrência não encontrada para atualização.' });
        return true;
      }

      sendJson(res, 200, updated);
      return true;
    }

    if (pathname.startsWith('/api/ocorrencias/') && req.method === 'DELETE') {
      const authUser = getAuthenticatedUser(req);
      if (!authUser || authUser.perfil !== 'ADMINISTRADOR') {
        sendJson(res, 403, { error: 'Apenas administradores podem excluir ocorrências.' });
        return true;
      }

      const id = pathname.replace('/api/ocorrencias/', '');
      dbRepository.deleteOcorrencia(id);
      sendJson(res, 200, { success: true });
      return true;
    }

    // Endpoint não encontrado dentro de /api
    sendJson(res, 404, { error: 'Endpoint da API não encontrado.' });
    return true;
  } catch (err) {
    console.error('[API Error]:', err);
    sendJson(res, 500, { error: 'Erro interno no servidor da API.', details: err.message });
    return true;
  }
}

