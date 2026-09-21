import type { Usuario, Aviso, Ocorrencia } from '../types';

export const USUARIOS_INICIAIS: Usuario[] = [
  {
    id_usuario: 'user-renato',
    nome: 'Prof. Renato',
    email_institucional: 'renato.docente@ufersa.edu.br',
    perfil: 'ADMINISTRADOR',
    avatar: 'PR',
    cargo: 'Docente · Coordenação de Curso',
    senha: 'admin123',
    data_cadastro: '2026-08-01T08:00:00',
  },
  {
    id_usuario: 'user-admin-institucional',
    nome: 'Administrador Institucional',
    email_institucional: 'admin@ufersa.edu.br',
    perfil: 'ADMINISTRADOR',
    avatar: 'AD',
    cargo: 'Suporte & Gestão Acadêmica',
    senha: 'admin123',
    data_cadastro: '2026-08-01T08:00:00',
  },
  {
    id_usuario: 'user-luiza',
    nome: 'Luiza Martins',
    email_institucional: 'luiza.martins@ufersa.edu.br',
    perfil: 'LEITOR',
    avatar: 'LM',
    cargo: 'Discente · Ciência da Computação',
    senha: 'aluno123',
    data_cadastro: '2026-09-01T10:00:00',
  },
];

export const AVISOS_INICIAIS: Aviso[] = [
  {
    id_aviso: 'aviso-1',
    titulo: 'Edital de monitoria 2026.2 publicado',
    conteudo:
      'Estão abertas as inscrições para o processo seletivo de monitoria do semestre 2026.2, com 14 vagas distribuídas entre disciplinas do ciclo básico de Engenharia e Ciência da Computação.\n\nAs inscrições devem ser feitas exclusivamente pelo formulário anexo, junto ao histórico escolar atualizado. O prazo final para envio é dia 28/09, às 23h59. O resultado será divulgado no próprio mural em até 5 dias úteis após o encerramento.',
    categoria: 'Editais',
    data_publicacao: '2026-09-14T09:12:00',
    local_bloco: 'Coordenação — Bloco C',
    id_autor: 'user-renato',
    nome_autor: 'Prof. Renato (Coordenação)',
    nome_anexo: 'edital-monitoria-2026-2.pdf',
    url_anexo: '#',
    tamanho_anexo: '1.4 MB',
  },
  {
    id_aviso: 'aviso-2',
    titulo: 'Manutenção no bloco B — elevador',
    conteudo:
      'O elevador de acessibilidade do bloco B ficará fora de operação entre os dias 16 e 18/09 para manutenção preventiva dos cabos de sustentação e recalibração dos sensores de segurança.\n\nDiscentes e servidores com mobilidade reduzida que tenham aulas no pavimento superior devem solicitar remanejamento de sala temporário junto à secretaria acadêmica.',
    categoria: 'Infraestrutura',
    data_publicacao: '2026-09-14T06:30:00',
    local_bloco: 'Bloco B',
    id_autor: 'user-renato',
    nome_autor: 'Setor de Obras e Manutenção',
  },
  {
    id_aviso: 'aviso-3',
    titulo: 'Alteração de prazo — TCC I',
    conteudo:
      'A data limite para submissão da proposta inicial e do plano de trabalho de TCC I foi prorrogada oficialmente para 30/09, em virtude das adequações do calendário acadêmico.\n\nTodos os alunos matriculados devem enviar o documento com o aceite formal do orientador em formato PDF.',
    categoria: 'Ensino',
    data_publicacao: '2026-09-13T14:40:00',
    local_bloco: 'Coordenação — Bloco C',
    id_autor: 'user-renato',
    nome_autor: 'Prof. Renato (Coordenação)',
    nome_anexo: 'calendario-ajustado-tcc-2026.pdf',
    url_anexo: '#',
    tamanho_anexo: '420 KB',
  },
  {
    id_aviso: 'aviso-4',
    titulo: 'Semana de Tecnologia — inscrições abertas',
    conteudo:
      'Palestras, oficinas práticas de desenvolvimento web, minicursos de computação em nuvem AWS e feira de projetos entre 22 e 26/09 no campus.\n\nInscrições gratuitas com emissão de certificado de 30 horas complementares para a comunidade acadêmica.',
    categoria: 'Eventos',
    data_publicacao: '2026-09-13T10:00:00',
    local_bloco: 'Auditório Central',
    id_autor: 'user-renato',
    nome_autor: 'Comissão Organizadora Sematec',
  },
  {
    id_aviso: 'aviso-5',
    titulo: 'Biblioteca com horário estendido',
    conteudo:
      'Durante o período de avaliações regimentais e entrega de projetos, a Biblioteca Central funcionará até às 23h de segunda a sábado.\n\nO agendamento das salas individuais e de grupo pode ser realizado antecipadamente no balcão de atendimento.',
    categoria: 'Infraestrutura',
    data_publicacao: '2026-09-12T11:20:00',
    local_bloco: 'Biblioteca Central',
    id_autor: 'user-renato',
    nome_autor: 'Divisão de Bibliotecas',
  },
  {
    id_aviso: 'aviso-6',
    titulo: 'Calendário de recuperação divulgado',
    conteudo:
      'Já se encontra disponível o cronograma unificado para aplicação das provas de 2ª chamada e recuperação das disciplinas do semestre corrente.\n\nSolicitações de 2ª chamada mediante atestado médico devem ser protocoladas via sistema acadêmico em até 48 horas após a aplicação regular.',
    categoria: 'Ensino',
    data_publicacao: '2026-09-11T16:00:00',
    local_bloco: 'Secretaria Geral',
    id_autor: 'user-renato',
    nome_autor: 'Secretaria Acadêmica',
    nome_anexo: 'cronograma-segunda-chamada-2026-2.pdf',
    url_anexo: '#',
    tamanho_anexo: '680 KB',
  },
];

