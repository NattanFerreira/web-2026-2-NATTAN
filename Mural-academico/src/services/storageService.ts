import type { Aviso, Ocorrencia, StatusOcorrencia, Usuario } from '../types';
import { AVISOS_INICIAIS, OCORRENCIAS_INICIAIS, USUARIOS_INICIAIS } from '../data/initialData';

const STORAGE_KEYS = {
  AVISOS: 'quadro_avisos_v1',
  OCORRENCIAS: 'quadro_ocorrencias_v1',
  CURRENT_USER: 'quadro_current_user_v1',
  REGISTERED_USERS: 'quadro_usuarios_registrados_v1',
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

  addUsuario(data: {
    nome: string;
    email_institucional: string;
    cargo: string;
    senha?: string;
  }): Usuario {
    const todos = this.getUsuarios();
    const existing = todos.find(
      (u) => u.email_institucional.toLowerCase().trim() === data.email_institucional.toLowerCase().trim()
    );
    if (existing) {
      throw new Error('E-mail institucional já cadastrado no sistema.');
    }

    // Calcula avatar a partir das iniciais do nome
    const nameParts = data.nome.trim().split(/\s+/);
    const avatar =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : data.nome.slice(0, 2).toUpperCase();

    const novoUsuario: Usuario = {
      id_usuario: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: data.nome.trim(),
      email_institucional: data.email_institucional.toLowerCase().trim(),
      perfil: 'LEITOR', // Regra: Cadastro público sempre cria perfil LEITOR. Administradores são cadastrados direto no código!
      avatar,
      cargo: data.cargo.trim() || 'Discente · Comunidade Acadêmica',
      senha: data.senha,
      data_cadastro: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      const registered: Usuario[] = saved ? JSON.parse(saved) : [];
      registered.push(novoUsuario);
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registered));
    } catch (e) {
      console.error('Erro ao salvar novo usuário no localStorage', e);
    }

    return novoUsuario;
  },

  getCurrentUser(): Usuario | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler usuário logado do localStorage', e);
    }
    // Retorna Luiza Martins como padrão para testes iniciais
    return USUARIOS_INICIAIS.find((u) => u.perfil === 'LEITOR') || USUARIOS_INICIAIS[0];
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

  updateOcorrenciaStatus(id_ocorrencia: string, novoStatus: StatusOcorrencia): void {
    const ocorrencias = this.getOcorrencias();
    const atualizadas = ocorrencias.map((o) =>
      o.id_ocorrencia === id_ocorrencia ? { ...o, status: novoStatus } : o
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
  },
};
