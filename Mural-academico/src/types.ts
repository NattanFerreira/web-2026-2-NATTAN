export type PerfilUsuario = 'ADMINISTRADOR' | 'LEITOR';

export interface Usuario {
  id_usuario: string;
  nome: string;
  email_institucional: string;
  perfil: PerfilUsuario;
  avatar: string;
  cargo: string;
  data_cadastro?: string;
  /** Hash PBKDF2 da senha (apenas contas de cadastro local). */
  senha_hash?: string;
  senha_salt?: string;
  provedor?: 'local' | 'google';
  bloqueado?: boolean;
}

export interface Comentario {
  id_comentario: string;
  id_aviso: string;
  /** null = comentário raiz; senão, id do comentário respondido. */
  id_pai: string | null;
  id_autor: string;
  nome_autor: string;
  avatar_autor: string;
  perfil_autor: PerfilUsuario;
  conteudo: string;
  data_criacao: string;
  editado?: boolean;
}

export type CategoriaAviso = 'Ensino' | 'Infraestrutura' | 'Editais' | 'Eventos';

export interface Aviso {
  id_aviso: string;
  titulo: string;
  conteudo: string;
  categoria: CategoriaAviso;
  data_publicacao: string;
  local_bloco: string;
  id_autor: string;
  nome_autor: string;
  nome_anexo?: string;
  url_anexo?: string;
  tamanho_anexo?: string;
}

export type CategoriaOcorrencia = 'Infraestrutura' | 'Ensino' | 'Suporte' | 'Outro';

export type StatusOcorrencia = 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA';

export interface Ocorrencia {
  id_ocorrencia: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrencia;
  local_bloco: string;
  status: StatusOcorrencia;
  data_registro: string;
  id_solicitante: string;
  nome_solicitante: string;
  url_foto?: string;
  parecer_atendimento?: string;
  data_atualizacao?: string;
}

export type TabNavegacao =
  | 'mural'
  | 'minhas-ocorrencias'
  | 'admin-ocorrencias'
  | 'admin-novo-aviso'
  | 'admin-editar-aviso'
  | 'admin-gestao'
  | 'nova-ocorrencia'
  | 'login'
  | 'detalhe-aviso';

export interface RouteState {
  tab: TabNavegacao;
  params?: Record<string, string>;
}

