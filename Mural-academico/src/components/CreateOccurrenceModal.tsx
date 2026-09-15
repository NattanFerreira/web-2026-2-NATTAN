import React, { useState } from 'react';
import type { CategoriaOcorrencia, Usuario } from '../types';

interface CreateOccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
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
}

const CATEGORIAS_OCORRENCIA: CategoriaOcorrencia[] = [
  'Infraestrutura',
  'Ensino',
  'Suporte',
  'Outro',
];

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
  'Outro Local',
];

export const CreateOccurrenceModal: React.FC<CreateOccurrenceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultLocation,
  onSubmit,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaOcorrencia>('Infraestrutura');
  const [localBloco, setLocalBloco] = useState(defaultLocation || LOCAIS_PREDEFINIDOS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

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
    if (!titulo.trim() || !descricao.trim()) {
      alert('Por favor, informe o título e a descrição da ocorrência.');
      return;
    }

    const finalLocation = localBloco === 'Outro Local' ? customLocation.trim() || 'Campus Central' : localBloco;

    onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      local_bloco: finalLocation,
      id_solicitante: currentUser.id_usuario,
      nome_solicitante: currentUser.nome,
      url_foto: fotoPreview,
    });

    // Reset
    setTitulo('');
    setDescricao('');
    setFotoPreview(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3B32]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#22201B]/20 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topbar */}
        <div className="bg-[#1F3B32] text-[#FAF7F0] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FAF7F0]/80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C1443A]" />
            <span>mural.ufersa.edu.br/ocorrencias/nova</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] text-lg font-bold p-1 leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-4.5 bg-[#FAF7F0]">
          <div className="text-center pb-2 border-b border-[#22201B]/10">
            <h2 className="font-display text-2xl font-bold text-[#1F3B32]">
              Registrar ocorrência
            </h2>
            <p className="text-xs text-[#5A554A] mt-1">
              Relate um problema de infraestrutura, ensino ou suporte encontrado no campus.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Título da Ocorrência *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Ar-condicionado quebrado na sala 204"
              className="w-full bg-[#EDE1CB]/60 border border-[#22201B]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:border-[#1F3B32] focus:ring-1 focus:ring-[#1F3B32]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Descrição Detalhada *
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que está acontecendo, impacto e desde quando..."
              rows={4}
              className="w-full bg-[#EDE1CB]/60 border border-[#22201B]/20 rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:border-[#1F3B32] focus:ring-1 focus:ring-[#1F3B32]"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_OCORRENCIA.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                    categoria === cat
                      ? 'border-[#C1443A] text-[#C1443A] bg-[#C1443A]/10 font-bold'
                      : 'border-[#22201B]/20 text-[#5A554A] hover:bg-[#EDE1CB]/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Local / Bloco
            </label>
            <select
              value={localBloco}
              onChange={(e) => setLocalBloco(e.target.value)}
              className="w-full bg-[#EDE1CB]/60 border border-[#22201B]/20 rounded-lg px-3 py-2 text-sm text-[#22201B] focus:outline-none focus:border-[#1F3B32] focus:ring-1 focus:ring-[#1F3B32]"
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
                placeholder="Especifique o bloco, sala ou setor..."
                className="w-full mt-2 bg-[#EDE1CB]/60 border border-[#22201B]/20 rounded-lg px-3.5 py-2 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:border-[#1F3B32]"
                required
              />
            )}
          </div>

          {/* Photo dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Foto do Problema (Opcional)
            </label>
            <label className="border-1.5 border-dashed border-[#1F3B32]/40 hover:border-[#1F3B32] bg-[#E3D4B4]/40 hover:bg-[#E3D4B4]/60 rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center">
              {fotoPreview ? (
                <div className="relative">
                  <img
                    src={fotoPreview}
                    alt="Pré-visualização"
                    className="max-h-28 rounded-md border border-[#22201B]/20 shadow-xs mb-1"
                  />
                  <span className="text-[11px] text-[#1F3B32] font-semibold underline block">
                    Clique para trocar a imagem
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-xl mb-1">📷</span>
                  <span className="text-xs font-medium text-[#1F3B32]">
                    Arraste uma imagem ou clique para anexar
                  </span>
                  <span className="text-[11px] text-[#5A554A] mt-0.5">
                    Ajuda a equipe responsável a identificar o problema mais rápido.
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#22201B]/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32]/10 text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs transition cursor-pointer"
            >
              Enviar ocorrência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
