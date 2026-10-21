import React, { useState } from 'react';
import { PinIcon } from '../components/PinIcon';
import { startGoogleLogin } from '../services/ssoAuth';
import { authService } from '../services/authService';
import type { Usuario } from '../types';

interface LoginPageProps {
  onAuthenticated: (user: Usuario) => void;
  onGuest: () => void;
}

type Modo = 'entrar' | 'cadastrar';

const inputCls =
  'w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32] focus:ring-2 focus:ring-[#1F3B32]/20';

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated, onGuest }) => {
  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trocarModo = (m: Modo) => {
    setModo(m);
    setServerError(null);
  };

  // Login com Google (via Amazon Cognito)
  const handleGoogleLogin = async () => {
    setServerError(null);
    setIsRedirecting(true);
    try {
      await startGoogleLogin(); // redireciona o navegador para o Cognito/Google
    } catch {
      setIsRedirecting(false);
      setServerError(
        'Não foi possível iniciar o login com Google. Verifique a configuração e tente novamente.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (modo === 'cadastrar' && senha !== confirma) {
      setServerError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user =
        modo === 'entrar'
          ? await authService.login(email, senha)
          : await authService.register({ nome, email, senha });
      onAuthenticated(user);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 sm:px-6">
      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-lg p-6 sm:p-8 relative">
        {/* Alfinete visual vermelho */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="text-center mb-5 pt-2">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <PinIcon size={24} variant="dark" />
            <span className="font-display text-2xl font-bold text-[#1F3B32]">Quadro</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#22201B]">
            {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="text-xs text-[#5A554A] mt-1">
            {modo === 'entrar'
              ? 'Acesse para comentar e interagir nos avisos'
              : 'Cadastre-se com seu e-mail institucional da UFERSA'}
          </p>
        </div>

        {/* Alternância Entrar / Cadastrar */}
        <div role="tablist" className="grid grid-cols-2 gap-1 bg-[#EDE1CB]/70 rounded-lg p-1 mb-5">
          {(['entrar', 'cadastrar'] as Modo[]).map((m) => (
            <button
              key={m}
              id={`tab-${m}`}
              type="button"
              role="tab"
              aria-selected={modo === m}
              onClick={() => trocarModo(m)}
              className={`text-xs font-semibold py-1.5 rounded-md transition cursor-pointer ${
                modo === m ? 'bg-[#1F3B32] text-[#FAF7F0] shadow-sm' : 'text-[#1F3B32] hover:bg-white/60'
              }`}
            >
              {m === 'entrar' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[#C1443A]/10 border border-[#C1443A]/40 text-[#C1443A] rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {modo === 'cadastrar' && (
            <div>
              <label htmlFor="login-nome" className="block text-[11px] font-semibold text-[#5A554A] mb-1">
                Nome completo
              </label>
              <input
                id="login-nome"
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-[11px] font-semibold text-[#5A554A] mb-1">
              E-mail institucional
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="voce@alunos.ufersa.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label htmlFor="login-senha" className="block text-[11px] font-semibold text-[#5A554A] mb-1">
              Senha
            </label>
            <input
              id="login-senha"
              type="password"
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          {modo === 'cadastrar' && (
            <div>
              <label htmlFor="login-confirma" className="block text-[11px] font-semibold text-[#5A554A] mb-1">
                Confirmar senha
              </label>
              <input
                id="login-confirma"
                type="password"
                autoComplete="new-password"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          )}
          <button
            id="login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold py-2.5 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <span className="flex-1 h-px bg-[#22201B]/15" />
          <span className="text-[10px] uppercase tracking-wider text-[#5A554A] font-mono">ou</span>
          <span className="flex-1 h-px bg-[#22201B]/15" />
        </div>

        <button
          id="login-google"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#22201B]/20 hover:border-[#1F3B32] hover:bg-[#FAF7F0] text-[#22201B] font-semibold text-xs py-2.5 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {isRedirecting ? 'Redirecionando para o Google...' : 'Entrar com Google'}
        </button>

        <button
          id="login-visitante"
          type="button"
          onClick={onGuest}
          className="w-full mt-3 text-xs font-semibold text-[#1F3B32] border border-dashed border-[#1F3B32]/50 hover:bg-[#1F3B32]/5 py-2.5 rounded-lg transition cursor-pointer"
        >
          👁️ Continuar como visitante
        </button>
        <p className="text-[11px] text-[#5A554A] text-center mt-2">
          Visitantes apenas leem os murais e os comentários.
        </p>
      </div>
    </div>
  );
};
