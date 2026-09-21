import { useState, useMemo } from 'react';
import type { Aviso, Ocorrencia, StatusOcorrencia, Usuario } from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { useRouter } from './router/useRouter';
import { Navbar } from './components/Navbar';
import { MuralPage } from './pages/MuralPage';
import { MyOccurrencesPage } from './pages/MyOccurrencesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NoticeDetailPage } from './pages/NoticeDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateNoticePage } from './pages/CreateNoticePage';
import { CreateOccurrencePage } from './pages/CreateOccurrencePage';
import { OccurrenceDetailModal } from './components/OccurrenceDetailModal';
import { IdentityGuideModal } from './components/IdentityGuideModal';

export function App() {
  const { currentTab, params, navigate } = useRouter();

  const [currentUser, setCurrentUser] = useState<Usuario | null>(() =>
    authService.getCurrentUser()
  );

  const [avisos, setAvisos] = useState<Aviso[]>(() => storageService.getAvisos());
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(() =>
    storageService.getOcorrencias()
  );
  const [allUsers, setAllUsers] = useState<Usuario[]>(() => storageService.getUsuarios());

  // Modal para detalhamento rápido de ocorrência
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);

  // Notificações / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Contagem de ocorrências pendentes
  const totalAbertas = useMemo(
    () => ocorrencias.filter((o) => o.status === 'ABERTA').length,
    [ocorrencias]
  );

  // Handlers de Autenticação
  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    showToast(`Bem-vindo(a), ${user.nome}! Autenticado como ${user.perfil}.`);
    if (user.perfil === 'ADMINISTRADOR') {
      navigate('admin-ocorrencias');
    } else {
      navigate('mural');
    }
  };

  const handleRegister = (user: Usuario) => {
    setCurrentUser(user);
    setAllUsers(storageService.getUsuarios());
    showToast(`Conta de Leitor criada com sucesso! Seja bem-vindo(a), ${user.nome}.`);
    navigate('mural');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('Sessão encerrada com sucesso.');
    navigate('mural');
  };

  const handleSwitchUser = (user: Usuario) => {
    authService.login({
      email: user.email_institucional,
      senha: user.senha || (user.perfil === 'ADMINISTRADOR' ? 'admin123' : 'aluno123'),
    });
    setCurrentUser(user);
    showToast(
      `Perfil alterado para ${user.nome} (${user.perfil === 'ADMINISTRADOR' ? 'Administrador' : 'Leitor'})`
    );
    if (user.perfil === 'ADMINISTRADOR' && currentTab === 'minhas-ocorrencias') {
      navigate('admin-ocorrencias');
    } else if (user.perfil === 'LEITOR' && (currentTab === 'admin-ocorrencias' || currentTab === 'admin-novo-aviso')) {
      navigate('mural');
    }
  };

  // Handlers de Avisos
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
    navigate('mural');
  };

  const handleDeleteAviso = (id_aviso: string) => {
    storageService.deleteAviso(id_aviso);
    setAvisos(storageService.getAvisos());
    showToast('Aviso removido do mural.');
    navigate('mural');
  };

  // Handlers de Ocorrências
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
    if (currentUser?.perfil === 'LEITOR') {
      navigate('minhas-ocorrencias');
    } else {
      navigate('admin-ocorrencias');
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
    setCurrentUser(authService.getCurrentUser());
    setAvisos(storageService.getAvisos());
    setOcorrencias(storageService.getOcorrencias());
    setAllUsers(storageService.getUsuarios());
    showToast('Dados de demonstração restaurados com sucesso!');
    navigate('mural');
  };

  // Aviso selecionado para a página de detalhe
  const currentAviso = useMemo(() => {
    if (currentTab === 'detalhe-aviso' && params.id) {
      return avisos.find((a) => a.id_aviso === params.id);
    }
    return undefined;
  }, [currentTab, params.id, avisos]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDE1CB] text-[#22201B]">
      {/* Barra de Domínio Institucional e Metadados do Projeto */}
      <div className="bg-[#182e27] text-[#FAF7F0]/80 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between border-b border-[#274A3F]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0]/30 inline-block" />
          <span className="bg-[#FAF7F0]/10 px-2.5 py-0.5 rounded text-[10.5px] ml-2">
            mural.ufersa.edu.br
          </span>
          <span className="text-[10px] text-[#FAF7F0]/50 hidden md:inline">
            · AWS Serverless Architecture (Amplify, API Gateway, Lambda, DynamoDB, S3)
          </span>
        </div>
        <div className="text-[10.5px] hidden sm:flex items-center gap-3">
          <span>UFERSA · Universidade Federal Rural do Semi-Árido</span>
          {currentUser && (
            <span className="bg-[#274A3F] px-2 py-0.5 rounded text-[10px] font-bold">
              {currentUser.perfil}
            </span>
          )}
        </div>
      </div>

      {/* Barra de Navegação Superior Principal */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => navigate(tab)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        totalOcorrenciasAbertas={totalAbertas}
      />

      {/* Notificação Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1F3B32] text-[#FAF7F0] border border-[#274A3F] px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <span className="text-[#C1443A] text-base">📌</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#FAF7F0]/60 hover:text-[#FAF7F0] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conteúdo Principal da Página (com fundo texturizado do Quadro) */}
      <main className="flex-1 cork-texture">
        {/* Rota: Mural Público */}
        {currentTab === 'mural' && (
          <MuralPage
            avisos={avisos}
            currentUser={currentUser}
            onSelectAviso={(aviso) => navigate('detalhe-aviso', { id: aviso.id_aviso })}
            onOpenCreateAviso={() => navigate('admin-novo-aviso')}
            onOpenCreateOcorrencia={() => navigate('nova-ocorrencia')}
            onDeleteAviso={handleDeleteAviso}
          />
        )}

        {/* Rota: Detalhe do Aviso */}
        {currentTab === 'detalhe-aviso' && (
          <NoticeDetailPage
            aviso={currentAviso}
            currentUser={currentUser}
            onBack={() => navigate('mural')}
            onReportOccurrence={(loc) => navigate('nova-ocorrencia', { local: loc })}
            onDeleteAviso={handleDeleteAviso}
          />
        )}

        {/* Rota: Autenticação (Login) */}
        {currentTab === 'login' && (
          <LoginPage
            onSuccess={handleLogin}
            onNavigateRegister={() => navigate('cadastro')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Cadastro de Usuário (Leitor) */}
        {currentTab === 'cadastro' && (
          <RegisterPage
            onSuccess={handleRegister}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Nova Ocorrência */}
        {currentTab === 'nova-ocorrencia' && (
          <CreateOccurrencePage
            currentUser={currentUser}
            defaultLocation={params.local}
            onSubmit={handleCreateOcorrencia}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Publicar Novo Aviso (Admin) */}
        {currentTab === 'admin-novo-aviso' && (
          <CreateNoticePage
            currentUser={currentUser}
            onSubmit={handleCreateAviso}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Minhas Ocorrências (Leitor) */}
        {currentTab === 'minhas-ocorrencias' && (
          <MyOccurrencesPage
            ocorrencias={ocorrencias}
            currentUser={currentUser}
            onOpenCreate={() => navigate('nova-ocorrencia')}
            onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
            onNavigateLogin={() => navigate('login')}
          />
        )}

        {/* Rota: Painel Administrativo de Ocorrências (Admin) */}
        {currentTab === 'admin-ocorrencias' && (
          <AdminDashboardPage
            ocorrencias={ocorrencias}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateOcorrenciaStatus}
            onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
            onDeleteOcorrencia={handleDeleteOcorrencia}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Sobre e Guia de Identidade Visual */}
        {currentTab === 'sobre' && <IdentityGuideModal onResetData={handleResetData} />}
      </main>

      {/* Modal de Detalhes da Ocorrência */}
      {selectedOcorrencia && (
        <OccurrenceDetailModal
          ocorrencia={selectedOcorrencia}
          onClose={() => setSelectedOcorrencia(null)}
          currentUser={currentUser}
          onUpdateStatus={handleUpdateOcorrenciaStatus}
        />
      )}

      {/* Rodapé Institucional */}
      <footer className="bg-[#1F3B32] text-[#FAF7F0]/80 text-xs py-5 px-4 border-t border-[#274A3F]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-display font-bold text-sm text-[#FAF7F0]">Quadro</span> —
            Gerenciador de Avisos e Ocorrências Acadêmicas
            <p className="text-[11px] text-[#FAF7F0]/60 mt-0.5">
              Projeto Final · Avaliação 03 · Nattan Ferreira Lopes · UFERSA
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => navigate('sobre')}
              className="hover:text-[#FAF7F0] underline cursor-pointer"
            >
              Guia da Identidade Visual & Arquitetura
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
    </div>
  );
}

export default App;
