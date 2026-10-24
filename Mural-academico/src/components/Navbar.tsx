import React, { useState, useRef, useEffect } from 'react';
import type { TabNavegacao, Usuario } from '../types';
import { PinIcon } from './PinIcon';
import { LINKS_UTEIS } from '../data/links';

interface NavbarProps {
  currentTab: TabNavegacao;
  onNavigate: (tab: TabNavegacao) => void;
  currentUser: Usuario | null;
  onLogout: () => void;
  totalOcorrenciasAbertas: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  onLogout,
  totalOcorrenciasAbertas,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isMobileLinksOpen, setIsMobileLinksOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (linksRef.current && !linksRef.current.contains(target)) {
        setIsLinksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#1F3B32] text-[#FAF7F0] shadow-md border-b border-[#274A3F] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('mural')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity shrink-0"
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

        {/* Menus de Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium">
          <button
            onClick={() => onNavigate('mural')}
            className={`pb-1 border-b-2 transition-colors cursor-pointer ${
              currentTab === 'mural' || currentTab === 'detalhe-aviso'
                ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
            }`}
          >
            Mural
          </button>

          {currentUser?.perfil === 'LEITOR' && (
            <button
              onClick={() => onNavigate('minhas-ocorrencias')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                currentTab === 'minhas-ocorrencias'
                  ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                  : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
              }`}
            >
              Minhas Ocorrências
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin-gestao')}
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                currentTab === 'admin-gestao'
                  ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                  : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
              }`}
            >
              Gestão
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin-ocorrencias')}
              className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'admin-ocorrencias' || currentTab === 'admin-novo-aviso'
                  ? 'border-[#C1443A] text-[#FAF7F0] font-semibold'
                  : 'border-transparent text-[#FAF7F0]/75 hover:text-[#FAF7F0]'
              }`}
            >
              <span>Painel Admin</span>
              {totalOcorrenciasAbertas > 0 && (
                <span className="bg-[#C1443A] text-[11px] font-bold text-[#FAF7F0] px-1.5 py-0.2 rounded-full">
                  {totalOcorrenciasAbertas}
                </span>
              )}
            </button>
          )}

          {/* Divisor sutil entre rotas internas e links institucionais */}
          <span className="h-4 w-px bg-[#FAF7F0]/20 inline-block" />

          {/* Links Institucionais Rápidos */}
          <a
            href="https://sso.ufersa.edu.br/sso-server/login"
            target="_blank"
            rel="noreferrer"
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] transition flex items-center gap-1.5 cursor-pointer py-1"
            title="Acesso ao SIGAA (Matrículas e Notas)"
          >
            <span>SIGAA</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>

