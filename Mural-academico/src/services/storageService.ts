import type { Aviso, Ocorrencia, StatusOcorrencia, Usuario } from '../types';
import { AVISOS_INICIAIS, OCORRENCIAS_INICIAIS, USUARIOS_INICIAIS } from '../data/initialData';

const STORAGE_KEYS = {
  AVISOS: 'quadro_avisos_v1',
  OCORRENCIAS: 'quadro_ocorrencias_v1',
  CURRENT_USER: 'quadro_current_user_v1',
};

export const storageService = {
  getUsuarios(): Usuario[] {
    return USUARIOS_INICIAIS;
  },

  getCurrentUser(): Usuario {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler usuário do localStorage', e);
    }
    return USUARIOS_INICIAIS[0]; // Luiza Martins por padrão
  },

  setCurrentUser(user: Usuario): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
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
  },
};
