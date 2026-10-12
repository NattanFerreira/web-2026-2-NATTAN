import type { Usuario } from '../types';
import { storageService } from './storageService';

/**
 * Sessão local do usuário. A autenticação em si é feita pelo Google via
 * Amazon Cognito (ver ssoAuth.ts e pages/AuthCallbackPage.tsx).
 */
export const authService = {
  /** Encerra a sessão local. Use junto com cognitoLogout() para sair também do Cognito. */
  logout(): void {
    storageService.setCurrentUser(null);
  },

  /** Retorna o usuário autenticado atualmente (ou null). */
  getCurrentUser(): Usuario | null {
    return storageService.getCurrentUser();
  },

  /** Verifica se há usuário autenticado. */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /** Verifica se o usuário possui perfil de Administrador. */
  isAdmin(user?: Usuario | null): boolean {
    const target = user !== undefined ? user : authService.getCurrentUser();
    return target?.perfil === 'ADMINISTRADOR';
  },
};