          <a
            href="https://ru.ufersa.edu.br/"
            target="_blank"
            rel="noreferrer"
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] transition flex items-center gap-1.5 cursor-pointer py-1"
            title="Restaurante Universitário da UFERSA"
          >
            <span>RU</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>

          <a
            href="/calendario-academico.pdf"
            target="_blank"
            rel="noreferrer"
            download="calendario-academico-ufersa-2026.pdf"
            className="text-[#FAF7F0]/80 hover:text-[#FAF7F0] transition flex items-center gap-1 cursor-pointer py-1"
            title="Baixar Calendário Acadêmico em PDF"
          >
            <span>Calendário</span>
            <span className="text-[10px] bg-[#C1443A] text-white px-1 py-0.2 rounded font-mono font-bold">
              PDF
            </span>
          </a>

          {/* Menu Dropdown de Atalhos do Estudante */}
          <div className="relative" ref={linksRef}>
            <button
              type="button"
              onClick={() => setIsLinksOpen(!isLinksOpen)}
              className="flex items-center gap-1 text-[#FAF7F0]/85 hover:text-[#FAF7F0] py-1 cursor-pointer"
            >
              <span>Atalhos do Campus</span>
              <span className="text-[9px] opacity-70">▼</span>
            </button>

            {isLinksOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#FAF7F0] text-[#22201B] rounded-xl shadow-2xl border border-[#22201B]/20 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-[#22201B]/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#1F3B32] font-mono">
                    Atalhos do Estudante
                  </p>
                  <p className="text-[10.5px] text-[#5A554A]">
                    Links úteis para a rotina diária no campus
                  </p>
                </div>

                <div className="py-1">
                  {LINKS_UTEIS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      download={link.download}
                      onClick={() => setIsLinksOpen(false)}
                      className="px-4 py-2 hover:bg-[#EDE1CB]/60 flex items-start gap-2.5 transition text-left cursor-pointer group"
                    >
                      <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                        {link.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#1F3B32] group-hover:text-[#C1443A] transition-colors">
                            {link.label}
                          </span>
                          <span className="text-[10px] text-[#5A554A]">↗</span>
                        </div>
                        <p className="text-[10.5px] text-[#5A554A] leading-tight mt-0.5 line-clamp-1">
                          {link.descricao}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Ações e Sessão do Usuário */}
        <div className="flex items-center gap-3">
          {/* Botão de Ação Rápida */}
          {isAdmin ? (
            <button
              onClick={() => onNavigate('admin-novo-aviso')}
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition cursor-pointer flex items-center gap-1"
            >
              <span>+</span> Novo aviso
            </button>
          ) : currentUser ? (
            <button
              onClick={() => onNavigate('nova-ocorrencia')}
              className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition cursor-pointer flex items-center gap-1"
            >
              <span>+</span> Ocorrência
            </button>
          ) : null}

          {/* Controle de Autenticação / Menu de Usuário */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-[#274A3F] hover:opacity-90 transition cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full bg-[#C1443A] text-[#FAF7F0] flex items-center justify-center text-xs font-bold shrink-0 shadow-inner"
                  title={currentUser.nome}
                >
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#FAF7F0] leading-tight line-clamp-1 max-w-[120px]">
                    {currentUser.nome.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#FAF7F0]/70 font-mono">
                    {currentUser.perfil === 'ADMINISTRADOR' ? 'Admin' : 'Leitor'}
                  </span>
                </div>
                <span className="text-[10px] text-[#FAF7F0]/60">▼</span>
              </button>

              {/* Menu Suspenso de Perfil */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAF7F0] text-[#22201B] rounded-xl shadow-2xl border border-[#22201B]/20 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#22201B]/10">
                    <p className="text-xs font-bold text-[#1F3B32]">{currentUser.nome}</p>
                    <p className="text-[11px] text-[#5A554A] font-mono break-all">
                      {currentUser.email_institucional}
                    </p>
                    <div className="mt-1.5">
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          currentUser.perfil === 'ADMINISTRADOR'
                            ? 'bg-[#1F3B32] text-[#FAF7F0]'
                            : 'bg-[#35577A] text-[#FAF7F0]'
                        }`}
                      >
                        {currentUser.perfil}
                      </span>
                      <span className="text-[10.5px] text-[#5A554A] ml-2">{currentUser.cargo}</span>
                    </div>
                  </div>

                  {/* Links do Menu */}
                  <div className="py-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-ocorrencias');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3B32] hover:bg-[#EDE1CB]/60 flex items-center justify-between cursor-pointer"
                      >
                        <span>Gerenciar Ocorrências</span>
                        <span className="text-[10px] font-mono bg-[#C1443A] text-white px-1.5 rounded-full">
                          {totalOcorrenciasAbertas}
                        </span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-gestao');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3B32] hover:bg-[#EDE1CB]/60 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Gestão do Sistema</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-novo-aviso');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3B32] hover:bg-[#EDE1CB]/60 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Publicar Novo Aviso</span>
                      </button>
                    )}
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('minhas-ocorrencias');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3B32] hover:bg-[#EDE1CB]/60 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Minhas Ocorrências</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onNavigate('mural');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#22201B] hover:bg-[#EDE1CB]/60 cursor-pointer"
                    >
                      Mural Público
                    </button>
                  </div>

                  {/* Botão Sair da Conta */}
                  <div className="border-t border-[#22201B]/10 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#C1443A] hover:bg-[#C1443A]/10 flex items-center gap-2 cursor-pointer"
                    >
                      <span>🚪</span> Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Botões de Acesso para Visitantes */
            <div className="flex items-center gap-2 pl-2 border-l border-[#274A3F]">
              <button
                onClick={() => onNavigate('login')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentTab === 'login'
                    ? 'bg-[#FAF7F0] text-[#1F3B32]'
                    : 'text-[#FAF7F0] hover:bg-[#FAF7F0]/15'
                }`}
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Navegação Móvel */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#274A3F] text-xs bg-[#1F3B32]">
        <button
          onClick={() => onNavigate('mural')}
          className={`px-3 py-1 rounded cursor-pointer ${
            currentTab === 'mural' ? 'bg-[#274A3F] font-bold text-[#FAF7F0]' : 'text-[#FAF7F0]/70'
          }`}
        >
          Mural
        </button>

        {currentUser?.perfil === 'LEITOR' && (
          <button
            onClick={() => onNavigate('minhas-ocorrencias')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'minhas-ocorrencias'
                ? 'bg-[#274A3F] font-bold text-[#FAF7F0]'
                : 'text-[#FAF7F0]/70'
            }`}
          >
            Ocorrências
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin-ocorrencias')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'admin-ocorrencias'
                ? 'bg-[#274A3F] font-bold text-[#FAF7F0]'
                : 'text-[#FAF7F0]/70'
            }`}
          >
            Painel ({totalOcorrenciasAbertas})
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin-gestao')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'admin-gestao'
                ? 'bg-[#274A3F] font-bold text-[#FAF7F0]'
                : 'text-[#FAF7F0]/70'
            }`}
          >
            Gestão
          </button>
        )}

        {/* Botão de Atalhos no Mobile */}
        <button
          onClick={() => setIsMobileLinksOpen(!isMobileLinksOpen)}
          className={`px-3 py-1 rounded cursor-pointer ${
            isMobileLinksOpen ? 'bg-[#274A3F] font-bold text-[#FAF7F0]' : 'text-[#FAF7F0]/70'
          }`}
        >
          Atalhos ▾
        </button>

        {!currentUser && (
          <button
            onClick={() => onNavigate('login')}
            className={`px-3 py-1 rounded cursor-pointer ${
              currentTab === 'login' ? 'bg-[#274A3F] font-bold text-[#FAF7F0]' : 'text-[#FAF7F0]/70'
            }`}
          >
            Login
          </button>
        )}
      </div>

      {/* Drawer / Modal móvel de links úteis */}
      {isMobileLinksOpen && (
        <div className="md:hidden bg-[#FAF7F0] text-[#22201B] border-t border-[#22201B]/20 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#22201B]/10">
            <span className="text-xs font-bold text-[#1F3B32] uppercase tracking-wider font-mono">
              Atalhos Úteis do Estudante
            </span>
            <button
              onClick={() => setIsMobileLinksOpen(false)}
              className="text-xs text-[#5A554A] font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LINKS_UTEIS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                download={link.download}
                className="p-2.5 rounded-lg border border-[#22201B]/15 bg-white hover:bg-[#EDE1CB]/40 flex items-center gap-2 text-xs font-medium text-[#1F3B32]"
              >
                <span>{link.icon}</span>
                <span className="truncate">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
