import React, { useState } from 'react';
import type { CategoriaAviso, Usuario } from '../types';
import { validation } from '../utils/validation';
import { PinIcon } from '../components/PinIcon';

interface CreateNoticePageProps {
  currentUser: Usuario | null;
  onSubmit: (data: {
    titulo: string;
    conteudo: string;
    categoria: CategoriaAviso;
    local_bloco: string;
    id_autor: string;
    nome_autor: string;
    nome_anexo?: string;
    tamanho_anexo?: string;
  }) => void;
  onNavigateLogin: () => void;
  onNavigateMural: () => void;
}

const CATEGORIAS: CategoriaAviso[] = ['Ensino', 'Infraestrutura', 'Editais', 'Eventos'];

export const CreateNoticePage: React.FC<CreateNoticePageProps> = ({
  currentUser,
  onSubmit,
  onNavigateLogin,
  onNavigateMural,
}) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaAviso>('Ensino');
  const [localBloco, setLocalBloco] = useState('Coordenação — Bloco C');
  const [anexoNome, setAnexoNome] = useState<string | undefined>(undefined);
  const [anexoTamanho, setAnexoTamanho] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proteção de rota administrativa
  if (!currentUser || currentUser.perfil !== 'ADMINISTRADOR') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#C1443A]/30 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">🔒</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Acesso Restrito</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            Apenas usuários com perfil <strong>Administrador / Publicador</strong> autenticados podem
            criar novos comunicados institucionais.
          </p>
          <div className="space-y-2">
            <button
              onClick={onNavigateLogin}
              className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold py-2.5 px-4 rounded-lg cursor-pointer"
            >
              Fazer Login como Administrador
            </button>
            <button
              onClick={onNavigateMural}
              className="w-full text-xs text-[#5A554A] hover:underline py-1.5 cursor-pointer"
            >
              Voltar ao Mural Público
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrors((prev) => ({ ...prev, anexo: 'Apenas arquivos em formato PDF são permitidos.' }));
        return;
      }
      setErrors((prev) => {
        const u = { ...prev };
        delete u.anexo;
        return u;
      });
      setAnexoNome(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAnexoTamanho(`${sizeMB} MB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validation.validateNotice({
      titulo,
      conteudo,
      categoria,
      local_bloco: localBloco,
      anexoNome,
    });

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      categoria,
      local_bloco: localBloco.trim(),
      id_autor: currentUser.id_usuario,
      nome_autor: `${currentUser.nome} (${currentUser.cargo})`,
      nome_anexo: anexoNome,
      tamanho_anexo: anexoTamanho,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <button
        type="button"
        onClick={onNavigateMural}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3B32] hover:text-[#C1443A] mb-6 transition cursor-pointer"
      >
        <span>←</span> Voltar ao Mural de Avisos
      </button>

      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-md p-6 sm:p-8 relative">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#22201B]/10 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <PinIcon size={20} variant="dark" />
              <h2 className="font-display text-2xl font-bold text-[#1F3B32]">
                Publicar Novo Aviso Institucional
              </h2>
            </div>
            <p className="text-xs text-[#5A554A] mt-1">
              O aviso será fixado imediatamente no mural acadêmico da instituição
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#1F3B32] text-[#FAF7F0] px-2 py-1 rounded">
            ADMINISTRADOR
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Título */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#22201B]">
                Título do Comunicado <span className="text-[#C1443A]">*</span>
              </label>
              <span className="text-[11px] text-[#5A554A]">{titulo.length}/120</span>
            </div>
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errors.titulo) {
                  setErrors((prev) => ({ ...prev, titulo: '' }));
                }
              }}
              placeholder="Ex: Edital de Seleção de Monitoria 2026.2"
              maxLength={120}
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.titulo
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.titulo && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.titulo}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-2">
              Categoria <span className="text-[#C1443A]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition cursor-pointer ${
                    categoria === cat
                      ? 'bg-[#1F3B32] text-[#FAF7F0] border-[#1F3B32]'
                      : 'bg-transparent text-[#5A554A] border-[#22201B]/20 hover:border-[#1F3B32]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Setor / Bloco */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Setor ou Bloco Responsável <span className="text-[#C1443A]">*</span>
            </label>
            <input
              type="text"
              value={localBloco}
              onChange={(e) => {
                setLocalBloco(e.target.value);
                if (errors.local_bloco) {
                  setErrors((prev) => ({ ...prev, local_bloco: '' }));
                }
              }}
              placeholder="Ex: Coordenação de Engenharia — Bloco C"
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.local_bloco
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.local_bloco && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.local_bloco}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Conteúdo Completo do Comunicado <span className="text-[#C1443A]">*</span>
            </label>
            <textarea
              rows={6}
              value={conteudo}
              onChange={(e) => {
                setConteudo(e.target.value);
                if (errors.conteudo) {
                  setErrors((prev) => ({ ...prev, conteudo: '' }));
                }
              }}
              placeholder="Descreva as informações, prazos, orientações e público-alvo com clareza..."
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg p-3 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.conteudo
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.conteudo && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.conteudo}
              </p>
            )}
          </div>

          {/* Anexo em PDF */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Anexo Oficial em PDF (Persistência no Amazon S3)
            </label>
            <div className="border-1.5 border-dashed border-[#1F3B32]/40 rounded-lg p-4 bg-[#EDE1CB]/30 text-center relative hover:bg-[#EDE1CB]/50 transition">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-2xl block mb-1">📎</span>
              {anexoNome ? (
                <div className="text-xs font-semibold text-[#1F3B32]">
                  <span>{anexoNome}</span> {anexoTamanho && `(${anexoTamanho})`}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnexoNome(undefined);
                      setAnexoTamanho(undefined);
                    }}
                    className="ml-2 text-[#C1443A] hover:underline cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#5A554A]">
                  Arraste o arquivo PDF do edital/comunicado ou clique para selecionar
                </p>
              )}
            </div>
            {errors.anexo && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.anexo}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#22201B]/10">
            <button
              type="button"
              onClick={onNavigateMural}
              className="text-xs font-semibold text-[#5A554A] hover:text-[#22201B] px-4 py-2 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>📌</span>
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Aviso no Mural'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
