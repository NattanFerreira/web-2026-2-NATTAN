import React from 'react';
import type { Aviso } from '../types';

interface NoticeDetailModalProps {
  aviso: Aviso | null;
  onClose: () => void;
  onReportOccurrence: (defaultLocation?: string) => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  aviso,
  onClose,
  onReportOccurrence,
}) => {
  if (!aviso) return null;

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

  const handleDownloadAttachment = () => {
    // Simula o download do PDF
    const dummyContent = `Documento Acadêmico UFERSA\n\nAviso: ${aviso.titulo}\nPublicado em: ${aviso.data_publicacao}\nAutor: ${aviso.nome_autor}\nLocal: ${aviso.local_bloco}\n\nConteúdo:\n${aviso.conteudo}`;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = aviso.nome_anexo || 'comunicado-academico.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F3B32]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#22201B]/20 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Topbar */}
        <div className="bg-[#1F3B32] text-[#FAF7F0] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FAF7F0]/80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C1443A]" />
            <span>mural.ufersa.edu.br/avisos/{aviso.id_aviso}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] text-lg font-bold p-1 leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto bg-[#EDE1CB]/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content (2 cols) */}
            <div className="lg:col-span-2 bg-[#FAF7F0] rounded-lg border border-[#22201B]/15 p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#35577A] uppercase font-mono">
                  {aviso.categoria}
                </span>

                <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1F3B32] mt-2 mb-2 leading-tight">
                  {aviso.titulo}
                </h2>

                <div className="text-xs text-[#5A554A] pb-4 border-b border-[#22201B]/15 mb-5 font-sans">
                  Publicado por <strong className="text-[#22201B]">{aviso.nome_autor}</strong> · {formatDate(aviso.data_publicacao)}
                </div>

                <div className="text-sm text-[#22201B] leading-relaxed whitespace-pre-line mb-6 font-sans">
                  {aviso.conteudo}
                </div>
              </div>

              {/* Attachment box */}
              {aviso.nome_anexo && (
                <div className="mt-4 p-4 bg-[#E3D4B4]/50 border border-dashed border-[#1F3B32]/40 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-[#1F3B32] font-medium truncate">
                    <span className="text-base">📎</span>
                    <span className="font-mono truncate">{aviso.nome_anexo}</span>
                    {aviso.tamanho_anexo && (
                      <span className="text-[#5A554A] text-[11px]">({aviso.tamanho_anexo})</span>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadAttachment}
                    className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-3 py-1.5 rounded transition shrink-0 cursor-pointer"
                  >
                    Baixar PDF
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar (1 col) */}
            <div className="flex flex-col gap-4">
              {/* Meta details card */}
              <div className="bg-[#FAF7F0] rounded-lg border border-[#22201B]/15 p-5 shadow-sm text-xs">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#5A554A] font-mono mb-3">
                  DETALHES DO AVISO
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                    <span className="text-[#5A554A]">Categoria:</span>
                    <span className="font-semibold text-[#22201B]">{aviso.categoria}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                    <span className="text-[#5A554A]">Local / Bloco:</span>
                    <span className="font-semibold text-[#22201B]">{aviso.local_bloco}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                    <span className="text-[#5A554A]">Publicação:</span>
                    <span className="font-semibold text-[#22201B]">{formatDate(aviso.data_publicacao)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5A554A]">Anexo:</span>
                    <span className="font-semibold text-[#22201B]">
                      {aviso.nome_anexo ? '1 Documento PDF' : 'Nenhum'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem reporting card */}
              <div className="bg-[#FAF7F0] rounded-lg border border-[#22201B]/15 p-5 shadow-sm text-xs">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#C1443A] font-mono mb-2">
                  ALGO NÃO CONFERE AQUI?
                </h4>
                <p className="text-[#5A554A] leading-relaxed mb-4">
                  Se encontrar um problema relacionado a este comunicado ou à infraestrutura do local citado, registre uma ocorrência institucional.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onReportOccurrence(aviso.local_bloco);
                  }}
                  className="w-full bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] font-semibold py-2 px-3 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>+</span> Registrar ocorrência
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
