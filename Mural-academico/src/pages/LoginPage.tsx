import React, { useState } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services/authService';
import { validation } from '../utils/validation';
import { PinIcon } from '../components/PinIcon';

interface LoginPageProps {
  onSuccess: (user: Usuario) => void;
  onNavigateRegister: () => void;
  onNavigateMural: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateRegister,
  onNavigateMural,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = validation.validateLogin({ email, senha });
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = authService.login({ email, senha });
      onSuccess(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Falha na autenticação. Verifique suas credenciais.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preenchimento rápido para avaliação
  const handleQuickFill = (quickEmail: string, quickSenha: string) => {
    setEmail(quickEmail);
    setSenha(quickSenha);
    setErrors({});
    setServerError(null);
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
            Acesse o sistema com suas credenciais acadêmicas ou institucionais
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3 bg-[#C1443A]/10 border border-[#C1443A]/40 text-[#C1443A] rounded-lg text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              E-mail Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
                if (serverError) setServerError(null);
              }}
              placeholder="exemplo@ufersa.edu.br"
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.email
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#22201B]">Senha</label>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (errors.senha) {
                  setErrors((prev) => ({ ...prev, senha: '' }));
                }
                if (serverError) setServerError(null);
              }}
              placeholder="Digite sua senha de acesso"
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.senha
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.senha && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.senha}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5A554A] pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded text-[#1F3B32] focus:ring-[#1F3B32]"
              />
              <span>Exibir senha</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] font-semibold text-xs py-2.5 rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Linha divisória */}
        <div className="relative my-6 border-t border-[#22201B]/15">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF7F0] px-3 text-[11px] text-[#5A554A]">
            ou
          </span>
        </div>

        {/* Cadastro de novo leitor */}
        <div className="text-center mb-6">
          <p className="text-xs text-[#5A554A] mb-2">Ainda não possui cadastro?</p>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="w-full border-1.5 border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32]/10 font-semibold text-xs py-2 rounded-lg transition cursor-pointer"
          >
            Cadastrar-se como Leitor / Discente
          </button>
        </div>

        {/* Atalhos para avaliação / demonstração */}
        <div className="bg-[#EDE1CB]/50 border border-[#22201B]/15 rounded-lg p-3.5 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#1F3B32] flex items-center gap-1.5">
              <span>⚡</span> Contas configuradas no código:
            </span>
            <span className="text-[10px] text-[#5A554A] uppercase tracking-wider font-mono">
              Clique para preencher
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickFill('renato.docente@ufersa.edu.br', 'admin123')}
              className="w-full text-left p-2 rounded bg-[#FAF7F0] hover:bg-[#FAF7F0]/80 border border-[#22201B]/10 flex items-center justify-between group transition cursor-pointer"
            >
              <div>
                <span className="font-semibold text-[#1F3B32] block">Prof. Renato</span>
                <span className="text-[11px] text-[#5A554A]">
                  renato.docente@ufersa.edu.br · (senha: admin123)
                </span>
              </div>
              <span className="text-[10px] font-bold font-mono bg-[#1F3B32] text-[#FAF7F0] px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('luiza.martins@ufersa.edu.br', 'aluno123')}
              className="w-full text-left p-2 rounded bg-[#FAF7F0] hover:bg-[#FAF7F0]/80 border border-[#22201B]/10 flex items-center justify-between group transition cursor-pointer"
            >
              <div>
                <span className="font-semibold text-[#1F3B32] block">Luiza Martins</span>
                <span className="text-[11px] text-[#5A554A]">
                  luiza.martins@ufersa.edu.br · (senha: aluno123)
                </span>
              </div>
              <span className="text-[10px] font-bold font-mono bg-[#35577A] text-[#FAF7F0] px-1.5 py-0.5 rounded">
                LEITOR
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

