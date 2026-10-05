import React from 'react';
import type { Ocorrencia, StatusOcorrencia, Usuario } from '../types';

interface OccurrenceDetailModalProps {
  ocorrencia: Ocorrencia | null;
  onClose: () => void;
  currentUser: Usuario | null;
  onUpdateStatus?: (id: string, newStatus: StatusOcorrencia, parecer?: string) => void;
}

export const OccurrenceDetailModal: React.FC<OccurrenceDetailModalProps> = ({
  ocorrencia,
  onClose,
  currentUser,
  onUpdateStatus,
}) => {
  if (!ocorrencia) return null;

  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: StatusOcorrencia) => {
    switch (status) {
      case 'ABERTA':
        return (
          <span className="bg-[#C1443A]/15 text-[#C1443A] border border-[#C1443A]/30 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
            Aberta
          </span>
        );
      case 'EM_ANDAMENTO':
        return (
          <span className="bg-[#35577A]/15 text-[#35577A] border border-[#35577A]/30 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
            Em andamento
          </span>
        );
      case 'RESOLVIDA':
        return (
          <span className="bg-[#1F3B32]/15 text-[#1F3B32] border border-[#1F3B32]/30 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
            Resolvida
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3B32]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#22201B]/20 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topbar */}
        <div className="bg-[#1F3B32] text-[#FAF7F0] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FAF7F0]/80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C1443A]" />
            <span>mural.ufersa.edu.br/ocorrencias/{ocorrencia.id_ocorrencia}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] text-lg font-bold p-1 leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-5 bg-[#FAF7F0]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#35577A] font-mono">
                {ocorrencia.categoria}
              </span>
              {getStatusBadge(ocorrencia.status)}
            </div>

            <h2 className="font-display text-2xl font-bold text-[#1F3B32] leading-snug">
              {ocorrencia.titulo}
            </h2>
          </div>

          <div className="bg-[#EDE1CB]/40 rounded-lg p-4 text-xs space-y-2 border border-[#22201B]/10">
            <div className="flex justify-between">
              <span className="text-[#5A554A]">Local:</span>
              <strong className="text-[#22201B]">{ocorrencia.local_bloco}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A554A]">Solicitante:</span>
              <strong className="text-[#22201B]">{ocorrencia.nome_solicitante}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A554A]">Data de Registro:</span>
              <strong className="text-[#22201B]">{formatDate(ocorrencia.data_registro)}</strong>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#5A554A] uppercase font-mono mb-1.5">
              Descrição do problema
            </h4>
            <p className="text-sm text-[#22201B] leading-relaxed bg-[#FAF7F0] p-3 rounded-md border border-[#22201B]/10">
              {ocorrencia.descricao}
            </p>
          </div>

          {ocorrencia.url_foto && (
            <div>
              <h4 className="text-xs font-bold text-[#5A554A] uppercase font-mono mb-1.5">
                Foto anexada
              </h4>
              <img
                src={ocorrencia.url_foto}
                alt="Foto da ocorrência"
                className="w-full max-h-56 object-cover rounded-lg border border-[#22201B]/20"
              />
            </div>
          )}

          {/* Parecer Técnico da Administração */}
          {ocorrencia.parecer_atendimento && (
            <div className="bg-[#1F3B32]/10 border border-[#1F3B32]/30 rounded-lg p-3.5 text-xs">
              <span className="font-bold text-[#1F3B32] uppercase font-mono text-[11px] flex items-center gap-1.5 mb-1">
                <span>🔧</span> Parecer Técnico / Resposta da Administração:
              </span>
              <p className="text-[#22201B] leading-relaxed italic">
                "{ocorrencia.parecer_atendimento}"
              </p>
              {ocorrencia.data_atualizacao && (
                <span className="text-[10px] text-[#5A554A] block mt-1.5">
                  Atualizado em {formatDate(ocorrencia.data_atualizacao)}
                </span>
              )}
            </div>
          )}

          {/* Admin Status Actions */}
          {isAdmin && onUpdateStatus && (
            <div className="pt-3 border-t border-[#22201B]/15 space-y-3">
              <span className="block text-xs font-bold text-[#5A554A] uppercase font-mono">
                Ações Administrativas (Alterar Status & Parecer)
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-[#22201B] mb-1">
                  Adicionar ou Atualizar Parecer Técnico:
                </label>
                <input
                  type="text"
                  id="parecer-input"
                  defaultValue={ocorrencia.parecer_atendimento || ''}
                  placeholder="Ex: Técnico de manutenção enviado para substituição da peça..."
                  className="w-full bg-[#EDE1CB]/50 border border-[#22201B]/20 rounded-lg px-3 py-1.5 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {ocorrencia.status !== 'EM_ANDAMENTO' && (
                  <button
                    onClick={() => {
                      const input = document.getElementById('parecer-input') as HTMLInputElement | null;
                      onUpdateStatus(ocorrencia.id_ocorrencia, 'EM_ANDAMENTO', input?.value);
                      onClose();
                    }}
                    className="bg-[#35577A] hover:bg-[#28435f] text-[#FAF7F0] text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer"
                  >
                    Atender (Em andamento)
                  </button>
                )}
                {ocorrencia.status !== 'RESOLVIDA' && (
                  <button
                    onClick={() => {
                      const input = document.getElementById('parecer-input') as HTMLInputElement | null;
                      onUpdateStatus(ocorrencia.id_ocorrencia, 'RESOLVIDA', input?.value || 'Ocorrência atendida e finalizada.');
                      onClose();
                    }}
                    className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer"
                  >
                    Concluir (Resolvida)
                  </button>
                )}
                {ocorrencia.status !== 'ABERTA' && (
                  <button
                    onClick={() => {
                      const input = document.getElementById('parecer-input') as HTMLInputElement | null;
                      onUpdateStatus(ocorrencia.id_ocorrencia, 'ABERTA', input?.value);
                      onClose();
                    }}
                    className="border border-[#C1443A] text-[#C1443A] hover:bg-[#C1443A]/10 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    Reabrir
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F0] border-t border-[#22201B]/15 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="border border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32]/10 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
