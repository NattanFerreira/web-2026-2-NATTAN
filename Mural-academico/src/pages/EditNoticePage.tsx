import React, { useState, useEffect } from 'react';
import type { Aviso, CategoriaAviso, Usuario } from '../types';
import { validation } from '../utils/validation';
import { PinIcon } from '../components/PinIcon';

interface EditNoticePageProps {
  avisoId: string;
  currentUser: Usuario | null;
  getAviso: (id: string) => Promise<Aviso | undefined> | Aviso | undefined;
  onSubmit: (id: string, data: Partial<Aviso>) => Promise<void>;
  onNavigateLogin: () => void;
  onNavigateMural: () => void;
}

const CATEGORIAS: CategoriaAviso[] = ['Ensino', 'Infraestrutura', 'Editais', 'Eventos'];

export const EditNoticePage: React.FC<EditNoticePageProps> = ({
  avisoId,
  currentUser,
  getAviso,
  onSubmit,
  onNavigateLogin,
  onNavigateMural,
}) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaAviso>('Ensino');
  const [localBloco, setLocalBloco] = useState('');
  const [anexoNome, setAnexoNome] = useState<string | undefined>(undefined);
  const [anexoUrl, setAnexoUrl] = useState<string | undefined>(undefined);
  const [anexoTamanho, setAnexoTamanho] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega os dados atuais do aviso
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const aviso = await getAviso(avisoId);
      if (isMounted && aviso) {
        setTitulo(aviso.titulo);
        setConteudo(aviso.conteudo);
        setCategoria(aviso.categoria);
        setLocalBloco(aviso.local_bloco);
        setAnexoNome(aviso.nome_anexo);
        setAnexoUrl(aviso.url_anexo);
        setAnexoTamanho(aviso.tamanho_anexo);
      }
      if (isMounted) setIsLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [avisoId, getAviso]);

  // Bloqueio de rota restrita para Administrador
  if (!currentUser || currentUser.perfil !== 'ADMINISTRADOR') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#C1443A]/30 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">🔒</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Acesso Restrito</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            Apenas administradores autenticados podem editar comunicados institucionais.
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

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-[#5A554A]">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-xs">Carregando dados do comunicado...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      await onSubmit(avisoId, {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        categoria,
        local_bloco: localBloco.trim(),
        nome_anexo: anexoNome,
        url_anexo: anexoUrl,
        tamanho_anexo: anexoTamanho,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar comunicado.');
    } finally {
      setIsSubmitting(false);
    }
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
                Editar Comunicado Institucional
              </h2>
            </div>
            <p className="text-xs text-[#5A554A] mt-1">
              Atualize as informações, prazos ou retifique o aviso publicado
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#1F3B32] text-[#FAF7F0] px-2 py-1 rounded">
            EDIÇÃO
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
                if (errors.titulo) setErrors((prev) => ({ ...prev, titulo: '' }));
              }}
              maxLength={120}
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] focus:outline-none focus:ring-1 transition ${
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
                if (errors.local_bloco) setErrors((prev) => ({ ...prev, local_bloco: '' }));
              }}
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] focus:outline-none focus:ring-1 transition ${
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
                if (errors.conteudo) setErrors((prev) => ({ ...prev, conteudo: '' }));
              }}
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg p-3 text-sm text-[#22201B] focus:outline-none focus:ring-1 transition ${
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

          {/* Anexo atual */}
          {anexoNome && (
            <div className="bg-[#EDE1CB]/60 border border-[#1F3B32]/20 rounded-lg p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>📎</span>
                <span className="font-semibold text-[#1F3B32]">{anexoNome}</span>
                {anexoTamanho && <span className="text-[#5A554A]">({anexoTamanho})</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnexoNome(undefined);
                  setAnexoUrl(undefined);
                  setAnexoTamanho(undefined);
                }}
                className="text-[#C1443A] hover:underline cursor-pointer"
              >
                Remover anexo
              </button>
            </div>
          )}

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
              className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>💾</span>
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

