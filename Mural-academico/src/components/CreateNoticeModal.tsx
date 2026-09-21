import React, { useState } from 'react';
import type { CategoriaAviso, Usuario } from '../types';

import { validation } from '../utils/validation';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
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
}

const CATEGORIAS: CategoriaAviso[] = ['Ensino', 'Infraestrutura', 'Editais', 'Eventos'];

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaAviso>('Ensino');
  const [localBloco, setLocalBloco] = useState('Coordenação — Bloco C');
  const [anexoNome, setAnexoNome] = useState<string | undefined>(undefined);
  const [anexoTamanho, setAnexoTamanho] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrors((prev) => ({ ...prev, anexo: 'Apenas arquivos PDF são permitidos.' }));
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
    const result = validation.validateNotice({
      titulo,
      conteudo,
      categoria,
      local_bloco: localBloco,
      anexoNome,
    });

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    onSubmit({
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      categoria,
      local_bloco: localBloco.trim() || 'Campus Central',
      id_autor: currentUser.id_usuario,
      nome_autor: currentUser.nome,
      nome_anexo: anexoNome,
      tamanho_anexo: anexoTamanho,
    });

    // Reset and close
    setTitulo('');
    setConteudo('');
    setAnexoNome(undefined);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3B32]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#22201B]/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topbar */}
        <div className="bg-[#1F3B32] text-[#FAF7F0] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FAF7F0]/80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF7F0]/40" />
            <span>mural.ufersa.edu.br/admin/avisos/novo</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] text-lg font-bold p-1 leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-5 bg-[#FAF7F0]">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1F3B32] mb-1">
              Publicar novo aviso
            </h2>
            <p className="text-xs text-[#5A554A]">
              O comunicado será publicado no mural público imediatamente sob a assinatura de{' '}
              <strong>{currentUser.nome}</strong>.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Título do Comunicado *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errors.titulo) setErrors((prev) => ({ ...prev, titulo: '' }));
              }}
              placeholder="Ex.: Alteração de prazo — TCC I"
              className={`w-full bg-[#EDE1CB]/60 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.titulo
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.titulo && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1">
                • {errors.titulo}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Conteúdo Completo *
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => {
                setConteudo(e.target.value);
                if (errors.conteudo) setErrors((prev) => ({ ...prev, conteudo: '' }));
              }}
              placeholder="Descreva o comunicado por completo, prazos, instruções e requisitos..."
              rows={5}
              className={`w-full bg-[#EDE1CB]/60 border rounded-lg px-3.5 py-2.5 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:ring-1 transition ${
                errors.conteudo
                  ? 'border-[#C1443A] focus:ring-[#C1443A] bg-[#C1443A]/5'
                  : 'border-[#22201B]/20 focus:border-[#1F3B32] focus:ring-[#1F3B32]'
              }`}
            />
            {errors.conteudo && (
              <p className="text-[11px] font-medium text-[#C1443A] mt-1">
                • {errors.conteudo}
              </p>
            )}
          </div>

          {/* Category pills & Local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
                Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoria(cat)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                      categoria === cat
                        ? 'bg-[#1F3B32] text-[#FAF7F0] border-[#1F3B32]'
                        : 'border-[#22201B]/20 text-[#5A554A] hover:bg-[#EDE1CB]/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
                Local / Bloco de Referência
              </label>
              <input
                type="text"
                value={localBloco}
                onChange={(e) => setLocalBloco(e.target.value)}
                placeholder="Ex.: Bloco C · Coordenação"
                className="w-full bg-[#EDE1CB]/60 border border-[#22201B]/20 rounded-lg px-3.5 py-2 text-sm text-[#22201B] placeholder-[#5A554A]/60 focus:outline-none focus:border-[#1F3B32] focus:ring-1 focus:ring-[#1F3B32]"
              />
            </div>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-bold text-[#22201B] mb-1.5 uppercase font-mono">
              Anexo em PDF (Armazenado no bucket S3)
            </label>
            <label className="border-2 border-dashed border-[#1F3B32]/30 hover:border-[#1F3B32] bg-[#E3D4B4]/40 hover:bg-[#E3D4B4]/60 rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center">
              <span className="text-xl mb-1">📎</span>
              <span className="text-xs font-medium text-[#1F3B32]">
                {anexoNome ? (
                  <span className="font-mono font-bold text-[#1F3B32]">{anexoNome} ({anexoTamanho})</span>
                ) : (
                  'Clique para selecionar ou arraste um arquivo PDF'
                )}
              </span>
              <span className="text-[10.5px] text-[#5A554A] mt-0.5">
                Simula envio para Amazon S3 (limite de 5 MB)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Actions */}
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
              Publicar aviso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
