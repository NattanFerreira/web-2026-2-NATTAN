import React from 'react';
import { PinIcon } from './PinIcon';

interface IdentityGuideModalProps {
  onResetData: () => void;
}

const MONO = { fontFamily: "'IBM Plex Mono', monospace" };

const cores = [
  { nome: 'Verde Quadro', hex: '#1F3B32' },
  { nome: 'Cortiça', hex: '#EDE1CB' },
  { nome: 'Giz', hex: '#FAF7F0' },
  { nome: 'Alfinete', hex: '#C1443A' },
  { nome: 'Tinta', hex: '#35577A' },
];

const principios = [
  {
    num: '01',
    titulo: 'Papel fixado, não cartão flutuante',
    texto:
      'Avisos são fichas levemente rotacionadas com um "alfinete" no topo — não cards uniformes com sombra genérica.',
  },
  {
    num: '02',
    titulo: 'Cor com função',
    texto:
      'O vermelho do alfinete é reservado a urgência e ação (ocorrência aberta, publicar). Azul-tinta é só para links e referência.',
  },
  {
    num: '03',
    titulo: 'Textura de cortiça, não gradiente',
    texto:
      'O fundo pontilhado substitui washes decorativos — remete à superfície física do mural sem enfeite gratuito.',
  },
];

const BlockTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[12.5px] font-semibold text-[#5A554A] mb-3.5">{children}</p>
);

export const IdentityGuideModal: React.FC<IdentityGuideModalProps> = ({ onResetData }) => {
  return (
    <div className="max-w-[980px] mx-auto px-7 pt-14 pb-24">
      {/* Marca */}
      <div className="flex items-center gap-[22px] mb-2.5">
        <PinIcon size={52} variant="dark" />
        <h1 className="font-display text-[56px] leading-none font-bold tracking-tight text-[#1F3B32] m-0">
          Quadro
        </h1>
      </div>
      <p className="text-base text-[#5A554A] mt-0.5 ml-1">
        avisos e ocorrências do campus, num só lugar
      </p>

      <p className="text-[17px] leading-[1.65] text-[#22201B] max-w-[640px] mt-[26px] mb-12 pt-[22px] border-t border-[#22201B]/15">
        Identidade construída sobre a metáfora do mural físico que o sistema substitui: o quadro de
        avisos de corredor e o alfinete que fixa um papel. A marca leva esse vocabulário — cortiça,
        alfinete, ficha — para uma interface digital sóbria e institucional, sem parecer um "app"
        genérico.
      </p>

      {/* Paleta */}
      <BlockTitle>PALETA DE CORES</BlockTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-[52px]">
        {cores.map((c) => (
          <div
            key={c.hex}
            className="rounded-[10px] overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0]"
          >
            <div className="h-[78px]" style={{ backgroundColor: c.hex }} />
            <div className="px-3 py-2.5">
              <b className="block text-[12.5px] mb-0.5">{c.nome}</b>
              <span className="text-[11px] text-[#5A554A]" style={MONO}>
                {c.hex}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tipografia */}
      <BlockTitle>TIPOGRAFIA</BlockTitle>
      <div className="flex flex-wrap gap-10 mb-[52px]">
        <div className="flex-1 min-w-[280px] bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl px-7 py-[26px]">
          <div className="font-display text-[44px] font-semibold text-[#1F3B32] leading-none mt-1.5 mb-2.5">
            Aa Gg Qd
          </div>
          <p className="text-[13px] leading-[1.6] text-[#5A554A]">
            <b>Fraunces</b> — títulos e nome da marca. Serifa com caráter de cartaz de mural
            impresso; usada só em manchetes e no logótipo, nunca no corpo do texto.
          </p>
        </div>
        <div className="flex-1 min-w-[280px] bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl px-7 py-[26px]">
          <div className="text-[30px] font-semibold text-[#35577A] leading-none mt-1.5 mb-2.5">
            Aa Gg Qd
          </div>
          <p className="text-[13px] leading-[1.6] text-[#5A554A]">
            <b>IBM Plex Sans</b> — interface, formulários e corpo de texto. Traço técnico e
            institucional, legível em telas densas de dados (tabelas, filtros, status).
          </p>
        </div>
      </div>

      {/* Princípios */}
      <BlockTitle>PRINCÍPIOS</BlockTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mb-8">
        {principios.map((p) => (
          <div
            key={p.num}
            className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl px-[22px] py-5"
          >
            <div className="text-xs text-[#C1443A] mb-2" style={MONO}>
              {p.num}
            </div>
            <h3 className="text-base text-[#1F3B32] mb-2">{p.titulo}</h3>
            <p className="text-[13px] leading-[1.55] text-[#5A554A]">{p.texto}</p>
          </div>
        ))}
      </div>

      {/* Ação utilitária do App */}
      <div className="pt-6 border-t border-[#22201B]/15">
        <button
          onClick={onResetData}
          className="px-4 py-2 rounded-md bg-[#C1443A] text-[#FAF7F0] text-sm font-semibold hover:opacity-90 cursor-pointer"
        >
          Restaurar dados demo
        </button>
      </div>
    </div>
  );
};
