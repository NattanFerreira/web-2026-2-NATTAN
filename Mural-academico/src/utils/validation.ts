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
   * Valida se é um e-mail institucional aceito (.edu.br, .br, etc)
   */
  isInstitutionalEmail(email: string): boolean {
    const clean = email.toLowerCase().trim();
    return this.isValidEmail(clean) && (clean.includes('.edu') || clean.includes('@ufersa') || clean.endsWith('.br'));
  },

  /**
   * Validação do formulário de Cadastro de Usuário (Leitor)
   */
  validateRegistration(data: {
    nome: string;
    email_institucional: string;
    cargo: string;
    senha: string;
    confirmarSenha: string;
    termosAceitos?: boolean;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    // Validação do nome
    const nomeLimpo = data.nome.trim();
    if (!nomeLimpo) {
      errors.nome = 'O nome completo é obrigatório.';
    } else if (nomeLimpo.length < 3) {
      errors.nome = 'O nome deve conter pelo menos 3 caracteres.';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/.test(nomeLimpo)) {
      errors.nome = 'O nome deve conter apenas letras e espaços.';
    }

    // Validação do e-mail institucional
    const emailLimpo = data.email_institucional.trim().toLowerCase();
    if (!emailLimpo) {
      errors.email_institucional = 'O e-mail institucional é obrigatório.';
    } else if (!this.isValidEmail(emailLimpo)) {
      errors.email_institucional = 'Informe um endereço de e-mail válido (ex: nome@instituicao.edu.br).';
    }

    // Validação do cargo/curso
    if (!data.cargo.trim()) {
      errors.cargo = 'Informe seu curso ou vínculo institucional (ex: Discente · Computação).';
    }

    // Validação de senha
    if (!data.senha) {
      errors.senha = 'A senha de acesso é obrigatória.';
    } else if (data.senha.length < 6) {
      errors.senha = 'A senha deve conter pelo menos 6 caracteres.';
    }

    // Confirmação de senha
    if (!data.confirmarSenha) {
      errors.confirmarSenha = 'Por favor, confirme sua senha.';
    } else if (data.senha !== data.confirmarSenha) {
      errors.confirmarSenha = 'As senhas digitadas não coincidem.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validação do formulário de Login
   */
  validateLogin(data: { email: string; senha: string }): ValidationResult {
    const errors: Record<string, string> = {};

    const emailLimpo = data.email.trim();
    if (!emailLimpo) {
      errors.email = 'Informe seu e-mail institucional.';
    } else if (!this.isValidEmail(emailLimpo)) {
      errors.email = 'Formato de e-mail inválido.';
    }

    if (!data.senha) {
      errors.senha = 'Informe sua senha de acesso.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
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

