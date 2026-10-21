import React, { useState } from 'react';
import type { Aviso, Comentario, Usuario } from '../types';
import { ADMIN_EMAILS, isAdminEmail } from '../services/storageService';

interface AdminManagePageProps {
  currentUser: Usuario | null;
  avisos: Aviso[];
  comentarios: Comentario[];
  usuarios: Usuario[];
  /** ids de usuários que existem no armazenamento editável (cadastrados) */
  idsEditaveis: Set<string>;
  onOpenAviso: (id: string) => void;
  onEditAviso: (id: string) => void;
  onDeleteAviso: (id: string) => void;
  onNewAviso: () => void;
  onDeleteComentario: (id: string) => void;
  onChangePerfil: (id: string, perfil: Usuario['perfil']) => void;
  onToggleBloqueio: (id: string) => void;
  onDeleteUsuario: (id: string) => void;
  onNavigateOcorrencias: () => void;
  onNavigateLogin: () => void;
  onNavigateMural: () => void;
}

type Aba = 'avisos' | 'comentarios' | 'usuarios';

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const AdminManagePage: React.FC<AdminManagePageProps> = ({
  currentUser,
  avisos,
  comentarios,
  usuarios,
  idsEditaveis,
  onOpenAviso,
  onEditAviso,
  onDeleteAviso,
  onNewAviso,
  onDeleteComentario,
  onChangePerfil,
  onToggleBloqueio,
  onDeleteUsuario,
  onNavigateOcorrencias,
  onNavigateLogin,
  onNavigateMural,
}) => {
  const [aba, setAba] = useState<Aba>('avisos');
  const [busca, setBusca] = useState('');

  if (!currentUser || currentUser.perfil !== 'ADMINISTRADOR') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-[#FAF7F0] border border-[#C1443A]/30 rounded-xl p-8 shadow-sm">
          <span className="text-4xl mb-3 block">🔒</span>
          <h2 className="font-display text-2xl font-bold text-[#1F3B32]">Acesso Restrito</h2>
          <p className="text-xs text-[#5A554A] mt-2 mb-6">
            Apenas administradores autenticados podem acessar a gestão do sistema.
          </p>
          <div className="space-y-2">
            <button
              onClick={onNavigateLogin}
              className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
            >
              Fazer login
            </button>
            <button
              onClick={onNavigateMural}
              className="w-full text-xs text-[#5A554A] hover:underline py-1.5 cursor-pointer"
            >
              Voltar ao mural
            </button>
          </div>
        </div>
      </div>
    );
  }

  const termo = busca.toLowerCase().trim();
  const avisosF = avisos.filter(
    (a) => !termo || a.titulo.toLowerCase().includes(termo) || a.categoria.toLowerCase().includes(termo)
  );
  const comentariosF = comentarios
    .filter(
      (c) => !termo || c.conteudo.toLowerCase().includes(termo) || c.nome_autor.toLowerCase().includes(termo)
    )
    .sort((a, b) => b.data_criacao.localeCompare(a.data_criacao));
  const usuariosF = usuarios.filter(
    (u) =>
      !termo || u.nome.toLowerCase().includes(termo) || u.email_institucional.toLowerCase().includes(termo)
  );

  const tituloAviso = (id: string) => avisos.find((a) => a.id_aviso === id)?.titulo ?? '(aviso removido)';

  const abas: { id: Aba; label: string; total: number }[] = [
    { id: 'avisos', label: 'Postagens', total: avisos.length },
    { id: 'comentarios', label: 'Comentários', total: comentarios.length },
    { id: 'usuarios', label: 'Usuários', total: usuarios.length },
  ];

  const btnBase = 'text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer border';

  return (
    <div className="max-w-6xl mx-auto py-7 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1F3B32] tracking-tight">
            Gestão do sistema
          </h1>
          <p className="text-xs sm:text-sm text-[#5A554A] mt-1">
            Gerencie postagens, comentários e usuários. Administrador raiz:{' '}
            <span className="font-mono">{ADMIN_EMAILS.join(', ') || 'não configurado'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNewAviso}
            className="bg-[#C1443A] hover:bg-[#a93a31] text-[#FAF7F0] text-xs font-semibold px-3 py-2 rounded-lg shadow cursor-pointer"
          >
            + Novo aviso
          </button>
          <button
            onClick={onNavigateOcorrencias}
            className="border border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32] hover:text-[#FAF7F0] text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
          >
            Gerenciar ocorrências
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div role="tablist" className="flex gap-2">
          {abas.map((a) => (
            <button
              key={a.id}
              id={`gestao-aba-${a.id}`}
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition cursor-pointer ${
                aba === a.id
                  ? 'bg-[#1F3B32] text-[#FAF7F0] border-[#1F3B32]'
                  : 'text-[#1F3B32] border-[#1F3B32] hover:bg-[#FAF7F0]/60'
              }`}
            >
              {a.label} ({a.total})
            </button>
          ))}
        </div>
        <input
          id="gestao-busca"
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔍 Buscar…"
          className="w-full sm:w-64 bg-[#FAF7F0] border border-[#1F3B32]/40 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-[#1F3B32]"
        />
      </div>

      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {aba === 'avisos' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E3D4B4]/60 border-b border-[#22201B]/15 text-[11px] font-bold uppercase text-[#5A554A] font-mono">
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Comentários</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22201B]/10">
                {avisosF.map((a) => (
                  <tr key={a.id_aviso} className="hover:bg-[#EDE1CB]/30">
                    <td className="py-3 px-4 font-semibold">
                      <button onClick={() => onOpenAviso(a.id_aviso)} className="hover:underline text-left cursor-pointer">
                        {a.titulo}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[#5A554A]">{a.categoria}</td>
                    <td className="py-3 px-4 text-[#5A554A]">{fmt(a.data_publicacao)}</td>
                    <td className="py-3 px-4 text-[#5A554A]">
                      {comentarios.filter((c) => c.id_aviso === a.id_aviso).length}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onEditAviso(a.id_aviso)}
                        className={`${btnBase} border-[#1F3B32]/40 text-[#1F3B32] hover:bg-[#1F3B32]/10`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir o aviso "${a.titulo}" e seus comentários?`))
                            onDeleteAviso(a.id_aviso);
                        }}
                        className={`${btnBase} border-[#C1443A]/40 text-[#C1443A] hover:bg-[#C1443A]/10`}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {avisosF.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5A554A]">Nenhuma postagem encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {aba === 'comentarios' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E3D4B4]/60 border-b border-[#22201B]/15 text-[11px] font-bold uppercase text-[#5A554A] font-mono">
                  <th className="py-3 px-4">Autor</th>
                  <th className="py-3 px-4">Comentário</th>
                  <th className="py-3 px-4">Aviso</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22201B]/10">
                {comentariosF.map((c) => (
                  <tr key={c.id_comentario} className="hover:bg-[#EDE1CB]/30 align-top">
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">
                      {c.nome_autor}
                      {c.id_pai && <span className="ml-1 text-[10px] font-mono text-[#35577A]">(resposta)</span>}
                    </td>
                    <td className="py-3 px-4 max-w-md break-words whitespace-pre-line">{c.conteudo}</td>
                    <td className="py-3 px-4 text-[#5A554A]">
                      <button onClick={() => onOpenAviso(c.id_aviso)} className="hover:underline text-left cursor-pointer">
                        {tituloAviso(c.id_aviso)}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[#5A554A] whitespace-nowrap">{fmt(c.data_criacao)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Excluir este comentário (e as respostas a ele)?'))
                            onDeleteComentario(c.id_comentario);
                        }}
                        className={`${btnBase} border-[#C1443A]/40 text-[#C1443A] hover:bg-[#C1443A]/10`}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {comentariosF.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5A554A]">Nenhum comentário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {aba === 'usuarios' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E3D4B4]/60 border-b border-[#22201B]/15 text-[11px] font-bold uppercase text-[#5A554A] font-mono">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22201B]/10">
                {usuariosF.map((u) => {
                  const protegido =
                    isAdminEmail(u.email_institucional) ||
                    u.id_usuario === currentUser.id_usuario ||
                    !idsEditaveis.has(u.id_usuario);
                  const motivo = u.id_usuario === currentUser.id_usuario
                    ? 'Você'
                    : isAdminEmail(u.email_institucional)
                      ? 'Admin raiz'
                      : 'Conta fixa';
                  return (
                    <tr key={u.id_usuario} className="hover:bg-[#EDE1CB]/30">
                      <td className="py-3 px-4 font-semibold">{u.nome}</td>
                      <td className="py-3 px-4 font-mono text-[#5A554A]">{u.email_institucional}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded text-[#FAF7F0] ${
                            u.perfil === 'ADMINISTRADOR' ? 'bg-[#1F3B32]' : 'bg-[#35577A]'
                          }`}
                        >
                          {u.perfil}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.bloqueado ? (
                          <span className="text-[#C1443A] font-semibold">Bloqueado</span>
                        ) : (
                          <span className="text-[#1F3B32]">Ativo</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        {protegido ? (
                          <span className="text-[11px] text-[#5A554A] italic">{motivo}</span>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                onChangePerfil(u.id_usuario, u.perfil === 'ADMINISTRADOR' ? 'LEITOR' : 'ADMINISTRADOR')
                              }
                              className={`${btnBase} border-[#35577A]/40 text-[#35577A] hover:bg-[#35577A]/10`}
                            >
                              {u.perfil === 'ADMINISTRADOR' ? 'Rebaixar a leitor' : 'Promover a admin'}
                            </button>
                            <button
                              onClick={() => onToggleBloqueio(u.id_usuario)}
                              className={`${btnBase} border-[#22201B]/30 text-[#22201B] hover:bg-[#22201B]/10`}
                            >
                              {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir o usuário ${u.nome}?`)) onDeleteUsuario(u.id_usuario);
                              }}
                              className={`${btnBase} border-[#C1443A]/40 text-[#C1443A] hover:bg-[#C1443A]/10`}
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
