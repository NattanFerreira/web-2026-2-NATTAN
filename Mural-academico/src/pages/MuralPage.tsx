import React, { useState, useMemo } from 'react';
import type { Aviso, CategoriaAviso, Usuario } from '../types';
import { NoticeCard } from '../components/NoticeCard';

interface MuralPageProps {
  avisos: Aviso[];
  currentUser: Usuario | null;
  onSelectAviso: (aviso: Aviso) => void;
  onOpenCreateAviso: () => void;
  onOpenCreateOcorrencia: () => void;
  onDeleteAviso: (id: string) => void;
}

const CATEGORIAS_FILTRO: ('Todos' | CategoriaAviso)[] = [
  'Todos',
  'Ensino',
  'Infraestrutura',
  'Editais',
  'Eventos',
];

export const MuralPage: React.FC<MuralPageProps> = ({
  avisos,
  currentUser,
  onSelectAviso,
  onOpenCreateAviso,
  onOpenCreateOcorrencia,
  onDeleteAviso,
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<'Todos' | CategoriaAviso>('Todos');
  const [busca, setBusca] = useState('');

  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  // Filtragem combinada por categoria e texto de busca
  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      const matchCategoria =
        categoriaAtiva === 'Todos' ? true : aviso.categoria === categoriaAtiva;

      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        aviso.titulo.toLowerCase().includes(termo) ||
        aviso.conteudo.toLowerCase().includes(termo) ||
        aviso.local_bloco.toLowerCase().includes(termo) ||
        aviso.categoria.toLowerCase().includes(termo);

      return matchCategoria && matchBusca;
    });
  }, [avisos, categoriaAtiva, busca]);

  return (
    <div className="max-w-6xl mx-auto py-7 px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#1F3B32] tracking-tight">
            Mural de avisos
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554A] mt-1 font-sans">
            {avisos.length} avisos oficiais publicados este semestre no campus
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔍 Buscar por palavra-chave, bloco ou edital…"
            className="w-full bg-[#FAF7F0] border-1.5 border-[#1F3B32] rounded-xl px-4 py-2.5 text-xs text-[#22201B] placeholder-[#5A554A]/70 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1F3B32]/30"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-2.5 text-xs text-[#5A554A] hover:text-[#22201B] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row + Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_FILTRO.map((cat) => {
            const isSelected = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F3B32] text-[#FAF7F0] border-[#1F3B32] shadow-xs'
                    : 'bg-transparent text-[#1F3B32] border-[#1F3B32] hover:bg-[#FAF7F0]/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {isAdmin ? (
          <button
            onClick={onOpenCreateAviso}
            className="border-1.5 border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32] hover:text-[#FAF7F0] text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span> Publicar novo aviso
          </button>
        ) : (
          <button
            onClick={onOpenCreateOcorrencia}
            className="border-1.5 border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32] hover:text-[#FAF7F0] text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span> Registrar ocorrência
          </button>
        )}
      </div>

      {/* Notices Grid */}
      {avisosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {avisosFiltrados.map((aviso, idx) => (
            <NoticeCard
              key={aviso.id_aviso}
              aviso={aviso}
              index={idx}
              currentUser={currentUser}
              onSelect={onSelectAviso}
              onDelete={onDeleteAviso}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#FAF7F0]/80 border border-[#22201B]/15 rounded-xl p-12 text-center max-w-md mx-auto my-12">
          <div className="text-3xl mb-2">📌</div>
          <h3 className="font-display text-lg font-bold text-[#1F3B32] mb-1">
            Nenhum aviso encontrado
          </h3>
          <p className="text-xs text-[#5A554A] mb-4">
            {busca
              ? `Nenhum resultado para "${busca}" na categoria selecionada.`
              : 'Não há comunicados nesta categoria no momento.'}
          </p>
          {(busca || categoriaAtiva !== 'Todos') && (
            <button
              onClick={() => {
                setBusca('');
                setCategoriaAtiva('Todos');
              }}
              className="text-xs font-semibold text-[#1F3B32] underline hover:opacity-80 cursor-pointer"
            >
              Limpar filtros de busca
            </button>
          )}
        </div>
      )}
    </div>
  );
};
