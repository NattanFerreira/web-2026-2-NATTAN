import { useState, useEffect } from 'react';
import type { Aviso, Ocorrencia, StatusOcorrencia, TabNavegacao, Usuario } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { MuralPage } from './pages/MuralPage';
import { MyOccurrencesPage } from './pages/MyOccurrencesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { CreateNoticeModal } from './components/CreateNoticeModal';
import { CreateOccurrenceModal } from './components/CreateOccurrenceModal';
import { OccurrenceDetailModal } from './components/OccurrenceDetailModal';
import { IdentityGuideModal } from './components/IdentityGuideModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<Usuario>(() => storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<TabNavegacao>('mural');

  const [avisos, setAvisos] = useState<Aviso[]>(() => storageService.getAvisos());
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(() =>
    storageService.getOcorrencias()
  );

  // Modals state
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isCreateAvisoOpen, setIsCreateAvisoOpen] = useState(false);
  const [isCreateOcorrenciaOpen, setIsCreateOcorrenciaOpen] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState<string | undefined>(undefined);

  // Notification / toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keep state synced with localStorage
  useEffect(() => {
    storageService.setCurrentUser(currentUser);
  }, [currentUser]);

  // Contagem de ocorrências pendentes
  const totalAbertas = ocorrencias.filter((o) => o.status === 'ABERTA').length;

  const handleSwitchUser = (user: Usuario) => {
    setCurrentUser(user);
    if (user.perfil === 'ADMINISTRADOR' && currentTab === 'minhas-ocorrencias') {
      setCurrentTab('admin-ocorrencias');
    } else if (user.perfil === 'LEITOR' && currentTab === 'admin-ocorrencias') {
      setCurrentTab('minhas-ocorrencias');
    }
    showToast(`Perfil alterado para ${user.nome} (${user.perfil === 'ADMINISTRADOR' ? 'Administrador' : 'Leitor'})`);
  };

  // Notice handlers
  const handleCreateAviso = (data: {
    titulo: string;
    conteudo: string;
    categoria: Aviso['categoria'];
    local_bloco: string;
    id_autor: string;
    nome_autor: string;
    nome_anexo?: string;
    tamanho_anexo?: string;
  }) => {
    const novo = storageService.addAviso(data);
    setAvisos(storageService.getAvisos());
    showToast(`Aviso "${novo.titulo}" publicado com sucesso no mural!`);
    setCurrentTab('mural');
  };

  const handleDeleteAviso = (id_aviso: string) => {
    storageService.deleteAviso(id_aviso);
    setAvisos(storageService.getAvisos());
    if (selectedAviso?.id_aviso === id_aviso) {
      setSelectedAviso(null);
    }
    showToast('Aviso removido do mural.');
  };

  // Occurrence handlers
  const handleCreateOcorrencia = (data: {
    titulo: string;
    descricao: string;
    categoria: Ocorrencia['categoria'];
    local_bloco: string;
    id_solicitante: string;
    nome_solicitante: string;
    url_foto?: string;
  }) => {
    const nova = storageService.addOcorrencia(data);
    setOcorrencias(storageService.getOcorrencias());
    showToast(`Ocorrência "${nova.titulo}" registrada com sucesso!`);
    if (currentUser.perfil === 'LEITOR') {
      setCurrentTab('minhas-ocorrencias');
    } else {
      setCurrentTab('admin-ocorrencias');
    }
  };

  const handleUpdateOcorrenciaStatus = (id_ocorrencia: string, newStatus: StatusOcorrencia) => {
    storageService.updateOcorrenciaStatus(id_ocorrencia, newStatus);
    const atualizadas = storageService.getOcorrencias();
    setOcorrencias(atualizadas);
    if (selectedOcorrencia?.id_ocorrencia === id_ocorrencia) {
      const atual = atualizadas.find((o) => o.id_ocorrencia === id_ocorrencia);
      if (atual) setSelectedOcorrencia(atual);
    }
    const statusLabels: Record<StatusOcorrencia, string> = {
      ABERTA: 'Aberta',
      EM_ANDAMENTO: 'Em andamento',
      RESOLVIDA: 'Resolvida',
    };
    showToast(`Status da ocorrência atualizado para "${statusLabels[newStatus]}".`);
  };

  const handleDeleteOcorrencia = (id_ocorrencia: string) => {
    storageService.deleteOcorrencia(id_ocorrencia);
    setOcorrencias(storageService.getOcorrencias());
    if (selectedOcorrencia?.id_ocorrencia === id_ocorrencia) {
      setSelectedOcorrencia(null);
    }
    showToast('Registro de ocorrência excluído.');
  };

  const handleResetData = () => {
    storageService.resetAllData();
    setCurrentUser(storageService.getCurrentUser());
    setAvisos(storageService.getAvisos());
    setOcorrencias(storageService.getOcorrencias());
    showToast('Dados de teste restaurados com sucesso!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EDE1CB] text-[#22201B]">
      {/* Institutional Top Domain Bar (Amplify & Institutional Identity) */}
      <div className="bg-[#182e27] text-[#FAF7F0]/80 px-4 py-1 text-[11px] font-mono flex items-center justify-between border-b border-[#274A3F]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="bg-[#FAF7F0]/10 px-2.5 py-0.5 rounded text-[10.5px] ml-2">
            mural.ufersa.edu.br
          </span>
        </div>
        <div className="text-[10px] hidden sm:block">
          UFERSA · Universidade Federal Rural do Semi-Árido
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenCreateAviso={() => setIsCreateAvisoOpen(true)}
        onOpenCreateOcorrencia={() => {
          setDefaultLocation(undefined);
          setIsCreateOcorrenciaOpen(true);
        }}
        totalOcorrenciasAbertas={totalAbertas}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1F3B32] text-[#FAF7F0] border border-[#274A3F] px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <span className="text-[#C1443A] text-base">📌</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#FAF7F0]/60 hover:text-[#FAF7F0]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area with Cork Texture */}
      <main className="flex-1 cork-texture">
        {currentTab === 'mural' && (
          <MuralPage
            avisos={avisos}
            currentUser={currentUser}
            onSelectAviso={(aviso) => setSelectedAviso(aviso)}
            onOpenCreateAviso={() => setIsCreateAvisoOpen(true)}
            onOpenCreateOcorrencia={() => {
              setDefaultLocation(undefined);
              setIsCreateOcorrenciaOpen(true);
            }}
            onDeleteAviso={handleDeleteAviso}
          />
        )}

        {currentTab === 'minhas-ocorrencias' && (
          <MyOccurrencesPage
            ocorrencias={ocorrencias}
            currentUser={currentUser}
            onOpenCreate={() => {
              setDefaultLocation(undefined);
              setIsCreateOcorrenciaOpen(true);
            }}
            onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
          />
        )}

        {currentTab === 'admin-ocorrencias' && (
          <AdminDashboardPage
            ocorrencias={ocorrencias}
            onUpdateStatus={handleUpdateOcorrenciaStatus}
            onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
            onDeleteOcorrencia={handleDeleteOcorrencia}
          />
        )}

        {currentTab === 'sobre' && <IdentityGuideModal onResetData={handleResetData} />}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-[#1F3B32] text-[#FAF7F0]/80 text-xs py-5 px-4 border-t border-[#274A3F]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-display font-bold text-sm text-[#FAF7F0]">Quadro</span> — Gerenciador de Avisos e Ocorrências Acadêmicas
            <p className="text-[11px] text-[#FAF7F0]/60 mt-0.5">
              Projeto Final · Avaliação 03 · Nattan Ferreira Lopes · UFERSA
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('sobre')}
              className="hover:text-[#FAF7F0] underline cursor-pointer"
            >
              Guia da Identidade Visual
            </button>
            <button
              onClick={handleResetData}
              className="hover:text-[#FAF7F0] underline cursor-pointer text-[#C1443A]"
            >
              Restaurar dados demo
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {selectedAviso && (
        <NoticeDetailModal
          aviso={selectedAviso}
          onClose={() => setSelectedAviso(null)}
          onReportOccurrence={(loc) => {
            setDefaultLocation(loc);
            setIsCreateOcorrenciaOpen(true);
          }}
        />
      )}

      {isCreateAvisoOpen && (
        <CreateNoticeModal
          isOpen={isCreateAvisoOpen}
          onClose={() => setIsCreateAvisoOpen(false)}
          currentUser={currentUser}
          onSubmit={handleCreateAviso}
        />
      )}

      {isCreateOcorrenciaOpen && (
        <CreateOccurrenceModal
          isOpen={isCreateOcorrenciaOpen}
          onClose={() => setIsCreateOcorrenciaOpen(false)}
          currentUser={currentUser}
          defaultLocation={defaultLocation}
          onSubmit={handleCreateOcorrencia}
        />
      )}

      {selectedOcorrencia && (
        <OccurrenceDetailModal
          ocorrencia={selectedOcorrencia}
          onClose={() => setSelectedOcorrencia(null)}
          currentUser={currentUser}
          onUpdateStatus={handleUpdateOcorrenciaStatus}
        />
      )}
    </div>
  );
}

export default App;
