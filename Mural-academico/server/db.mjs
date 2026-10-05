import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'quadro.db');
const db = new DatabaseSync(DB_PATH);

// Criação das tabelas relacionais do sistema conforme especificado na Avaliação 03
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email_institucional TEXT UNIQUE NOT NULL,
    perfil TEXT NOT NULL CHECK(perfil IN ('ADMINISTRADOR', 'LEITOR')),
    cargo TEXT NOT NULL,
    avatar TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS avisos (
    id_aviso TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    local_bloco TEXT NOT NULL,
    id_autor TEXT NOT NULL,
    nome_autor TEXT NOT NULL,
    nome_anexo TEXT,
    url_anexo TEXT,
    tamanho_anexo TEXT,
    data_publicacao TEXT NOT NULL,
    FOREIGN KEY(id_autor) REFERENCES usuarios(id_usuario)
  );

  CREATE TABLE IF NOT EXISTS ocorrencias (
    id_ocorrencia TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    local_bloco TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA')),
    id_solicitante TEXT NOT NULL,
    nome_solicitante TEXT NOT NULL,
    url_foto TEXT,
    parecer_atendimento TEXT,
    data_registro TEXT NOT NULL,
    data_atualizacao TEXT NOT NULL,
    FOREIGN KEY(id_solicitante) REFERENCES usuarios(id_usuario)
  );
