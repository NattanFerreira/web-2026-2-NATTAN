import React from 'react';
import type { Ocorrencia, StatusOcorrencia, Usuario } from '../types';

interface MyOccurrencesPageProps {
  ocorrencias: Ocorrencia[];
  currentUser: Usuario | null;
  onOpenCreate: () => void;
  onSelectOcorrencia: (ocorrencia: Ocorrencia) => void;
  onNavigateLogin?: () => void;
}

export const MyOccurrencesPage: React.FC<MyOccurrencesPageProps> = ({
  ocorrencias,
  currentUser,
  onOpenCreate,
  onSelectOcorrencia,
  onNavigateLogin,
}) => {
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">📋</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Identificação Necessária</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            Faça login com seu e-mail institucional para acompanhar suas ocorrências registradas e status de atendimento.
          </p>
          {onNavigateLogin && (
            <button
              onClick={onNavigateLogin}
              className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-5 py-2.5 rounded-lg transition cursor-pointer"
            >
              Fazer Login no Quadro
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filtra as ocorrências do solicitante atual
  const minhasOcorrencias = ocorrencias.filter(
    (o) => o.id_solicitante === currentUser.id_usuario
  );

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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-7 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#1F3B32] tracking-tight">
            Minhas ocorrências
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554A] mt-1 font-sans">
            Acompanhe o andamento das solicitações que você registrou no campus ({currentUser.nome})
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>+</span> Nova ocorrência
        </button>
      </div>

      {/* Occurrences List */}
      {minhasOcorrencias.length > 0 ? (
        <div className="space-y-3.5">
          {minhasOcorrencias.map((oco) => (
            <div
              key={oco.id_ocorrencia}
              onClick={() => onSelectOcorrencia(oco)}
              className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-xs hover:border-[#1F3B32]/50 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#35577A] uppercase font-mono">
                    {oco.categoria}
                  </span>
                  <span className="text-xs text-[#5A554A]">·</span>
                  <span className="text-xs font-medium text-[#22201B]">{oco.local_bloco}</span>
                </div>

                <h3 className="font-display text-lg font-semibold text-[#1F3B32]">
                  {oco.titulo}
                </h3>

                <p className="text-xs text-[#5A554A] line-clamp-2">
                  {oco.descricao}
                </p>

                <div className="text-[11px] text-[#5A554A] font-mono pt-1">
                  Registrada em: {formatDate(oco.data_registro)}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#22201B]/10">
                {getStatusBadge(oco.status)}
                <span className="text-xs font-semibold text-[#35577A] hover:underline">
                  Ver detalhes →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FAF7F0]/90 border border-[#22201B]/15 rounded-xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-display text-lg font-bold text-[#1F3B32] mb-1">
            Nenhuma ocorrência registrada
          </h3>
          <p className="text-xs text-[#5A554A] mb-5">
            Você ainda não abriu nenhum chamado para o campus. Encontrou algum problema na sala, laboratório ou elevador?
          </p>
          <button
            onClick={onOpenCreate}
            className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
          >
            Registrar primeira ocorrência
          </button>
        </div>
      )}
    </div>
  );
};
