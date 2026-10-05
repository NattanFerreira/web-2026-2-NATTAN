import type { Aviso, Ocorrencia, StatusOcorrencia, Usuario } from '../types';

const TOKEN_KEY = 'quadro_auth_token_v1';
const USER_KEY = 'quadro_cached_user_v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setSession(token: string, user: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public getCachedUser(): Usuario | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // -------------------------------------------------------------
  // AUTENTICAÇÃO E USUÁRIOS
  // -------------------------------------------------------------
  async login(credentials: { email: string; senha: string }): Promise<{ user: Usuario; token: string }> {
    const res = await this.request<{ user: Usuario; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setSession(res.token, res.user);
    return res;
  }

  async register(data: {
    nome: string;
    email_institucional: string;
    cargo: string;
    senha: string;
  }): Promise<{ user: Usuario; token: string }> {
    const res = await this.request<{ user: Usuario; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setSession(res.token, res.user);
    return res;
  }

  async getCurrentUser(): Promise<Usuario | null> {
    try {
      if (!this.getToken()) return null;
      const res = await this.request<{ user: Usuario }>('/api/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async getUsuarios(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/api/usuarios');
  }

  // -------------------------------------------------------------
  // AVISOS ACADÊMICOS
  // -------------------------------------------------------------
  async getAvisos(params?: { categoria?: string; busca?: string }): Promise<Aviso[]> {
    const search = new URLSearchParams();
    if (params?.categoria && params.categoria !== 'Todos') {
      search.set('categoria', params.categoria);
    }
    if (params?.busca) {
      search.set('busca', params.busca);
    }
    const query = search.toString() ? `?${search.toString()}` : '';
    return this.request<Aviso[]>(`/api/avisos${query}`);
  }

  async getAvisoById(id: string): Promise<Aviso> {
    return this.request<Aviso>(`/api/avisos/${id}`);
  }

  async createAviso(data: {
    titulo: string;
    conteudo: string;
    categoria: Aviso['categoria'];
    local_bloco: string;
    nome_anexo?: string;
    url_anexo?: string;
    tamanho_anexo?: string;
  }): Promise<Aviso> {
    return this.request<Aviso>('/api/avisos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAviso(
    id: string,
    data: {
      titulo?: string;
      conteudo?: string;
      categoria?: Aviso['categoria'];
      local_bloco?: string;
      nome_anexo?: string;
      url_anexo?: string;
      tamanho_anexo?: string;
    }
  ): Promise<Aviso> {
    return this.request<Aviso>(`/api/avisos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAviso(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/avisos/${id}`, {
      method: 'DELETE',
    });
  }

  // -------------------------------------------------------------
  // OCORRÊNCIAS
  // -------------------------------------------------------------
  async getOcorrencias(params?: { status?: string; busca?: string }): Promise<Ocorrencia[]> {
    const search = new URLSearchParams();
    if (params?.status && params.status !== 'TODOS') {
      search.set('status', params.status);
    }
    if (params?.busca) {
      search.set('busca', params.busca);
    }
    const query = search.toString() ? `?${search.toString()}` : '';
    return this.request<Ocorrencia[]>(`/api/ocorrencias${query}`);
  }

  async createOcorrencia(data: {
    titulo: string;
    descricao: string;
    categoria: Ocorrencia['categoria'];
    local_bloco: string;
    url_foto?: string;
  }): Promise<Ocorrencia> {
    return this.request<Ocorrencia>('/api/ocorrencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOcorrenciaStatus(
    id: string,
    payload: { status: StatusOcorrencia; parecer_atendimento?: string }
  ): Promise<Ocorrencia> {
    return this.request<Ocorrencia>(`/api/ocorrencias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteOcorrencia(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/ocorrencias/${id}`, {
      method: 'DELETE',
    });
  }

  // -------------------------------------------------------------
  // UPLOAD DE ARQUIVOS REAL
  // -------------------------------------------------------------
  async uploadFile(file: File): Promise<{ filename: string; originalName: string; url: string; tamanho: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await this.request<{
            filename: string;
            originalName: string;
            url: string;
            tamanho: string;
          }>('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              base64Data,
            }),
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo para upload.'));
      reader.readAsDataURL(file);
    });
  }
}

export const apiService = new ApiService();

