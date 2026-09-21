import React, { useState } from 'react';
import type { CategoriaOcorrencia, Usuario } from '../types';
import { validation } from '../utils/validation';
import { PinIcon } from '../components/PinIcon';

interface CreateOccurrencePageProps {
  currentUser: Usuario | null;
  defaultLocation?: string;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    categoria: CategoriaOcorrencia;
    local_bloco: string;
    id_solicitante: string;
    nome_solicitante: string;
    url_foto?: string;
  }) => void;
  onNavigateLogin: () => void;
  onNavigateMural: () => void;
}

const CATEGORIAS: CategoriaOcorrencia[] = ['Infraestrutura', 'Ensino', 'Suporte', 'Outro'];

const LOCAIS_PREDEFINIDOS = [
  'Bloco B — Sala 204',
  'Bloco A — Sala 12',
  'Bloco B — Sala 108',
  'Bloco C — Banheiro T1',
  'Coordenação — Bloco C',
  'Biblioteca Central',
  'Auditório Central',
  'Laboratório de Informática 01',
  'Laboratório de Informática 02',
  'Restaurante Universitário (RU)',
  'Outro Local',
];

export const CreateOccurrencePage: React.FC<CreateOccurrencePageProps> = ({
  currentUser,
  defaultLocation,
  onSubmit,
  onNavigateLogin,
  onNavigateMural,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaOcorrencia>('Infraestrutura');
  const [localBloco, setLocalBloco] = useState(defaultLocation || LOCAIS_PREDEFINIDOS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se não estiver logado, solicita login para identificar o solicitante
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">🔐</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Identificação Necessária</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            Para registrar uma ocorrência acadêmica ou de infraestrutura, é necessário estar autenticado
            no sistema com seu e-mail institucional.
          </p>
          <div className="space-y-2">
            <button
              onClick={onNavigateLogin}
              className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold py-2.5 px-4 rounded-lg cursor-pointer"
            >
              Fazer Login
            </button>
            <button
              onClick={onNavigateMural}
              className="w-full text-xs text-[#5A554A] hover:underline py-1.5 cursor-pointer"
            >
              Voltar ao Mural de Avisos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const localFinal =
      localBloco === 'Outro Local' ? customLocation.trim() : localBloco.trim();

    const validationResult = validation.validateOccurrence({
      titulo,
      descricao,
      categoria,
      local_bloco: localFinal,
    });

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      local_bloco: localFinal,
      id_solicitante: currentUser.id_usuario,
      nome_solicitante: currentUser.nome,
      url_foto: fotoPreview,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <button
        type="button"
        onClick={onNavigateMural}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3B32] hover:text-[#C1443A] mb-6 transition cursor-pointer"
      >
        <span>←</span> Voltar ao Mural
      </button>

      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-md p-6 sm:p-8 relative">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="border-b border-[#22201B]/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <PinIcon size={20} variant="dark" />
            <h2 className="font-display text-2xl font-bold text-[#1F3B32]">
              Registrar Nova Ocorrência
            </h2>
          </div>
          <p className="text-xs text-[#5A554A] mt-1">
            Relate um problema de infraestrutura, ensino ou suporte para a administração do campus
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Solicitante */}
          <div className="p-3 bg-[#EDE1CB]/50 border border-[#22201B]/10 rounded-lg text-xs text-[#5A554A] flex items-center justify-between">
            <span>
              Solicitante: <strong className="text-[#22201B]">{currentUser.nome}</strong> ({currentUser.cargo})
            </span>
            <span className="font-mono text-[11px] text-[#35577A]">{currentUser.email_institucional}</span>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Título Resumido do Problema <span className="text-[#C1443A]">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errors.titulo) setErrors((prev) => ({ ...prev, titulo: '' }));
              }}
              placeholder="Ex: Ar-condicionado não liga na sala 204"
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
              Categoria da Ocorrência <span className="text-[#C1443A]">*</span>
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

          {/* Local / Bloco */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Localização no Campus <span className="text-[#C1443A]">*</span>
            </label>
            <select
              value={localBloco}
              onChange={(e) => {
                setLocalBloco(e.target.value);
                if (errors.local_bloco) setErrors((prev) => ({ ...prev, local_bloco: '' }));
              }}
              className="w-full bg-[#EDE1CB]/40 border border-[#22201B]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] focus:outline-none focus:ring-1 focus:ring-[#1F3B32] transition mb-2"
            >
              {LOCAIS_PREDEFINIDOS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {localBloco === 'Outro Local' && (
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Especifique o prédio, bloco e número da sala..."
                className="w-full bg-[#EDE1CB]/40 border border-[#22201B]/20 rounded-lg px-3.5 py-2 text-sm text-[#22201B] focus:outline-none focus:ring-1 focus:ring-[#1F3B32]"
              />
            )}
            {errors.local_bloco && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.local_bloco}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Detalhamento da Ocorrência <span className="text-[#C1443A]">*</span>
            </label>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                if (errors.descricao) setErrors((prev) => ({ ...prev, descricao: '' }));
              }}
              placeholder="Descreva o que aconteceu, desde quando o problema persiste e qualquer detalhe relevante para a equipe de atendimento..."
              className={`w-full bg-[#EDE1CB]/40 border rounded-lg p-3 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.descricao
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.descricao && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1 flex items-center gap-1">
                <span>•</span> {errors.descricao}
              </p>
            )}
          </div>

          {/* Anexo de Foto */}
          <div>
            <label className="block text-xs font-semibold text-[#22201B] mb-1.5">
              Evidência Fotográfica (Opcional)
            </label>
            <div className="border-1.5 border-dashed border-[#1F3B32]/40 rounded-lg p-4 bg-[#EDE1CB]/30 text-center relative hover:bg-[#EDE1CB]/50 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {fotoPreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={fotoPreview}
                    alt="Pré-visualização"
                    className="max-h-36 rounded border border-[#22201B]/20 mb-2"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFotoPreview(undefined);
                    }}
                    className="text-xs text-[#C1443A] hover:underline cursor-pointer"
                  >
                    Remover imagem
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-2xl block mb-1">📷</span>
                  <p className="text-xs text-[#5A554A]">
                    Clique para anexar uma foto do local ou equipamento
                  </p>
                </>
              )}
            </div>
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
              className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Enviar Ocorrência</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
