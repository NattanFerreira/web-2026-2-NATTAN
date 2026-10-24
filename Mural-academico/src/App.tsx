import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Aviso, Comentario, Ocorrencia, StatusOcorrencia, Usuario } from './types';
import { storageService, isAdminEmail } from './services/storageService';
import { authService } from './services/authService';
import { cognitoLogout } from './services/ssoAuth';
import { useRouter } from './router/useRouter';
import { Navbar } from './components/Navbar';
import { MuralPage } from './pages/MuralPage';
import { MyOccurrencesPage } from './pages/MyOccurrencesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NoticeDetailPage } from './pages/NoticeDetailPage';
import { LoginPage } from './pages/LoginPage';
import { CreateNoticePage } from './pages/CreateNoticePage';
import { CreateOccurrencePage } from './pages/CreateOccurrencePage';
import { EditNoticePage } from './pages/EditNoticePage';
import { AdminManagePage } from './pages/AdminManagePage';
import { OccurrenceDetailModal } from './components/OccurrenceDetailModal';
import { LINKS_UTEIS, ENDERECO_CAMPUS } from './data/links';

export function App() {
  const { currentTab, params, navigate } = useRouter();

  const [currentUser, setCurrentUser] = useState<Usuario | null>(() =>
    authService.getCurrentUser()
  );
  // Visitante: navega sem conta, apenas leitura (vale enquanto a aba estiver aberta)
  const [isGuest, setIsGuest] = useState<boolean>(() => storageService.isGuest());

  const [avisos, setAvisos] = useState<Aviso[]>(() => storageService.getAvisos());
  const [comentarios, setComentarios] = useState<Comentario[]>(() =>
    storageService.getComentarios()
  );
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => storageService.getUsuarios());
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(() =>
    storageService.getOcorrencias()
  );

  // Sem sessão nem modo visitante, a única tela disponível é o login
  const needsLogin = !currentUser && !isGuest;

  // Usuário já autenticado não precisa ver a tela de login
  useEffect(() => {
    if (currentUser && currentTab === 'login') {
      navigate(currentUser.perfil === 'ADMINISTRADOR' ? 'admin-gestao' : 'mural');
    }
  }, [currentUser, currentTab, navigate]);

  // Garante que a URL reflita a tela de login quando não há sessão
  useEffect(() => {
    if (needsLogin && currentTab !== 'login') navigate('login');
  }, [needsLogin, currentTab, navigate]);

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
  const handleAuthenticated = (user: Usuario) => {
    setCurrentUser(user);
    setIsGuest(false);
    setUsuarios(storageService.getUsuarios());
    showToast(`Bem-vindo(a), ${user.nome.split(' ')[0]}!`);
    navigate(user.perfil === 'ADMINISTRADOR' ? 'admin-gestao' : 'mural');
  };

  const handleGuest = () => {
    authService.enterAsGuest();
    setIsGuest(true);
    navigate('mural');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsGuest(false);
    try {
      // Encerra também a sessão no Cognito/Google e volta para "/" (tela de login)
      cognitoLogout();
    } catch {
      // Sem configuração do Cognito (ex.: variáveis VITE_* ausentes): logout apenas local
      navigate('login');
    }
  };

  // Handlers de Comentários (apenas autenticados; exclusão: autor ou administrador)
  const handleAddComentario = (id_aviso: string, conteudo: string, id_pai: string | null) => {
    if (!currentUser) return;
    storageService.addComentario({ id_aviso, id_pai, conteudo, autor: currentUser });
    setComentarios(storageService.getComentarios());
  };

  const handleDeleteComentario = (id_comentario: string) => {
    const alvo = comentarios.find((c) => c.id_comentario === id_comentario);
    if (!alvo || !currentUser) return;
    if (currentUser.perfil !== 'ADMINISTRADOR' && alvo.id_autor !== currentUser.id_usuario) return;
    storageService.deleteComentario(id_comentario);
    setComentarios(storageService.getComentarios());
    showToast('Comentário removido.');
  };

  // Handlers de gestão de usuários (somente administrador)
  const isAdminUser = currentUser?.perfil === 'ADMINISTRADOR';

  const podeGerenciarUsuario = (id: string): Usuario | undefined => {
    if (!isAdminUser || !currentUser || id === currentUser.id_usuario) return undefined;
    const alvo = storageService.getUsuarioPorId(id);
    if (!alvo || isAdminEmail(alvo.email_institucional)) return undefined;
    return alvo;
  };

  const handleChangePerfil = (id: string, perfil: Usuario['perfil']) => {
    if (!podeGerenciarUsuario(id)) return;
    storageService.updateUsuario(id, { perfil });
    setUsuarios(storageService.getUsuarios());
    showToast(`Perfil alterado para ${perfil === 'ADMINISTRADOR' ? 'Administrador' : 'Leitor'}.`);
  };

  const handleToggleBloqueio = (id: string) => {
    const alvo = podeGerenciarUsuario(id);
    if (!alvo) return;
    storageService.updateUsuario(id, { bloqueado: !alvo.bloqueado });
    setUsuarios(storageService.getUsuarios());
    showToast(alvo.bloqueado ? 'Usuário desbloqueado.' : 'Usuário bloqueado.');
  };

  const handleDeleteUsuario = (id: string) => {
    if (!podeGerenciarUsuario(id)) return;
    storageService.deleteUsuario(id);
    setUsuarios(storageService.getUsuarios());
    showToast('Usuário excluído.');
  };

  const handleUpdateAviso = async (id: string, data: Partial<Aviso>) => {
    if (!isAdminUser) return;
    storageService.updateAviso(id, data);
    setAvisos(storageService.getAvisos());
    showToast('Aviso atualizado com sucesso.');
    navigate('detalhe-aviso', { id });
  };

  const getAvisoById = useCallback(
    (id: string) => storageService.getAvisos().find((a) => a.id_aviso === id),
    []
  );

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
    if (!isAdminUser) return;
    storageService.deleteAviso(id_aviso);
    setAvisos(storageService.getAvisos());
    setComentarios(storageService.getComentarios());
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

  const handleUpdateOcorrenciaStatus = (
    id_ocorrencia: string,
    newStatus: StatusOcorrencia,
    parecer?: string
  ) => {
    storageService.updateOcorrenciaStatus(id_ocorrencia, newStatus, parecer);
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


  // Aviso selecionado para a página de detalhe
  const currentAviso = useMemo(() => {
    if (currentTab === 'detalhe-aviso' && params.id) {
      return avisos.find((a) => a.id_aviso === params.id);
    }
    return undefined;
  }, [currentTab, params.id, avisos]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDE1CB] text-[#22201B]">

      {/* Barra de Navegação Superior (oculta na tela de login) */}
      {!needsLogin && currentTab !== 'login' && (
        <Navbar
          currentTab={currentTab}
          onNavigate={(tab) => navigate(tab)}
          currentUser={currentUser}
          onLogout={handleLogout}
          totalOcorrenciasAbertas={totalAbertas}
        />
      )}

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
        {/* Rota: Autenticação — tela inicial (entrar, cadastrar, Google ou visitante) */}
        {(needsLogin || currentTab === 'login') && (
          <LoginPage onAuthenticated={handleAuthenticated} onGuest={handleGuest} />
        )}

        {/* Rota: Mural Público */}
        {!needsLogin && currentTab === 'mural' && (
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
        {!needsLogin && currentTab === 'detalhe-aviso' && (
          <NoticeDetailPage
            aviso={currentAviso}
            currentUser={currentUser}
            comentarios={comentarios.filter((c) => c.id_aviso === params.id)}
            onAddComentario={handleAddComentario}
            onDeleteComentario={handleDeleteComentario}
            onNavigateLogin={() => navigate('login')}
            onBack={() => navigate('mural')}
            onReportOccurrence={(loc) => navigate('nova-ocorrencia', { local: loc })}
            onDeleteAviso={handleDeleteAviso}
            onEditAviso={(id) => navigate('admin-editar-aviso', { id })}
          />
        )}

        {/* Rota: Editar Aviso (Admin) */}
        {!needsLogin && currentTab === 'admin-editar-aviso' && params.id && (
          <EditNoticePage
            avisoId={params.id}
            currentUser={currentUser}
            getAviso={getAvisoById}
            onSubmit={handleUpdateAviso}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Gestão do sistema (Admin) */}
        {!needsLogin && currentTab === 'admin-gestao' && (
          <AdminManagePage
            currentUser={currentUser}
            avisos={avisos}
            comentarios={comentarios}
            usuarios={usuarios}
            idsEditaveis={new Set(storageService.getUsuariosRegistrados().map((u) => u.id_usuario))}
            onOpenAviso={(id) => navigate('detalhe-aviso', { id })}
            onEditAviso={(id) => navigate('admin-editar-aviso', { id })}
            onDeleteAviso={handleDeleteAviso}
            onNewAviso={() => navigate('admin-novo-aviso')}
            onDeleteComentario={handleDeleteComentario}
            onChangePerfil={handleChangePerfil}
            onToggleBloqueio={handleToggleBloqueio}
            onDeleteUsuario={handleDeleteUsuario}
            onNavigateOcorrencias={() => navigate('admin-ocorrencias')}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Nova Ocorrência */}
        {!needsLogin && currentTab === 'nova-ocorrencia' && (
          <CreateOccurrencePage
            currentUser={currentUser}
            defaultLocation={params.local}
            onSubmit={handleCreateOcorrencia}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Publicar Novo Aviso (Admin) */}
        {!needsLogin && currentTab === 'admin-novo-aviso' && (
          <CreateNoticePage
            currentUser={currentUser}
            onSubmit={handleCreateAviso}
            onNavigateLogin={() => navigate('login')}
            onNavigateMural={() => navigate('mural')}
          />
        )}

        {/* Rota: Minhas Ocorrências (Leitor) */}
        {!needsLogin && currentTab === 'minhas-ocorrencias' && (
          <MyOccurrencesPage
            ocorrencias={ocorrencias}
            currentUser={currentUser}
            onOpenCreate={() => navigate('nova-ocorrencia')}
            onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
            onNavigateLogin={() => navigate('login')}
          />
        )}

        {/* Rota: Painel Administrativo de Ocorrências (Admin) */}
        {!needsLogin && currentTab === 'admin-ocorrencias' && (
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

      {/* Rodapé Comunitário do Campus */}
      <footer className="bg-[#182e27] text-[#FAF7F0]/85 text-xs border-t border-[#274A3F] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-[#274A3F]">
            {/* Coluna 1: Sobre o Quadro */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display font-bold text-lg text-[#FAF7F0]">Quadro</span>
                <span className="text-[10px] font-semibold bg-[#274A3F] text-[#FAF7F0]/90 px-2 py-0.5 rounded">
                  De alunos para alunos 🎓
                </span>
              </div>
              <p className="text-[#FAF7F0]/70 text-[11.5px] leading-relaxed mb-3">
                Mural colaborativo do campus para avisos gerais, editais de monitoria, eventos,
                achados & perdidos e problemas nas salas ou blocos. Um ponto de encontro pensado
                para quem vive o dia a dia da universidade.
              </p>
              <p className="text-[11px] text-[#FAF7F0]/50 font-mono leading-tight">
                {ENDERECO_CAMPUS}
              </p>
            </div>

            {/* Coluna 2: Atalhos Acadêmicos */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FAF7F0] mb-3 font-mono">
                Dia a Dia Acadêmico
              </h4>
              <ul className="space-y-2">
                {LINKS_UTEIS.slice(0, 3).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      download={link.download}
                      className="text-[#FAF7F0]/75 hover:text-white transition flex items-center justify-between text-xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                      </span>
                      {link.download ? (
                        <span className="text-[9.5px] bg-[#C1443A] text-white px-1.5 py-0.2 rounded font-mono">
                          PDF
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          ↗
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna 3: Apoio & Comunidade */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[#FAF7F0] mb-3 font-mono">
                Apoio no Campus
              </h4>
              <ul className="space-y-2">
                {LINKS_UTEIS.slice(3).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FAF7F0]/75 hover:text-white transition flex items-center justify-between text-xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                      </span>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-[#FAF7F0]/60">
            <div>
              Quadro Acadêmico · Plataforma comunitária estudantil da UFERSA.
            </div>
            <div>
              Criado e mantido pela comunidade discente · Campus Mossoró
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
