export interface LinkUtil {
  label: string;
  href: string;
  icon: string;
  /** Descrição curta ou subtítulo focado no dia a dia do estudante */
  descricao: string;
  download?: boolean;
}

export const LINKS_UTEIS: LinkUtil[] = [
  {
    label: 'SIGAA',
    href: 'https://sso.ufersa.edu.br/sso-server/login',
    icon: '🎓',
    descricao: 'Matrículas, turmas virtuais, notas e frequências',
  },
  {
    label: 'Restaurante Universitário (RU)',
    href: 'https://ru.ufersa.edu.br/',
    icon: '🍽️',
    descricao: 'Cardápio do dia, saldo da carteirinha e horários',
  },
  {
    label: 'Calendário Acadêmico 2026.2',
    href: '/calendario-academico.pdf',
    icon: '📅',
    descricao: 'Datas de provas, recessos e prazos do semestre (PDF)',
    download: true,
  },
  {
    label: 'Portal UFERSA',
    href: 'https://ufersa.edu.br/',
    icon: '🏛️',
    descricao: 'Notícias, editais e informações gerais da universidade',
  },
  {
    label: 'Biblioteca Central (SISBI)',
    href: 'https://biblioteca.ufersa.edu.br/',
    icon: '📚',
    descricao: 'Busca no acervo, renovação online e salas de estudo',
  },
  {
    label: 'Ouvidoria Estudantil',
    href: 'https://ouvidoria.ufersa.edu.br/',
    icon: '📢',
    descricao: 'Canal de voz e manifestações dos discentes',
  },
];

export const ENDERECO_CAMPUS =
  'Campus Mossoró · Av. Francisco Mota, 572 · Bairro Costa e Silva · Mossoró/RN · CEP 59625-900';
