import React from 'react';
import type { Aviso, Usuario } from '../types';

interface NoticeCardProps {
  aviso: Aviso;
  index: number;
  currentUser: Usuario;
  onSelect: (aviso: Aviso) => void;
  onDelete?: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  aviso,
  index,
  currentUser,
  onSelect,
  onDelete,
}) => {
  const isOdd = index % 2 === 0;
  const rotationClass = isOdd ? 'paper-card-odd' : 'paper-card-even';
  const isAdmin = currentUser.perfil === 'ADMINISTRADOR';

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={() => onSelect(aviso)}
      className={`paper-card paper-pin ${rotationClass} rounded p-5 cursor-pointer flex flex-col justify-between group relative`}
    >
      {/* Top Tag & Admin controls */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-[#35577A] uppercase font-mono">
            {aviso.categoria}
          </span>

          {isAdmin && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Deseja realmente remover o aviso "${aviso.titulo}"?`)) {
                  onDelete(aviso.id_aviso);
                }
              }}
              className="text-[#C1443A] hover:bg-[#C1443A]/10 p-1 rounded transition text-xs font-semibold"
              title="Excluir aviso"
            >
              ✕
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-[#22201B] leading-snug mb-2 group-hover:text-[#1F3B32] transition-colors">
          {aviso.titulo}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-[#5A554A] leading-relaxed line-clamp-3 mb-4">
          {aviso.conteudo}
        </p>
      </div>

      {/* Meta info footer */}
      <div className="pt-3 border-t border-dashed border-[#22201B]/15 flex items-center justify-between text-[11px] text-[#5A554A]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-medium text-[#22201B] truncate">{aviso.local_bloco}</span>
          <span>·</span>
          <span className="shrink-0">{formatDate(aviso.data_publicacao)}</span>
        </div>

        {aviso.nome_anexo && (
          <span className="flex items-center gap-1 font-semibold text-[#C1443A] shrink-0 bg-[#C1443A]/8 px-2 py-0.5 rounded text-[10.5px]">
            <span>📎</span> PDF
          </span>
        )}
      </div>
    </div>
  );
};
