import React, { useMemo, useState } from 'react';
import type { Comentario, Usuario } from '../types';

interface CommentsSectionProps {
  comentarios: Comentario[]; // já filtrados pelo aviso
  currentUser: Usuario | null;
  onAdd: (conteudo: string, id_pai: string | null) => void;
  onDelete: (id_comentario: string) => void;
  onNavigateLogin: () => void;
}

const MAX_LEN = 1000;
const MAX_INDENT = 4;

const formatData = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface FormProps {
  placeholder: string;
  submitLabel: string;
  onSubmit: (texto: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  id: string;
}

const CommentForm: React.FC<FormProps> = ({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
  id,
}) => {
  const [texto, setTexto] = useState('');
  const valido = texto.trim().length > 0 && texto.length <= MAX_LEN;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valido) return;
        onSubmit(texto);
        setTexto('');
      }}
      className="space-y-2"
    >
      <textarea
        id={id}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={MAX_LEN}
        autoFocus={autoFocus}
        className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32] focus:ring-2 focus:ring-[#1F3B32]/20 resize-y"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] text-[#5A554A] font-mono">
          {texto.length}/{MAX_LEN}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-[#5A554A] hover:underline px-2 cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={!valido}
            className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold px-4 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comentarios,
  currentUser,
  onAdd,
  onDelete,
  onNavigateLogin,
}) => {
  const [respondendoA, setRespondendoA] = useState<string | null>(null);
  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  const filhosPorPai = useMemo(() => {
    const map = new Map<string | null, Comentario[]>();
    [...comentarios]
      .sort((a, b) => a.data_criacao.localeCompare(b.data_criacao))
      .forEach((c) => {
        const lista = map.get(c.id_pai) ?? [];
        lista.push(c);
        map.set(c.id_pai, lista);
      });
    return map;
  }, [comentarios]);

  const renderThread = (id_pai: string | null, nivel: number): React.ReactNode => {
    const filhos = filhosPorPai.get(id_pai) ?? [];
    if (filhos.length === 0) return null;

    return (
      <ul className={nivel > 0 && nivel <= MAX_INDENT ? 'ml-4 sm:ml-8 border-l-2 border-[#1F3B32]/15 pl-3' : ''}>
        {filhos.map((c) => {
          const podeExcluir = isAdmin || currentUser?.id_usuario === c.id_autor;
          return (
            <li key={c.id_comentario} className="py-3" id={c.id_comentario}>
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-[#FAF7F0] ${
                    c.perfil_autor === 'ADMINISTRADOR' ? 'bg-[#1F3B32]' : 'bg-[#35577A]'
                  }`}
                >
                  {c.avatar_autor}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#22201B]">{c.nome_autor}</span>
                    {c.perfil_autor === 'ADMINISTRADOR' && (
                      <span className="text-[9.5px] font-bold font-mono bg-[#1F3B32] text-[#FAF7F0] px-1.5 py-0.5 rounded">
                        ADMIN
                      </span>
                    )}
                    <span className="text-[11px] text-[#5A554A]">{formatData(c.data_criacao)}</span>
                  </div>
                  <p className="text-sm text-[#22201B] mt-1 whitespace-pre-line break-words">{c.conteudo}</p>

                  <div className="flex items-center gap-3 mt-1.5">
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => setRespondendoA(respondendoA === c.id_comentario ? null : c.id_comentario)}
                        className="text-[11px] font-semibold text-[#35577A] hover:underline cursor-pointer"
                      >
                        Responder
                      </button>
                    )}
                    {podeExcluir && (
                      <button
                        type="button"
                        onClick={() => {
                          const temRespostas = (filhosPorPai.get(c.id_comentario) ?? []).length > 0;
                          const msg = temRespostas
                            ? 'Excluir este comentário e todas as respostas a ele?'
                            : 'Excluir este comentário?';
                          if (window.confirm(msg)) onDelete(c.id_comentario);
                        }}
                        className="text-[11px] font-semibold text-[#C1443A] hover:underline cursor-pointer"
                      >
                        Excluir{isAdmin && currentUser?.id_usuario !== c.id_autor ? ' (moderar)' : ''}
                      </button>
                    )}
                  </div>

                  {respondendoA === c.id_comentario && currentUser && (
                    <div className="mt-2">
                      <CommentForm
                        id={`resposta-${c.id_comentario}`}
                        placeholder={`Responder a ${c.nome_autor}…`}
                        submitLabel="Enviar resposta"
                        autoFocus
                        onCancel={() => setRespondendoA(null)}
                        onSubmit={(texto) => {
                          onAdd(texto, c.id_comentario);
                          setRespondendoA(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {renderThread(c.id_comentario, nivel + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section
      aria-labelledby="comentarios-titulo"
      className="mt-6 bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-6 sm:p-8 shadow-md"
    >
      <h2 id="comentarios-titulo" className="font-display text-xl font-bold text-[#1F3B32] mb-4">
        Comentários <span className="text-sm font-mono text-[#5A554A]">({comentarios.length})</span>
      </h2>

      {currentUser ? (
        <div className="mb-4">
          <CommentForm
            id="novo-comentario"
            placeholder="Escreva um comentário…"
            submitLabel="Comentar"
            onSubmit={(texto) => onAdd(texto, null)}
          />
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[#EDE1CB]/60 border border-[#1F3B32]/20 rounded-lg text-xs text-[#22201B] flex flex-wrap items-center justify-between gap-2">
          <span>Você está como visitante. Entre ou cadastre-se para comentar e responder.</span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Entrar / Cadastrar
          </button>
        </div>
      )}

      {comentarios.length === 0 ? (
        <p className="text-xs text-[#5A554A] py-4 text-center">Ainda não há comentários neste aviso.</p>
      ) : (
        <div className="divide-y divide-[#22201B]/10">{renderThread(null, 0)}</div>
      )}
    </section>
  );
};
