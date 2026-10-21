import type { Usuario } from '../types';
import { storageService, isAdminEmail } from './storageService';

/**
 * Sessão local do usuário. A autenticação com Google é feita via
 * Amazon Cognito (ver ssoAuth.ts e pages/AuthCallbackPage.tsx); o cadastro
 * local (e-mail + senha) é validado aqui, com hash PBKDF2 + salt.
 *
 * Observação: não há backend de autenticação — os dados ficam no navegador
 * (localStorage). Serve para demonstração acadêmica.
 */

export const ALLOWED_DOMAINS = ((import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS as string) ?? '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export const isAllowedDomain = (email: string): boolean =>
  ALLOWED_DOMAINS.length === 0 || ALLOWED_DOMAINS.includes(email.toLowerCase().split('@')[1] ?? '');

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

async function hashSenha(senha: string, saltHex: string): Promise<string> {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);

export const authService = {
  /** Cadastro local de leitor. Nunca cria administradores. */
  async register(data: { nome: string; email: string; senha: string }): Promise<Usuario> {
    const email = data.email.toLowerCase().trim();
    if (data.nome.trim().length < 3) throw new Error('Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.');
    if (!isAllowedDomain(email)) throw new Error('Use seu e-mail institucional da UFERSA.');
    if (isAdminEmail(email))
      throw new Error('Este e-mail é de administrador. Use o botão "Entrar com Google".');
    if (data.senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');

    const salt = newSalt();
    const hash = await hashSenha(data.senha, salt);
    const user = storageService.addUsuario({
      nome: data.nome,
      email_institucional: email,
      cargo: '',
      senha_hash: hash,
      senha_salt: salt,
      provedor: 'local',
    });
    storageService.setGuest(false);
    storageService.setCurrentUser(user);
    return user;
  },

  /** Login local com e-mail e senha. */
  async login(emailRaw: string, senha: string): Promise<Usuario> {
    const email = emailRaw.toLowerCase().trim();
    const generic = new Error('E-mail ou senha incorretos.');
    if (isAdminEmail(email))
      throw new Error('Administradores devem entrar com o botão "Entrar com Google".');

    const user = storageService.getUsuarioByEmail(email);
    if (!user || !user.senha_hash || !user.senha_salt) throw generic;
    if ((await hashSenha(senha, user.senha_salt)) !== user.senha_hash) throw generic;
    if (user.bloqueado) throw new Error('Esta conta foi bloqueada pelo administrador.');

    storageService.setGuest(false);
    storageService.setCurrentUser(user);
    return user;
  },

  /** Entra como visitante (somente leitura, sem conta). */
  enterAsGuest(): void {
    storageService.setCurrentUser(null);
    storageService.setGuest(true);
  },

  /** Encerra a sessão local. Use junto com cognitoLogout() para sair também do Cognito. */
  logout(): void {
    storageService.setCurrentUser(null);
    storageService.setGuest(false);
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
