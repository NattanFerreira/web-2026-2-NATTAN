import React from 'react';
import { PinIcon } from './PinIcon';

interface IdentityGuideModalProps {
  onResetData: () => void;
}

export const IdentityGuideModal: React.FC<IdentityGuideModalProps> = ({ onResetData }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Brand Header */}
      <div className="flex items-center gap-5 mb-4">
        <PinIcon size={56} variant="dark" />
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1F3B32] tracking-tight">
            Quadro
          </h1>
          <p className="text-sm sm:text-base text-[#5A554A] font-medium mt-1">
            avisos e ocorrências do campus, num só lugar
          </p>
        </div>
      </div>

      <p className="text-sm sm:text-base leading-relaxed text-[#22201B] max-w-3xl pt-5 pb-8 border-t border-[#22201B]/15">
        Identidade construída sobre a metáfora do mural físico que o sistema substitui: o quadro de avisos de corredor e o alfinete que fixa um papel. A marca leva esse vocabulário — cortiça, alfinete, ficha — para uma interface digital sóbria e institucional, sem parecer um "app" genérico.
      </p>

      {/* Color Palette */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-[#5A554A] uppercase tracking-wider font-mono mb-4">
          PALETA DE CORES INSTITUCIONAL
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0] shadow-xs">
            <div className="h-18 bg-[#1F3B32]" />
            <div className="p-3 text-xs">
              <strong className="block text-[#1F3B32] font-semibold">Verde Quadro</strong>
              <span className="font-mono text-[11px] text-[#5A554A]">#1F3B32</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0] shadow-xs">
            <div className="h-18 bg-[#EDE1CB]" />
            <div className="p-3 text-xs">
              <strong className="block text-[#22201B] font-semibold">Cortiça</strong>
              <span className="font-mono text-[11px] text-[#5A554A]">#EDE1CB</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0] shadow-xs">
            <div className="h-18 bg-[#FAF7F0]" />
            <div className="p-3 text-xs">
              <strong className="block text-[#22201B] font-semibold">Giz</strong>
              <span className="font-mono text-[11px] text-[#5A554A]">#FAF7F0</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0] shadow-xs">
            <div className="h-18 bg-[#C1443A]" />
            <div className="p-3 text-xs">
              <strong className="block text-[#C1443A] font-semibold">Alfinete</strong>
              <span className="font-mono text-[11px] text-[#5A554A]">#C1443A</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#22201B]/15 bg-[#FAF7F0] shadow-xs">
            <div className="h-18 bg-[#35577A]" />
            <div className="p-3 text-xs">
              <strong className="block text-[#35577A] font-semibold">Tinta</strong>
              <span className="font-mono text-[11px] text-[#5A554A]">#35577A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-[#5A554A] uppercase tracking-wider font-mono mb-4">
          SISTEMA TIPOGRÁFICO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-6 shadow-xs">
            <div className="font-display text-4xl font-semibold text-[#1F3B32] mb-3">
              Aa Gg Qd
            </div>
            <p className="text-xs text-[#5A554A] leading-relaxed">
              <strong className="text-[#22201B]">Fraunces</strong> — títulos e nome da marca. Serifa com caráter de cartaz de mural impresso; usada só em manchetes e no logótipo, nunca no corpo do texto.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-6 shadow-xs">
            <div className="font-sans text-3xl font-semibold text-[#35577A] mb-3">
              Aa Gg Qd
            </div>
            <p className="text-xs text-[#5A554A] leading-relaxed">
              <strong className="text-[#22201B]">IBM Plex Sans</strong> — interface, formulários e corpo de texto. Traço técnico e institucional, legível em telas densas de dados (tabelas, filtros, status).
            </p>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-[#5A554A] uppercase tracking-wider font-mono mb-4">
          PRINCÍPIOS DE DESIGN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-xs">
            <div className="font-mono text-xs font-bold text-[#C1443A] mb-1.5">01</div>
            <h4 className="font-display text-base font-bold text-[#1F3B32] mb-1.5">
              Papel fixado, não cartão flutuante
            </h4>
            <p className="text-xs text-[#5A554A] leading-relaxed">
              Avisos são fichas levemente rotacionadas com um "alfinete" no topo — não cards uniformes com sombra genérica.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-xs">
            <div className="font-mono text-xs font-bold text-[#C1443A] mb-1.5">02</div>
            <h4 className="font-display text-base font-bold text-[#1F3B32] mb-1.5">
              Cor com função
            </h4>
            <p className="text-xs text-[#5A554A] leading-relaxed">
              O vermelho do alfinete é reservado a urgência e ação (ocorrência aberta, publicar). Azul-tinta é só para links e referência.
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-5 shadow-xs">
            <div className="font-mono text-xs font-bold text-[#C1443A] mb-1.5">03</div>
            <h4 className="font-display text-base font-bold text-[#1F3B32] mb-1.5">
              Textura de cortiça, não gradiente
            </h4>
            <p className="text-xs text-[#5A554A] leading-relaxed">
              O fundo pontilhado substitui washes decorativos — remete à superfície física do mural sem enfeite gratuito.
            </p>
          </div>
        </div>
      </div>

      {/* Project & Tech info */}
      <div className="bg-[#FAF7F0] border border-[#22201B]/15 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-lg font-bold text-[#1F3B32]">
            Avaliação 03 — Projeto Final
          </h4>
          <p className="text-xs text-[#5A554A] mt-0.5">
            Nattan Ferreira Lopes · UFERSA · Arquitetura Serverless AWS (Amplify, S3, DynamoDB, Lambda, API Gateway)
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Deseja restaurar os avisos e ocorrências padrão da demonstração?')) {
              onResetData();
            }
          }}
          className="border border-[#1F3B32] text-[#1F3B32] hover:bg-[#1F3B32] hover:text-[#FAF7F0] text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer"
        >
          Restaurar dados de teste
        </button>
      </div>
    </div>
  );
};

