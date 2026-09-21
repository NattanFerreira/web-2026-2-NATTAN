import type { Usuario } from '../types';
import { storageService } from './storageService';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email_institucional: string;
  cargo: string;
  senha: string;
}

export const authService = {
  /**
   * Realiza login no sistema.
   * Administrador autentica com as credenciais cadastradas diretamente no código.
   * Leitores autenticam com seus e-mails e senhas cadastrados.
   */
  login({ email, senha }: LoginCredentials): Usuario {
    const cleanEmail = email.toLowerCase().trim();
    const user = storageService.getUsuarioByEmail(cleanEmail);

    if (!user) {
      throw new Error('E-mail institucional não encontrado no sistema.');
    }

    // Validação da senha
    const expectedPassword = user.senha || (user.perfil === 'ADMINISTRADOR' ? 'admin123' : 'aluno123');
    if (senha !== expectedPassword) {
      throw new Error('Senha incorreta para o usuário informado.');
    }

    storageService.setCurrentUser(user);
    return user;
  },

  /**
   * Realiza o cadastro de um novo usuário.
   * REGRA DE NEGÓCIO MANDATÓRIA:
   * Usuários cadastrados via formulário SEMPRE recebem perfil LEITOR.
   * Administradores NÃO podem ser cadastrados via formulário público;
   * eles são definidos diretamente no código-fonte.
   */
  register(data: RegisterData): Usuario {
    const cleanEmail = data.email_institucional.toLowerCase().trim();

    // Impede tentativa de registrar conta administrativa via formulário
    if (cleanEmail === 'admin@ufersa.edu.br' || cleanEmail.includes('admin.')) {
      throw new Error(
        'Contas administrativas são restritas e não podem ser criadas via formulário público.'
      );
    }

    const novo = storageService.addUsuario({
      nome: data.nome,
      email_institucional: cleanEmail,
      cargo: data.cargo,
      senha: data.senha,
    });

    // Inicia sessão com o novo usuário
    storageService.setCurrentUser(novo);
    return novo;
  },

  /**
   * Encerra a sessão do usuário.
   */
  logout(): void {
    storageService.setCurrentUser(null);
  },

  /**
   * Retorna o usuário autenticado atualmente.
   */
  getCurrentUser(): Usuario | null {
    return storageService.getCurrentUser();
  },

  /**
   * Verifica se há usuário autenticado.
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /**
   * Verifica se o usuário possui perfil de Administrador.
   */
  isAdmin(user?: Usuario | null): boolean {
    const target = user !== undefined ? user : authService.getCurrentUser();
    return target?.perfil === 'ADMINISTRADOR';
  },
};