`);

// Função para semear dados iniciais no primeiro boot
function seedDatabase() {
  const countUsers = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
  if (countUsers.count === 0) {
    console.log('[DB] Inicializando banco de dados com dados sementes institucionais...');

    // 1. Administrador pré-configurado no código (Prof. Renato)
    const adminAuth = hashPassword('admin123');
    const stmtUser = db.prepare(`
      INSERT INTO usuarios (id_usuario, nome, email_institucional, perfil, cargo, avatar, senha_hash, salt, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmtUser.run(
      'user-renato',
      'Prof. Renato',
      'renato.docente@ufersa.edu.br',
      'ADMINISTRADOR',
      'Docente · Coordenação de Curso',
      'PR',
      adminAuth.hash,
      adminAuth.salt,
      new Date().toISOString()
    );

    // 2. Administrador Institucional de Suporte
    const adminInstAuth = hashPassword('admin123');
    stmtUser.run(
      'user-admin-institucional',
      'Administrador Geral',
      'admin@ufersa.edu.br',
      'ADMINISTRADOR',
      'Suporte & Gestão Acadêmica',
      'AG',
      adminInstAuth.hash,
      adminInstAuth.salt,
      new Date().toISOString()
    );

    // 3. Usuário Leitor Inicial (Luiza Martins)
    const studentAuth = hashPassword('aluno123');
    stmtUser.run(
      'user-luiza',
      'Luiza Martins',
      'luiza.martins@ufersa.edu.br',
      'LEITOR',
      'Discente · Ciência da Computação',
      'LM',
      studentAuth.hash,
      studentAuth.salt,
      new Date().toISOString()
    );
  }

  const countAvisos = db.prepare('SELECT COUNT(*) as count FROM avisos').get();
  if (countAvisos.count === 0) {
    const stmtAviso = db.prepare(`
      INSERT INTO avisos (id_aviso, titulo, conteudo, categoria, local_bloco, id_autor, nome_autor, nome_anexo, url_anexo, tamanho_anexo, data_publicacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmtAviso.run(
      'aviso-1',
      'Edital de monitoria 2026.2 publicado',
      'Estão abertas as inscrições para o processo seletivo de monitoria do semestre 2026.2, com 14 vagas distribuídas entre disciplinas do ciclo básico de Engenharia e Ciência da Computação.\n\nAs inscrições devem ser feitas exclusivamente pelo formulário anexo, junto ao histórico escolar atualizado. O prazo final para envio é dia 28/09, às 23h59. O resultado será divulgado no próprio mural em até 5 dias úteis após o encerramento.',
      'Editais',
      'Coordenação — Bloco C',
      'user-renato',
      'Prof. Renato (Coordenação)',
      'edital-monitoria-2026-2.pdf',
      '/api/files/edital-monitoria-2026-2.pdf',
      '1.4 MB',
      '2026-09-14T09:12:00'
    );

    stmtAviso.run(
      'aviso-2',
      'Manutenção no bloco B — elevador',
      'O elevador de acessibilidade do bloco B ficará fora de operação entre os dias 16 e 18/09 para manutenção preventiva dos cabos de sustentação e recalibração dos sensores de segurança.\n\nDiscentes e servidores com mobilidade reduzida que tenham aulas no pavimento superior devem solicitar remanejamento de sala temporário junto à secretaria acadêmica.',
      'Infraestrutura',
      'Bloco B',
      'user-renato',
      'Setor de Obras e Manutenção',
      null,
      null,
      null,
      '2026-09-14T06:30:00'
    );

    stmtAviso.run(
      'aviso-3',
      'Alteração de prazo — TCC I',
      'A data limite para submissão da proposta inicial e do plano de trabalho de TCC I foi prorrogada oficialmente para 30/09, em virtude das adequações do calendário acadêmico.\n\nTodos os alunos matriculados devem enviar o documento com o aceite formal do orientador em formato PDF.',
      'Ensino',
      'Coordenação — Bloco C',
      'user-renato',
      'Prof. Renato (Coordenação)',
      'calendario-ajustado-tcc-2026.pdf',
      '/api/files/calendario-ajustado-tcc-2026.pdf',
      '420 KB',
      '2026-09-13T14:40:00'
    );

    stmtAviso.run(
      'aviso-4',
      'Semana de Tecnologia — inscrições abertas',
      'Palestras, oficinas práticas de desenvolvimento web, minicursos de computação em nuvem AWS e feira de projetos entre 22 e 26/09 no campus.\n\nInscrições gratuitas com emissão de certificado de 30 horas complementares para a comunidade acadêmica.',
      'Eventos',
      'Auditório Central',
      'user-renato',
      'Comissão Organizadora Sematec',
      null,
      null,
      null,
      '2026-09-13T10:00:00'
    );
  }

  const countOcorrencias = db.prepare('SELECT COUNT(*) as count FROM ocorrencias').get();
  if (countOcorrencias.count === 0) {
    const stmtOco = db.prepare(`
      INSERT INTO ocorrencias (id_ocorrencia, titulo, descricao, categoria, local_bloco, status, id_solicitante, nome_solicitante, url_foto, parecer_atendimento, data_registro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmtOco.run(
      'oco-1',
      'Ar-condicionado quebrado',
      'O ar-condicionado da sala 204 não liga desde a aula da manhã. O ambiente está excessivamente quente e sem ventilação para as aulas da tarde.',
      'Infraestrutura',
      'Bloco B · Sala 204',
      'ABERTA',
      'user-luiza',
      'Luiza Martins',
      null,
      null,
      '2026-09-14T08:30:00',
      '2026-09-14T08:30:00'
    );

    stmtOco.run(
      'oco-2',
      'Projetor sem sinal',
      'O projetor multimídia não reconhece nenhuma conexão de vídeo (HDMI/VGA) e fica piscando led de alerta em vermelho constante.',
      'Infraestrutura',
      'Bloco A · Sala 12',
      'EM_ANDAMENTO',
      'user-luiza',
      'Luiza Martins',
      null,
      'Técnico de audiovisual notificado e em deslocamento com cabo e projetor reserva.',
      '2026-09-13T14:15:00',
      '2026-09-14T10:00:00'
    );

    stmtOco.run(
      'oco-3',
      'Torneira vazando',
      'Vazamento persistente na segunda pia do banheiro masculino térreo, gerando desperdício e risco de escorregão.',
      'Infraestrutura',
      'Bloco C · Banheiro T1',
      'RESOLVIDA',
      'user-luiza',
      'Luiza Martins',
      null,
      'Reparo concluído pela equipe de manutenção predial com substituição do reparo de vedação.',
      '2026-09-11T10:00:00',
      '2026-09-12T15:30:00'
    );
  }
}

seedDatabase();

// Métodos de Repositório para o Backend
export const dbRepository = {
  // Usuários
  findUserByEmail(email) {
    return db
      .prepare('SELECT * FROM usuarios WHERE LOWER(email_institucional) = LOWER(?)')
      .get(email.trim());
  },

  findUserById(id) {
    return db.prepare('SELECT * FROM usuarios WHERE id_usuario = ?').get(id);
  },

  createUser({ id_usuario, nome, email_institucional, perfil, cargo, avatar, senha_hash, salt }) {
    db.prepare(`
      INSERT INTO usuarios (id_usuario, nome, email_institucional, perfil, cargo, avatar, senha_hash, salt, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id_usuario,
      nome,
      email_institucional.toLowerCase().trim(),
      perfil,
      cargo,
      avatar,
      senha_hash,
      salt,
      new Date().toISOString()
    );
    return this.findUserById(id_usuario);
  },

  listUsers() {
    return db
      .prepare(
        'SELECT id_usuario, nome, email_institucional, perfil, cargo, avatar, created_at FROM usuarios'
      )
      .all();
  },

  // Avisos
  listAvisos({ categoria, busca } = {}) {
    let sql = 'SELECT * FROM avisos';
    const params = [];
    const conditions = [];

    if (categoria && categoria !== 'Todos') {
      conditions.push('categoria = ?');
      params.push(categoria);
    }

    if (busca && busca.trim()) {
      conditions.push('(titulo LIKE ? OR conteudo LIKE ? OR local_bloco LIKE ?)');
      const term = `%${busca.trim()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY data_publicacao DESC';
    return db.prepare(sql).all(...params);
  },

  findAvisoById(id) {
    return db.prepare('SELECT * FROM avisos WHERE id_aviso = ?').get(id);
  },

  createAviso(aviso) {
    db.prepare(`
      INSERT INTO avisos (id_aviso, titulo, conteudo, categoria, local_bloco, id_autor, nome_autor, nome_anexo, url_anexo, tamanho_anexo, data_publicacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      aviso.id_aviso,
      aviso.titulo,
      aviso.conteudo,
      aviso.categoria,
      aviso.local_bloco,
      aviso.id_autor,
      aviso.nome_autor,
      aviso.nome_anexo || null,
      aviso.url_anexo || null,
      aviso.tamanho_anexo || null,
      aviso.data_publicacao || new Date().toISOString()
    );
    return this.findAvisoById(aviso.id_aviso);
  },

  updateAviso(id, updates) {
    const current = this.findAvisoById(id);
    if (!current) return null;

    db.prepare(`
      UPDATE avisos SET
        titulo = ?,
        conteudo = ?,
        categoria = ?,
        local_bloco = ?,
        nome_anexo = ?,
        url_anexo = ?,
        tamanho_anexo = ?
      WHERE id_aviso = ?
    `).run(
      updates.titulo ?? current.titulo,
      updates.conteudo ?? current.conteudo,
      updates.categoria ?? current.categoria,
      updates.local_bloco ?? current.local_bloco,
      updates.nome_anexo !== undefined ? updates.nome_anexo : current.nome_anexo,
      updates.url_anexo !== undefined ? updates.url_anexo : current.url_anexo,
      updates.tamanho_anexo !== undefined ? updates.tamanho_anexo : current.tamanho_anexo,
      id
    );
    return this.findAvisoById(id);
  },

  deleteAviso(id) {
    return db.prepare('DELETE FROM avisos WHERE id_aviso = ?').run(id);
  },

  // Ocorrências
  listOcorrencias({ id_solicitante, status, busca } = {}) {
    let sql = 'SELECT * FROM ocorrencias';
    const params = [];
    const conditions = [];

    if (id_solicitante) {
      conditions.push('id_solicitante = ?');
      params.push(id_solicitante);
    }

    if (status && status !== 'TODOS') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (busca && busca.trim()) {
      conditions.push(
        '(titulo LIKE ? OR descricao LIKE ? OR local_bloco LIKE ? OR nome_solicitante LIKE ?)'
      );
      const term = `%${busca.trim()}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY data_registro DESC';
    return db.prepare(sql).all(...params);
  },

  findOcorrenciaById(id) {
    return db.prepare('SELECT * FROM ocorrencias WHERE id_ocorrencia = ?').get(id);
  },

  createOcorrencia(oco) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO ocorrencias (id_ocorrencia, titulo, descricao, categoria, local_bloco, status, id_solicitante, nome_solicitante, url_foto, parecer_atendimento, data_registro, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      oco.id_ocorrencia,
      oco.titulo,
      oco.descricao,
      oco.categoria,
      oco.local_bloco,
      'ABERTA',
      oco.id_solicitante,
      oco.nome_solicitante,
      oco.url_foto || null,
      null,
      now,
      now
    );
    return this.findOcorrenciaById(oco.id_ocorrencia);
  },

  updateOcorrenciaStatus(id, { status, parecer_atendimento }) {
    const current = this.findOcorrenciaById(id);
    if (!current) return null;

    db.prepare(`
      UPDATE ocorrencias SET
        status = ?,
        parecer_atendimento = ?,
        data_atualizacao = ?
      WHERE id_ocorrencia = ?
    `).run(
      status ?? current.status,
      parecer_atendimento !== undefined ? parecer_atendimento : current.parecer_atendimento,
      new Date().toISOString(),
      id
    );
    return this.findOcorrenciaById(id);
  },

  deleteOcorrencia(id) {
    return db.prepare('DELETE FROM ocorrencias WHERE id_ocorrencia = ?').run(id);
  },
};

