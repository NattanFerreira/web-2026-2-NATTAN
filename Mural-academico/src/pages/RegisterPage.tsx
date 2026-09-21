import React, { useState } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services/authService';
import { validation } from '../utils/validation';
import { PinIcon } from '../components/PinIcon';

interface RegisterPageProps {
  onSuccess: (user: Usuario) => void;
  onNavigateLogin: () => void;
  onNavigateMural: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateMural,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email_institucional: '',
    cargo: 'Discente · Ciência da Computação',
    senha: '',
    confirmarSenha: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo alterado
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = validation.validateRegistration(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const novoUsuario = authService.register({
        nome: formData.nome,
        email_institucional: formData.email_institucional,
        cargo: formData.cargo,
        senha: formData.senha,
      });

      onSuccess(novoUsuario);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      {/* Retornar ao mural */}
      <button
        type="button"
        onClick={onNavigateMural}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3B32] hover:text-[#C1443A] mb-6 transition cursor-pointer"
      >
        <span>←</span> Voltar ao Mural de Avisos
      </button>

      {/* Card principal com o estilo do Quadro */}
      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-lg p-6 sm:p-8 relative">
        {/* Alfinete visual */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Cabeçalho do formulário */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <PinIcon size={24} variant="dark" />
            <span className="font-display text-2xl font-bold text-[#1F3B32]">Quadro</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#22201B]">
            Cadastro de Novo Usuário
          </h2>
          <p className="text-xs text-[#5A554A] mt-1">
            Crie sua conta para consultar comunicados e registrar ocorrências no campus
          </p>
        </div>

        {/* Aviso de regra de perfil institucional */}
        <div className="mb-6 p-3.5 bg-[#EDE1CB]/70 border border-[#1F3B32]/20 rounded-lg text-xs text-[#1F3B32] flex items-start gap-2.5">
          <span className="text-[#C1443A] text-sm shrink-0">ℹ️</span>
          <div>
            <span className="font-semibold block">Perfil de Acesso: Leitor / Discente</span>
            <p className="text-[#5A554A] mt-0.5 leading-relaxed">
              O formulário público cadastra usuários com perfil <strong>Leitor</strong>. Contas com
              perfil de <strong>Administrador</strong> são pré-configuradas diretamente no código
              institucional e acessam via login.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mb-5 p-3 bg-[#C1443A]/10 border border-[#C1443A]/40 text-[#C1443A] rounded-lg text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nome completo */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Nome Completo <span className="text-[#C1443A]">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Luiza Martins Santos"
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.nome
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.nome && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.nome}
              </p>
            )}
          </div>

          {/* E-mail institucional */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              E-mail Institucional ou Acadêmico <span className="text-[#C1443A]">*</span>
            </label>
            <input
              type="email"
              value={formData.email_institucional}
              onChange={(e) => handleChange('email_institucional', e.target.value)}
              placeholder="exemplo@ufersa.edu.br"
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.email_institucional
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.email_institucional && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.email_institucional}
              </p>
            )}
            <p className="text-[10.5px] text-[#5A554A] mt-1">
              Preferencialmente utilize seu endereço institucional (.edu.br).
            </p>
          </div>

          {/* Curso / Cargo */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Curso / Vínculo com a Instituição <span className="text-[#C1443A]">*</span>
            </label>
            <select
              value={formData.cargo}
              onChange={(e) => handleChange('cargo', e.target.value)}
              className="w-full bg-[#EDE1CB]/40 border border-[#22201B]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] focus:outline-none focus:ring-1 focus:ring-[#1F3B32] transition"
            >
              <option value="Discente · Ciência da Computação">Discente · Ciência da Computação</option>
              <option value="Discente · Engenharia de Software">Discente · Engenharia de Software</option>
              <option value="Discente · Engenharia Mecânica">Discente · Engenharia Mecânica</option>
              <option value="Discente · Engenharia de Produção">Discente · Engenharia de Produção</option>
              <option value="Discente · Agronomia">Discente · Agronomia</option>
              <option value="Discente · Medicina Veterinária">Discente · Medicina Veterinária</option>
              <option value="Discente · Pós-Graduação">Discente · Pós-Graduação</option>
              <option value="Comunidade Acadêmica / Outro">Comunidade Acadêmica / Outro</option>
            </select>
          </div>

          {/* Senha e confirmação de senha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
                Senha de Acesso <span className="text-[#C1443A]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => handleChange('senha', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                    errors.senha
                      ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                      : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
                  }`}
                />
              </div>
              {errors.senha && (
                <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                  <span>•</span> {errors.senha}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
                Confirmar Senha <span className="text-[#C1443A]">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                placeholder="Repita sua senha"
                className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                  errors.confirmarSenha
                    ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                    : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
                }`}
              />
              {errors.confirmarSenha && (
                <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                  <span>•</span> {errors.confirmarSenha}
                </p>
              )}
            </div>
          </div>

          {/* Opção de visualizar senha */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="show-pw"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded text-[#1F3B32] focus:ring-[#1F3B32] cursor-pointer"
            />
            <label htmlFor="show-pw" className="text-xs text-[#5A554A] cursor-pointer select-none">
              Visualizar senhas digitadas
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-medium text-[#35577A] hover:underline cursor-pointer order-2 sm:order-1"
            >
              Já possui conta? Acesse via Login
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Cadastrando...' : 'Concluir Cadastro de Leitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

