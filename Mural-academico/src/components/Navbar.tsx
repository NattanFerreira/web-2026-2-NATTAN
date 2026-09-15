import React from 'react';
import type { TabNavegacao, Usuario } from '../types';
import { PinIcon } from './PinIcon';
import { USUARIOS_INICIAIS } from '../data/initialData';

interface NavbarProps {
  currentTab: TabNavegacao;
  setCurrentTab: (tab: TabNavegacao) => void;
  currentUser: Usuario;
  onSwitchUser: (user: Usuario) => void;
  onOpenCreateAviso: () => void;
  onOpenCreateOcorrencia: () => void;
  totalOcorrenciasAbertas: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onSwitchUser,
  onOpenCreateAviso,
  onOpenCreateOcorrencia,
  totalOcorrenciasAbertas,
}) => {
  const isAdmin = currentUser.perfil === 'ADMINISTRADOR';

  return (
    <header className="bg-[#1F3B32] text-[#FAF7F0] shadow-md border-b border-[#274A3F] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setCurrentTab('mural')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <PinIcon size={26} variant="light" />
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-[#FAF7F0]">
              Quadro
            </span>
            {isAdmin && (
              <span className="text-[10px] uppercase tracking-wider font-semibold font-mono bg-[#FAF7F0]/15 text-[#FAF7F0] px-2 py-0.5 rounded border border-[#FAF7F0]/20">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('mural')}
            className={`pb-1 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'mural'
                ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
            }`}
          >
            Mural
          </button>

          {!isAdmin ? (
            <button
              onClick={() => setCurrentTab('minhas-ocorrencias')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                currentTab === 'minhas-ocorrencias'
                  ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                  : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
              }`}
            >
              Minhas ocorrências
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('admin-ocorrencias')}
              className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'admin-ocorrencias'
                  ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                  : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
              }`}
            >
              <span>Gerenciar Ocorrências</span>
              {totalOcorrenciasAbertas > 0 && (
                <span className="bg-[#C1443A] text-[11px] font-bold text-[#FAF7F0] px-1.5 py-0.2 rounded-full">
                  {totalOcorrenciasAbertas}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setCurrentTab('sobre')}
            className={`pb-1 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'sobre'
                ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
            }`}
          >
            Identidade & Sobre
          </button>
        </nav>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={onOpenCreateAviso}
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition cursor-pointer flex items-center gap-1"
            >
              <span>+</span> Novo aviso
            </button>
          ) : (
            <button
              onClick={onOpenCreateOcorrencia}
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition cursor-pointer flex items-center gap-1"
            >
              <span>+</span> Ocorrência
            </button>
          )}

          {/* User selector */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#274A3F]">
            <div
              className="w-7 h-7 rounded-full bg-[#C1443A] text-[#FAF7F0] flex items-center justify-center text-xs font-bold shrink-0 shadow-inner"
              title={currentUser.nome}
            >
              {currentUser.avatar}
            </div>

            <div className="flex flex-col text-left">
              <select
                value={currentUser.id_usuario}
                onChange={(e) => {
                  const selected = USUARIOS_INICIAIS.find((u) => u.id_usuario === e.target.value);
                  if (selected) onSwitchUser(selected);
                }}
                className="bg-[#274A3F] text-[#FAF7F0] text-xs rounded px-2 py-1 border border-[#FAF7F0]/20 focus:outline-none focus:ring-1 focus:ring-[#C1443A] cursor-pointer"
                title="Alternar perfil para teste"
              >
                {USUARIOS_INICIAIS.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nome} ({u.perfil === 'ADMINISTRADOR' ? 'Admin' : 'Leitor'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#274A3F] text-xs bg-[#1F3B32]">
        <button
          onClick={() => setCurrentTab('mural')}
          className={`px-3 py-1 rounded cursor-pointer ${
            currentTab === 'mural' ? 'bg-[#274A3F] font-bold text-[#FAF7F0]' : 'text-[#FAF7F0]/70'
          }`}
        >
          Mural
        </button>
        {!isAdmin ? (
          <button
            onClick={() => setCurrentTab('minhas-ocorrencias')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'minhas-ocorrencias'
                ? 'bg-[#274A3F] font-bold text-[#FAF7F0]'
                : 'text-[#FAF7F0]/70'
            }`}
          >
            Ocorrências
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('admin-ocorrencias')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'admin-ocorrencias'
                ? 'bg-[#274A3F] font-bold text-[#FAF7F0]'
                : 'text-[#FAF7F0]/70'
            }`}
          >
            Painel ({totalOcorrenciasAbertas})
          </button>
        )}
        <button
          onClick={() => setCurrentTab('sobre')}
          className={`px-3 py-1 rounded cursor-pointer ${
            currentTab === 'sobre' ? 'bg-[#274A3F] font-bold text-[#FAF7F0]' : 'text-[#FAF7F0]/70'
          }`}
        >
          Identidade
        </button>
      </div>
    </header>
  );
};
