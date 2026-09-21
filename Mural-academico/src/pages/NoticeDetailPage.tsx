import React from 'react';
import type { Aviso, Usuario } from '../types';

interface NoticeDetailPageProps {
  aviso: Aviso | undefined;
  currentUser: Usuario | null;
  onBack: () => void;
  onReportOccurrence: (location: string) => void;
  onDeleteAviso?: (id: string) => void;
}

export const NoticeDetailPage: React.FC<NoticeDetailPageProps> = ({
  aviso,
  currentUser,
  onBack,
  onReportOccurrence,
  onDeleteAviso,
}) => {
  if (!aviso) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">📋</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Aviso não encontrado</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            O comunicado solicitado pode ter sido arquivado ou o link está incorreto.
          </p>
          <button
            onClick={onBack}
            className="bg-[#1F3B32] text-[#FAF7F0] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#274A3F]"
          >
            ← Voltar ao Mural de Avisos
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  const dataFormatada = new Date(aviso.data_publicacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3B32] hover:text-[#C1443A] transition cursor-pointer"
        >
          <span>←</span> Voltar ao Mural
        </button>

        {isAdmin && onDeleteAviso && (
          <button
            onClick={() => {
              if (confirm('Tem certeza de que deseja remover este aviso do mural?')) {
                onDeleteAviso(aviso.id_aviso);
                onBack();
              }
            }}
            className="text-xs font-semibold text-[#C1443A] hover:bg-[#C1443A]/10 px-3 py-1 rounded transition border border-[#C1443A]/30 cursor-pointer"
          >
            🗑️ Excluir comunicado
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Card Principal do Aviso */}
        <div className="lg:col-span-2 bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-6 sm:p-8 shadow-md relative">
          {/* Alfinete institucional */}
          <div className="absolute -top-3 left-8 w-5 h-5 rounded-full bg-[#C1443A] shadow-md border-2 border-[#FAF7F0]" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#35577A] bg-[#35577A]/10 px-2 py-0.5 rounded">
              {aviso.categoria}
            </span>
            <span className="text-xs text-[#5A554A]">· Publicado em {dataFormatada}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F3B32] tracking-tight mb-4 leading-snug">
            {aviso.titulo}
          </h1>

          <div className="text-xs text-[#5A554A] pb-4 mb-6 border-b border-[#22201B]/10 flex flex-wrap items-center gap-4">
            <div>
              <span className="font-semibold text-[#22201B]">Autor:</span> {aviso.nome_autor}
            </div>
            <div>
              <span className="font-semibold text-[#22201B]">Local:</span> {aviso.local_bloco}
            </div>
          </div>

          <div className="text-sm text-[#22201B] leading-relaxed whitespace-pre-line space-y-4 mb-8 font-sans">
            {aviso.conteudo}
          </div>

          {/* Anexo em PDF */}
          {aviso.nome_anexo && (
            <div className="bg-[#EDE1CB]/60 border border-[#1F3B32]/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📎</span>
                <div>
                  <span className="text-xs font-semibold text-[#1F3B32] block">
                    {aviso.nome_anexo}
                  </span>
                  <span className="text-[11px] text-[#5A554A]">
                    Documento oficial em PDF {aviso.tamanho_anexo ? `· ${aviso.tamanho_anexo}` : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`Download simulado do anexo "${aviso.nome_anexo}". Em ambiente de nuvem AWS, este arquivo é entregue via bucket Amazon S3 com URL pré-assinada.`)}
                className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
              >
                <span>Baixar Documento</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar com metadados e atalho de ocorrência */}
        <div className="space-y-4">
          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#5A554A] uppercase tracking-wider mb-3">
              Informações do Comunicado
            </h3>
            <dl className="text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                <dt className="text-[#5A554A]">Categoria</dt>
                <dd className="font-semibold text-[#1F3B32]">{aviso.categoria}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                <dt className="text-[#5A554A]">Setor / Bloco</dt>
                <dd className="font-semibold text-[#1F3B32]">{aviso.local_bloco}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-[#22201B]/10">
                <dt className="text-[#5A554A]">Data Registro</dt>
                <dd className="font-semibold text-[#1F3B32]">{dataFormatada}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-[#5A554A]">Anexo AWS S3</dt>
                <dd className="font-semibold text-[#1F3B32]">
                  {aviso.nome_anexo ? 'Disponível (PDF)' : 'Nenhum'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#C1443A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚠️</span> Encontrou algum problema?
            </h3>
            <p className="text-xs text-[#5A554A] leading-relaxed mb-4">
              Se você identificou algum problema no local ({aviso.local_bloco}) ou divergência nas
              informações, registre uma ocorrência diretamente no sistema.
            </p>
            <button
              type="button"
              onClick={() => onReportOccurrence(aviso.local_bloco)}
              className="w-full bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm transition cursor-pointer text-center block"
            >
              Registrar Ocorrência no Local
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

