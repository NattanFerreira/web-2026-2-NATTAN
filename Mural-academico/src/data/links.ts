export interface LinkUtil {
  label: string;
  href: string;
  icon: string;
  /** Texto curto para o rodapé */
  descricao: string;
  download?: boolean;
}

export const LINKS_UTEIS: LinkUtil[] = [
  {
    label: 'Portal UFERSA',
    href: 'https://ufersa.edu.br/',
    icon: '🏛️',
    descricao: 'Site oficial da universidade',
  },
  {
    label: 'SIGAA',
    href: 'https://sso.ufersa.edu.br/sso-server/login',
    icon: '🎓',
    descricao: 'Matrícula, notas e turmas',
  },
  {
    label: 'Restaurante Universitário',
    href: 'https://ru.ufersa.edu.br/',
    icon: '🍽️',
    descricao: 'Cardápio e informações do RU',
  },
  {
    label: 'Calendário Acadêmico',
    href: '/calendario-academico.pdf',
    icon: '📅',
    descricao: 'Datas e prazos do semestre (PDF)',
    download: true,
  },
  {
    label: 'Biblioteca',
    href: 'https://biblioteca.ufersa.edu.br/',
    icon: '📚',
    descricao: 'Acervo, empréstimos e salas de estudo',
  },
];

export const ENDERECO_CAMPUS = 'Campus Mossoró · Av. Francisco Mota, 572 · Costa e Silva · Mossoró/RN · CEP 59625-900';
