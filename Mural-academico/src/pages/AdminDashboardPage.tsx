import React, { useState, useMemo } from 'react';
import type { Ocorrencia, StatusOcorrencia } from '../types';

interface AdminDashboardPageProps {
  ocorrencias: Ocorrencia[];
  onUpdateStatus: (id: string, newStatus: StatusOcorrencia) => void;
  onSelectOcorrencia: (ocorrencia: Ocorrencia) => void;
  onDeleteOcorrencia: (id: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  ocorrencias,
  onUpdateStatus,
  onSelectOcorrencia,
  onDeleteOcorrencia,
}) => {
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | StatusOcorrencia>('TODOS');
  const [busca, setBusca] = useState('');

  // Contadores
  const abertas = ocorrencias.filter((o) => o.status === 'ABERTA').length;
  const emAndamento = ocorrencias.filter((o) => o.status === 'EM_ANDAMENTO').length;
  const resolvidas = ocorrencias.filter((o) => o.status === 'RESOLVIDA').length;

  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias.filter((o) => {
      const matchStatus = statusFiltro === 'TODOS' ? true : o.status === statusFiltro;
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        o.titulo.toLowerCase().includes(termo) ||
        o.local_bloco.toLowerCase().includes(termo) ||
        o.nome_solicitante.toLowerCase().includes(termo) ||
        o.categoria.toLowerCase().includes(termo);

      return matchStatus && matchBusca;
    });
  }, [ocorrencias, statusFiltro, busca]);

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
    <div className="max-w-6xl mx-auto py-7 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#1F3B32] tracking-tight">
            Painel de Ocorrências
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554A] mt-1 font-sans">
            <strong className="text-[#C1443A]">{abertas} abertas</strong> ·{' '}
            <strong className="text-[#35577A]">{emAndamento} em andamento</strong> ·{' '}
            <strong className="text-[#1F3B32]">{resolvidas} resolvidas</strong> este semestre
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔍 Filtrar por sala, aluno ou título..."
            className="w-full bg-[#FAF7F0] border border-[#1F3B32]/40 rounded-lg px-3.5 py-2 text-xs text-[#22201B] placeholder-[#5A554A]/70 shadow-xs focus:outline-none focus:border-[#1F3B32]"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setStatusFiltro(statusFiltro === 'ABERTA' ? 'TODOS' : 'ABERTA')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFiltro === 'ABERTA'
              ? 'bg-[#FAF7F0] border-[#C1443A] ring-2 ring-[#C1443A]/30 shadow-md'
              : 'bg-[#FAF7F0] border-[#22201B]/15 hover:border-[#C1443A]/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A554A] font-mono">
              Pendentes / Abertas
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C1443A]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#C1443A] mt-2">{abertas}</div>
          <p className="text-[11px] text-[#5A554A] mt-1">Aguardando início de atendimento</p>
        </div>

        <div
          onClick={() =>
            setStatusFiltro(statusFiltro === 'EM_ANDAMENTO' ? 'TODOS' : 'EM_ANDAMENTO')
          }
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFiltro === 'EM_ANDAMENTO'
              ? 'bg-[#FAF7F0] border-[#35577A] ring-2 ring-[#35577A]/30 shadow-md'
              : 'bg-[#FAF7F0] border-[#22201B]/15 hover:border-[#35577A]/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A554A] font-mono">
              Em Atendimento
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#35577A]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#35577A] mt-2">{emAndamento}</div>
          <p className="text-[11px] text-[#5A554A] mt-1">Equipe técnica acionada no local</p>
        </div>

        <div
          onClick={() =>
            setStatusFiltro(statusFiltro === 'RESOLVIDA' ? 'TODOS' : 'RESOLVIDA')
          }
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFiltro === 'RESOLVIDA'
              ? 'bg-[#FAF7F0] border-[#1F3B32] ring-2 ring-[#1F3B32]/30 shadow-md'
              : 'bg-[#FAF7F0] border-[#22201B]/15 hover:border-[#1F3B32]/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A554A] font-mono">
              Concluídas / Resolvidas
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F3B32]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#1F3B32] mt-2">{resolvidas}</div>
          <p className="text-[11px] text-[#5A554A] mt-1">Manutenção e suporte finalizados</p>
        </div>
      </div>

      {/* Occurrences Table */}
      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E3D4B4]/60 border-b border-[#22201B]/15 text-[11px] font-bold uppercase text-[#5A554A] font-mono">
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Local</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22201B]/10 text-xs">
              {ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((oco) => (
                  <tr
                    key={oco.id_ocorrencia}
                    className="hover:bg-[#EDE1CB]/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#22201B]">
                      <button
                        onClick={() => onSelectOcorrencia(oco)}
                        className="hover:text-[#1F3B32] hover:underline text-left cursor-pointer"
                      >
                        {oco.titulo}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-[#5A554A]">{oco.categoria}</td>
                    <td className="py-3.5 px-4 text-[#22201B] font-medium">{oco.local_bloco}</td>
                    <td className="py-3.5 px-4 text-[#5A554A]">{oco.nome_solicitante}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(oco.status)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {oco.status === 'ABERTA' && (
                        <button
                          onClick={() => onUpdateStatus(oco.id_ocorrencia, 'EM_ANDAMENTO')}
                          className="bg-[#35577A] hover:bg-[#274563] text-[#FAF7F0] text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer"
                          title="Iniciar atendimento"
                        >
                          Atender
                        </button>
                      )}
                      {oco.status === 'EM_ANDAMENTO' && (
                        <button
                          onClick={() => onUpdateStatus(oco.id_ocorrencia, 'RESOLVIDA')}
                          className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer"
                          title="Concluir ocorrência"
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        onClick={() => onSelectOcorrencia(oco)}
                        className="text-[#35577A] hover:underline font-semibold text-[11px] cursor-pointer"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja remover o registro "${oco.titulo}"?`)) {
                            onDeleteOcorrencia(oco.id_ocorrencia);
                          }
                        }}
                        className="text-[#C1443A] hover:bg-[#C1443A]/10 p-1 rounded font-semibold text-[11px] cursor-pointer"
                        title="Excluir ocorrência"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#5A554A]">
                    Nenhuma ocorrência encontrada para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