export const OCORRENCIAS_INICIAIS: Ocorrencia[] = [
  {
    id_ocorrencia: 'oco-1',
    titulo: 'Ar-condicionado quebrado',
    descricao:
      'O ar-condicionado da sala 204 não liga desde a aula da manhã. O ambiente está excessivamente quente e sem ventilação para as aulas da tarde.',
    categoria: 'Infraestrutura',
    local_bloco: 'Bloco B · Sala 204',
    status: 'ABERTA',
    data_registro: '2026-09-14T08:30:00',
    id_solicitante: 'user-luiza',
    nome_solicitante: 'Luiza Martins',
  },
  {
    id_ocorrencia: 'oco-2',
    titulo: 'Projetor sem sinal',
    descricao:
      'O projetor multimídia não reconhece nenhuma conexão de vídeo (HDMI/VGA) e fica piscando led de alerta em vermelho constante.',
    categoria: 'Infraestrutura',
    local_bloco: 'Bloco A · Sala 12',
    status: 'EM_ANDAMENTO',
    data_registro: '2026-09-13T14:15:00',
    id_solicitante: 'user-diego',
    nome_solicitante: 'Diego Souza',
  },
  {
    id_ocorrencia: 'oco-3',
    titulo: 'Torneira vazando',
    descricao:
      'Vazamento persistente na segunda pia do banheiro masculino térreo, gerando desperdício e risco de escorregão.',
    categoria: 'Infraestrutura',
    local_bloco: 'Bloco C · Banheiro T1',
    status: 'RESOLVIDA',
    data_registro: '2026-09-11T10:00:00',
    id_solicitante: 'user-ana',
    nome_solicitante: 'Ana Prado',
  },
  {
    id_ocorrencia: 'oco-4',
    titulo: 'Sem acesso ao Wi-Fi eduroam',
    descricao:
      'Ponto de acesso na área de mesas do primeiro andar da biblioteca apresentando queda frequente e recusa de credenciais.',
    categoria: 'Suporte',
    local_bloco: 'Biblioteca Central',
    status: 'ABERTA',
    data_registro: '2026-09-14T09:40:00',
    id_solicitante: 'user-caio',
    nome_solicitante: 'Caio Teixeira',
  },
  {
    id_ocorrencia: 'oco-5',
    titulo: 'Cadeiras insuficientes na sala de aula',
    descricao:
      'A turma de Algoritmos possui 42 alunos matriculados, porém a sala dispõe de apenas 34 carteiras disponíveis.',
    categoria: 'Infraestrutura',
    local_bloco: 'Bloco B · Sala 108',
    status: 'EM_ANDAMENTO',
    data_registro: '2026-09-12T16:20:00',
    id_solicitante: 'user-marina',
    nome_solicitante: 'Marina Alves',
  },
];
