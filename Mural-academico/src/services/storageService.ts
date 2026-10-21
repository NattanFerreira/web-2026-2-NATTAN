import type { Aviso, Comentario, Ocorrencia, StatusOcorrencia, Usuario } from '../types';
import { AVISOS_INICIAIS, OCORRENCIAS_INICIAIS, USUARIOS_INICIAIS } from '../data/initialData';

/** E-mails (separados por vírgula) que são administradores raiz — definidos em VITE_ADMIN_EMAILS. */
export const ADMIN_EMAILS: string[] = ((import.meta.env.VITE_ADMIN_EMAILS as string) ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string): boolean =>
  ADMIN_EMAILS.includes(email.toLowerCase().trim());

const makeAvatar = (nome: string): string => {
  const parts = nome.trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : nome.slice(0, 2).toUpperCase();
};

const STORAGE_KEYS = {
  AVISOS: 'quadro_avisos_v1',
  OCORRENCIAS: 'quadro_ocorrencias_v1',
  CURRENT_USER: 'quadro_current_user_v1',
  REGISTERED_USERS: 'quadro_usuarios_registrados_v1',
  COMENTARIOS: 'quadro_comentarios_v1',
  GUEST: 'quadro_visitante_v1',
};

export const storageService = {
  getUsuarios(): Usuario[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      const registered: Usuario[] = saved ? JSON.parse(saved) : [];
      // Mescla os usuários base do código com os usuários dinamicamente cadastrados
      const codeUserEmails = new Set(USUARIOS_INICIAIS.map((u) => u.email_institucional.toLowerCase()));
      const uniqueRegistered = registered.filter(
        (u) => !codeUserEmails.has(u.email_institucional.toLowerCase())
      );
      return [...USUARIOS_INICIAIS, ...uniqueRegistered];
    } catch (e) {
      console.error('Erro ao ler usuários do localStorage', e);
      return USUARIOS_INICIAIS;
    }
  },

  getUsuarioByEmail(email: string): Usuario | undefined {
    const todos = this.getUsuarios();
    return todos.find((u) => u.email_institucional.toLowerCase().trim() === email.toLowerCase().trim());
  },

  /** Cria uma conta (LEITOR por padrão; ADMINISTRADOR apenas se o e-mail estiver em VITE_ADMIN_EMAILS). */
  addUsuario(data: {
    nome: string;
    email_institucional: string;
    cargo: string;
    senha_hash?: string;
    senha_salt?: string;
    provedor?: 'local' | 'google';
  }): Usuario {
    const email = data.email_institucional.toLowerCase().trim();
    if (this.getUsuarioByEmail(email)) {
      throw new Error('E-mail institucional já cadastrado no sistema.');
    }

    const novoUsuario: Usuario = {
      id_usuario: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: data.nome.trim(),
      email_institucional: email,
      perfil: isAdminEmail(email) ? 'ADMINISTRADOR' : 'LEITOR',
      avatar: makeAvatar(data.nome),
      cargo:
        data.cargo.trim() ||
        (isAdminEmail(email) ? 'Administrador do Sistema' : 'Discente · Comunidade Acadêmica'),
      data_cadastro: new Date().toISOString(),
      senha_hash: data.senha_hash,
      senha_salt: data.senha_salt,
      provedor: data.provedor ?? 'local',
    };

    const registered = this.getUsuariosRegistrados();
    registered.push(novoUsuario);
    this.saveUsuariosRegistrados(registered);
    return novoUsuario;
  },

  getUsuariosRegistrados(): Usuario[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveUsuariosRegistrados(users: Usuario[]): void {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  },

  /** Garante que um e-mail de admin raiz sempre tenha perfil ADMINISTRADOR ao logar via Google. */
  upsertGoogleUser(nome: string, email: string): Usuario {
    const existing = this.getUsuarioByEmail(email);
    if (!existing) {
      return this.addUsuario({ nome, email_institucional: email, cargo: '', provedor: 'google' });
    }
    if (isAdminEmail(email) && existing.perfil !== 'ADMINISTRADOR') {
      return this.updateUsuario(existing.id_usuario, { perfil: 'ADMINISTRADOR', bloqueado: false }) ?? existing;
    }
    return existing;
  },

  /** Busca somente entre contas cadastradas (editáveis); contas fixas do código ficam de fora. */
  getUsuarioPorId(id_usuario: string): Usuario | undefined {
    return this.getUsuariosRegistrados().find((u) => u.id_usuario === id_usuario);
  },

  updateUsuario(id_usuario: string, patch: Partial<Usuario>): Usuario | undefined {
    const registered = this.getUsuariosRegistrados();
    const idx = registered.findIndex((u) => u.id_usuario === id_usuario);
    if (idx === -1) return undefined;
    registered[idx] = { ...registered[idx], ...patch };
    this.saveUsuariosRegistrados(registered);
    return registered[idx];
  },

  deleteUsuario(id_usuario: string): void {
    this.saveUsuariosRegistrados(
      this.getUsuariosRegistrados().filter((u) => u.id_usuario !== id_usuario)
    );
  },

  isGuest(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.GUEST) === '1';
  },

  setGuest(value: boolean): void {
    if (value) sessionStorage.setItem(STORAGE_KEYS.GUEST, '1');
    else sessionStorage.removeItem(STORAGE_KEYS.GUEST);
  },

  getComentarios(): Comentario[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMENTARIOS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler comentários do localStorage', e);
    }
    return [];
  },

  saveComentarios(comentarios: Comentario[]): void {
    localStorage.setItem(STORAGE_KEYS.COMENTARIOS, JSON.stringify(comentarios));
  },

  addComentario(data: {
    id_aviso: string;
    id_pai: string | null;
    conteudo: string;
    autor: Usuario;
  }): Comentario {
    const novo: Comentario = {
      id_comentario: `com-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      id_aviso: data.id_aviso,
      id_pai: data.id_pai,
      id_autor: data.autor.id_usuario,
      nome_autor: data.autor.nome,
      avatar_autor: data.autor.avatar,
      perfil_autor: data.autor.perfil,
      conteudo: data.conteudo.trim(),
      data_criacao: new Date().toISOString(),
    };
    this.saveComentarios([...this.getComentarios(), novo]);
    return novo;
  },

  /** Remove o comentário e, em cascata, todas as respostas a ele. */
  deleteComentario(id_comentario: string): void {
    const todos = this.getComentarios();
    const remover = new Set<string>([id_comentario]);
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const c of todos) {
        if (c.id_pai && remover.has(c.id_pai) && !remover.has(c.id_comentario)) {
          remover.add(c.id_comentario);
          mudou = true;
        }
      }
    }
    this.saveComentarios(todos.filter((c) => !remover.has(c.id_comentario)));
  },

  updateAviso(id_aviso: string, patch: Partial<Aviso>): void {
    this.saveAvisos(
      this.getAvisos().map((a) => (a.id_aviso === id_aviso ? { ...a, ...patch, id_aviso } : a))
    );
  },

  getCurrentUser(): Usuario | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const snapshot: Usuario = JSON.parse(saved);
        // Revalida contra a lista atual: reflete promoções/rebaixamentos e bloqueios/exclusões
        const atual = this.getUsuarioByEmail(snapshot.email_institucional);
        if (!atual || atual.bloqueado) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          return null;
        }
        return atual;
      }
    } catch (e) {
      console.error('Erro ao ler usuário logado do localStorage', e);
    }
    return null;
  },

  setCurrentUser(user: Usuario | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  getAvisos(): Aviso[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AVISOS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler avisos do localStorage', e);
    }
    // Salva o inicial se estiver vazio
    this.saveAvisos(AVISOS_INICIAIS);
    return AVISOS_INICIAIS;
  },

  saveAvisos(avisos: Aviso[]): void {
    localStorage.setItem(STORAGE_KEYS.AVISOS, JSON.stringify(avisos));
  },

  addAviso(aviso: Omit<Aviso, 'id_aviso' | 'data_publicacao'>): Aviso {
    const avisos = this.getAvisos();
    const novoAviso: Aviso = {
      ...aviso,
      id_aviso: `aviso-${Date.now()}`,
      data_publicacao: new Date().toISOString(),
    };
    const atualizados = [novoAviso, ...avisos];
    this.saveAvisos(atualizados);
    return novoAviso;
  },

  deleteAviso(id_aviso: string): void {
    const avisos = this.getAvisos();
    const filtrados = avisos.filter((a) => a.id_aviso !== id_aviso);
    this.saveAvisos(filtrados);
    this.saveComentarios(this.getComentarios().filter((c) => c.id_aviso !== id_aviso));
  },

  getOcorrencias(): Ocorrencia[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OCORRENCIAS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler ocorrências do localStorage', e);
    }
    this.saveOcorrencias(OCORRENCIAS_INICIAIS);
    return OCORRENCIAS_INICIAIS;
  },

  saveOcorrencias(ocorrencias: Ocorrencia[]): void {
    localStorage.setItem(STORAGE_KEYS.OCORRENCIAS, JSON.stringify(ocorrencias));
  },

  addOcorrencia(
    ocorrencia: Omit<Ocorrencia, 'id_ocorrencia' | 'data_registro' | 'status'>
  ): Ocorrencia {
    const ocorrencias = this.getOcorrencias();
    const novaOcorrencia: Ocorrencia = {
      ...ocorrencia,
      id_ocorrencia: `oco-${Date.now()}`,
      data_registro: new Date().toISOString(),
      status: 'ABERTA',
    };
    const atualizadas = [novaOcorrencia, ...ocorrencias];
    this.saveOcorrencias(atualizadas);
    return novaOcorrencia;
  },

  updateOcorrenciaStatus(id_ocorrencia: string, novoStatus: StatusOcorrencia, parecer?: string): void {
    const ocorrencias = this.getOcorrencias();
    const atualizadas = ocorrencias.map((o) =>
      o.id_ocorrencia === id_ocorrencia
        ? {
            ...o,
            status: novoStatus,
            ...(parecer !== undefined && parecer.trim() !== ''
              ? { parecer_atendimento: parecer.trim() }
              : {}),
            data_atualizacao: new Date().toISOString(),
          }
        : o
    );
    this.saveOcorrencias(atualizadas);
  },

  deleteOcorrencia(id_ocorrencia: string): void {
    const ocorrencias = this.getOcorrencias();
    const filtradas = ocorrencias.filter((o) => o.id_ocorrencia !== id_ocorrencia);
    this.saveOcorrencias(filtradas);
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.AVISOS);
    localStorage.removeItem(STORAGE_KEYS.OCORRENCIAS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
    localStorage.removeItem(STORAGE_KEYS.COMENTARIOS);
    sessionStorage.removeItem(STORAGE_KEYS.GUEST);
  },
};
