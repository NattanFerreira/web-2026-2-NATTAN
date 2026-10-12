/**
 * Utilitários de validação de formulários do Quadro
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validation = {
  /**
   * Valida formato de e-mail
   */
  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validação do formulário de Publicação de Avisos (Admin)
   */
  validateNotice(data: {
    titulo: string;
    conteudo: string;
    categoria: string;
    local_bloco: string;
    anexoNome?: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.titulo.trim()) {
      errors.titulo = 'O título do aviso é obrigatório.';
    } else if (data.titulo.trim().length < 5) {
      errors.titulo = 'O título deve ter pelo menos 5 caracteres.';
    } else if (data.titulo.trim().length > 120) {
      errors.titulo = 'O título não pode exceder 120 caracteres.';
    }

    if (!data.conteudo.trim()) {
      errors.conteudo = 'O conteúdo detalhado do comunicado é obrigatório.';
    } else if (data.conteudo.trim().length < 15) {
      errors.conteudo = 'O conteúdo deve ter pelo menos 15 caracteres para clareza.';
    }

    if (!data.categoria) {
      errors.categoria = 'Selecione a categoria do aviso.';
    }

    if (!data.local_bloco.trim()) {
      errors.local_bloco = 'Informe o local ou setor responsável (ex: Bloco C / Coordenação).';
    }

    if (data.anexoNome && !data.anexoNome.toLowerCase().endsWith('.pdf')) {
      errors.anexo = 'Apenas arquivos com extensão .pdf são aceitos.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validação do formulário de Registro de Ocorrência (Leitor)
   */
  validateOccurrence(data: {
    titulo: string;
    descricao: string;
    categoria: string;
    local_bloco: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.titulo.trim()) {
      errors.titulo = 'O título da ocorrência é obrigatório.';
    } else if (data.titulo.trim().length < 5) {
      errors.titulo = 'O título deve ter pelo menos 5 caracteres.';
    }

    if (!data.descricao.trim()) {
      errors.descricao = 'Descreva a ocorrência em detalhes.';
    } else if (data.descricao.trim().length < 10) {
      errors.descricao = 'A descrição deve ter pelo menos 10 caracteres.';
    }

    if (!data.categoria) {
      errors.categoria = 'Selecione uma categoria válida.';
    }

    if (!data.local_bloco.trim()) {
      errors.local_bloco = 'Informe a localização exata da ocorrência (bloco, sala ou setor).';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

