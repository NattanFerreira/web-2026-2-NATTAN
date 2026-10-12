import React, { useState } from 'react';
import { PinIcon } from '../components/PinIcon';
import { startGoogleLogin } from '../services/ssoAuth';

interface LoginPageProps {
  onNavigateMural: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateMural }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  return (
    <div className="max-w-md mx-auto py-10 px-4 sm:px-6">
      <button
        type="button"
        onClick={onNavigateMural}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3B32] hover:text-[#C1443A] mb-6 transition cursor-pointer"
      >
        <span>←</span> Voltar ao Mural de Avisos
      </button>

      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-lg p-6 sm:p-8 relative">
        {/* Alfinete visual vermelho */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <PinIcon size={24} variant="dark" />
            <span className="font-display text-2xl font-bold text-[#1F3B32]">Quadro</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#22201B]">Autenticação</h2>
          <p className="text-xs text-[#5A554A] mt-1">
            Entre com sua conta Google institucional da UFERSA
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-5 p-3 bg-[#C1443A]/10 border border-[#C1443A]/40 text-[#C1443A] rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#22201B]/20 hover:border-[#1F3B32] hover:bg-[#FAF7F0] text-[#22201B] font-semibold text-xs py-2.5 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {isRedirecting ? 'Redirecionando para o Google...' : 'Entrar com Google'}
        </button>

        <p className="text-[11px] text-[#5A554A] text-center mt-4">
          Primeiro acesso? Sua conta de leitor é criada automaticamente ao entrar.
        </p>
      </div>
    </div>
  );
};
