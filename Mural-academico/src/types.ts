export type PerfilUsuario = 'ADMINISTRADOR' | 'LEITOR';

export interface Usuario {
  id_usuario: string;
  nome: string;
  email_institucional: string;
  perfil: PerfilUsuario;
  avatar: string;
  cargo: string;
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
}

export type TabNavegacao = 'mural' | 'minhas-ocorrencias' | 'admin-ocorrencias' | 'sobre';

