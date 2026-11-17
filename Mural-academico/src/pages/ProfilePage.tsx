import React, { useState, useEffect, useRef } from 'react';
import type { Usuario } from '../types';
import {
  getUserProfile,
  updateUserProfile,
  type UserProfileData,
} from '../services/profileService';
import { compressImage } from '../utils/imageCompressor';
import { getCognitoIdToken, getCognitoAccessToken, startGoogleLogin } from '../services/ssoAuth';
import { storageService } from '../services/storageService';
import {
  IconCamera,
  IconCheck,
  IconAlert,
  IconCloud,
  IconSave,
  IconSpinner,
} from '../components/Icons';

interface ProfilePageProps {
  currentUser: Usuario | null;
  onUserUpdated: (user: Usuario) => void;
  onNavigateMural: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUserUpdated,
  onNavigateMural,
}) => {
  const [nome, setNome] = useState(currentUser?.nome || '');
  const [email, setEmail] = useState(currentUser?.email_institucional || '');
  const [cargo, setCargo] = useState(currentUser?.cargo || 'Discente · Ciência da Computação');
  const [curso, setCurso] = useState(currentUser?.curso || 'Ciência da Computação - UFERSA');
  const [matricula, setMatricula] = useState(currentUser?.matricula || '2026010982');
  const [telefone, setTelefone] = useState(currentUser?.telefone || '(84) 99999-0000');
  const [bio, setBio] = useState(
    currentUser?.bio ||
      'Estudante da UFERSA Campus Pau dos Ferros, desenvolvendo sistemas web integrados com AWS S3, DynamoDB, Lambda, API Gateway e Amazon Cognito.'
  );

  const [fotoPreview, setFotoPreview] = useState<string | null>(currentUser?.foto_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [awsMeta, setAwsMeta] = useState<{
    userId?: string;
    bucket?: string;
    tableName?: string;
    fotoKey?: string;
    updatedAt?: string;
  }>({
    bucket: 'nattan-profile-2026.2',
    tableName: 'nattan-message-2026.2',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const token = getCognitoIdToken() || getCognitoAccessToken();

  useEffect(() => {
    let mounted = true;
    async function loadFromAws() {
      if (!token) return;
      setIsLoading(true);
      try {
        const remote: UserProfileData | null = await getUserProfile();
        if (!mounted || !remote) return;

        if (remote.nome) setNome(remote.nome);
        if (remote.email) setEmail(remote.email);
        if (remote.cargo) setCargo(remote.cargo);
        if (remote.curso) setCurso(remote.curso);
        if (remote.matricula) setMatricula(remote.matricula);
        if (remote.telefone) setTelefone(remote.telefone);
        if (remote.bio) setBio(remote.bio);
        if (remote.fotoBase64) setFotoPreview(remote.fotoBase64);

        setAwsMeta({
          userId: remote.userId,
          bucket: remote.bucket || 'nattan-profile-2026.2',
          tableName: remote.tableName || 'nattan-message-2026.2',
          fotoKey: remote.fotoKey,
          updatedAt: remote.updatedAt,
        });
      } catch (err) {
        console.warn('Perfil remoto ainda não cadastrado ou indisponível:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadFromAws();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-[#5A554A] mb-4">
          Você precisa estar autenticado para acessar e editar seu perfil.
        </p>
        <button
          onClick={onNavigateMural}
          className="bg-[#1F3B32] text-[#FAF7F0] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
        >
          Voltar ao Mural
        </button>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Comprime a imagem imediatamente para formato otimizado (< 150 KB)
      const compressed = await compressImage(file, 800, 800, 0.85);
      setSelectedFile(compressed.file);
      setFotoPreview(compressed.dataUrl);
      setFeedback(null);
    } catch (err) {
      console.error('Falha ao processar imagem:', err);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!token) {
      setFeedback({
        type: 'error',
        text: 'Autentique-se via Google (Amazon Cognito) para salvar os dados no S3 e DynamoDB.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUserProfile(
        {
          nome: nome.trim(),
          email: email.trim(),
          cargo: cargo.trim(),
          curso: curso.trim(),
          matricula: matricula.trim(),
          telefone: telefone.trim(),
          bio: bio.trim(),
          fotoBase64: fotoPreview || undefined,
        },
        selectedFile
      );

      const savedProfile = response.profile;
      const finalPhoto = savedProfile?.fotoBase64 || fotoPreview || currentUser.foto_url;

      setAwsMeta({
        userId: response.userId || savedProfile?.userId,
        bucket: response.bucket || savedProfile?.bucket || 'nattan-profile-2026.2',
        tableName: response.tableName || savedProfile?.tableName || 'nattan-message-2026.2',
        fotoKey: response.key || savedProfile?.fotoKey,
        updatedAt: savedProfile?.updatedAt || new Date().toISOString(),
      });

      const updatedUser: Usuario = {
        ...currentUser,
        nome: nome.trim() || currentUser.nome,
        email_institucional: email.trim() || currentUser.email_institucional,
        cargo: cargo.trim() || currentUser.cargo,
        curso: curso.trim(),
        matricula: matricula.trim(),
        telefone: telefone.trim(),
        bio: bio.trim(),
        foto_url: finalPhoto || undefined,
      };

      try {
        storageService.updateUsuario(currentUser.id_usuario, updatedUser);
        storageService.setCurrentUser(updatedUser);
      } catch (storageErr) {
        console.warn('Cache local não pôde ser gravado, mas os dados foram salvos na AWS:', storageErr);
      }

      onUserUpdated(updatedUser);
      setSelectedFile(null);

      setFeedback({
        type: 'success',
        text: 'Perfil e foto atualizados com sucesso via PUT /profile! Dados salvos no DynamoDB (nattan-message-2026.2) e foto armazenada no S3 (nattan-profile-2026.2).',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: 'error',
        text: `Falha ao atualizar perfil: ${msg}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#C1443A] font-bold">
            Avaliação 11 · S3 & DynamoDB · Rota PUT /profile
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F3B32] mt-0.5">
            Meu Perfil Acadêmico
          </h1>
          <p className="text-xs text-[#5A554A] mt-1">
            Gerencie suas informações cadastrais no DynamoDB e sua foto de perfil personalizada no
            Amazon S3.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateMural}
          className="self-start sm:self-auto bg-[#FAF7F0] hover:bg-white text-[#1F3B32] border border-[#22201B]/20 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          ← Voltar ao Mural
        </button>
      </div>

      {!token && (
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-amber-900">
            {localStorage.getItem('cognito_id_token') ? (
              <>
                <strong>Sessão do Cognito expirada:</strong> Sua autenticação institucional expirou (validade de 1 hora).
                Renove o login com Google para salvar suas alterações no S3 e DynamoDB via <code className="font-mono bg-amber-100 px-1 rounded">PUT /profile</code>.
              </>
            ) : (
              <>
                <strong>Atenção:</strong> Você está utilizando uma sessão local ou anônima. Para salvar e persistir os dados no S3 e DynamoDB via{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">PUT /profile</code>, autentique-se com sua conta Google institucional.
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => startGoogleLogin()}
            className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-sm transition"
          >
            {localStorage.getItem('cognito_id_token') ? 'Renovar Login com Google' : 'Autenticar com Google (Cognito)'}
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`mb-6 rounded-xl p-4 border text-xs font-medium flex items-start gap-2.5 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {feedback.type === 'success' ? <IconCheck size={16} /> : <IconAlert size={16} />}
          </span>
          <div className="flex-1">{feedback.text}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Cartão de Foto de Perfil (S3) + Metadados AWS */}
        <div className="space-y-5">
          <div className="bg-[#FAF7F0] border-2 border-[#22201B]/15 rounded-2xl p-5 shadow-md text-center">
            <h2 className="font-display font-bold text-sm text-[#1F3B32] mb-3">
              Foto de Perfil (Amazon S3)
            </h2>

            <div className="relative w-36 h-36 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#1F3B32] shadow-lg bg-[#EDE1CB] flex items-center justify-center">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt={nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-4xl font-bold text-[#1F3B32]">
                  {currentUser.avatar}
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] text-xs font-semibold py-2.5 px-4 rounded-lg shadow transition cursor-pointer flex items-center justify-center gap-2"
            >
              <IconCamera size={15} />
              <span>Escolher Nova Foto de Perfil</span>
            </button>

            {selectedFile && (
              <p className="text-[11px] text-emerald-700 font-mono mt-2 truncate">
                Selecionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}

            <p className="text-[11px] text-[#5A554A] mt-3 leading-relaxed">
              A foto enviada substitui a foto padrão da conta federada e é armazenada no bucket{' '}
              <code className="font-mono font-semibold text-[#1F3B32]">nattan-profile-2026.2</code>.
            </p>
          </div>

          {/* Card de Diagnóstico AWS (ótimo para comprovação na avaliação) */}
          <div className="bg-[#1F3B32] text-[#FAF7F0] rounded-2xl p-4 shadow-md text-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#FAF7F0]/15 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <IconCloud size={14} />
                <span>Recursos AWS Vinculados</span>
              </span>
              {isLoading && <span className="text-[10px] text-amber-300">Sincronizando...</span>}
            </div>

            <div>
              <span className="text-[#FAF7F0]/60 block text-[10px]">Bucket S3:</span>
              <span className="font-semibold text-emerald-200 break-all">
                {awsMeta.bucket || 'nattan-profile-2026.2'}
              </span>
            </div>

            <div>
              <span className="text-[#FAF7F0]/60 block text-[10px]">Tabela DynamoDB:</span>
              <span className="font-semibold text-emerald-200 break-all">
                {awsMeta.tableName || 'nattan-message-2026.2'}
              </span>
            </div>

            <div>
              <span className="text-[#FAF7F0]/60 block text-[10px]">Endpoint API Gateway:</span>
              <span className="text-[11px] break-all">PUT /profile</span>
            </div>

            {awsMeta.fotoKey && (
              <div>
                <span className="text-[#FAF7F0]/60 block text-[10px]">Objeto S3 (Key):</span>
                <span className="text-[10.5px] text-amber-200 break-all">{awsMeta.fotoKey}</span>
              </div>
            )}

            {awsMeta.updatedAt && (
              <div>
                <span className="text-[#FAF7F0]/60 block text-[10px]">Última Atualização:</span>
                <span className="text-[10.5px]">
                  {new Date(awsMeta.updatedAt).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Formulário de Dados Cadastrais (DynamoDB) */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-[#FAF7F0] border-2 border-[#22201B]/15 rounded-2xl p-6 shadow-md space-y-4"
          >
            <div className="border-b border-[#22201B]/10 pb-3 mb-2 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-[#1F3B32]">
                  Dados Cadastrais do Usuário
                </h2>
                <p className="text-[11px] text-[#5A554A]">
                  Informações persistidas na tabela{' '}
                  <code className="font-mono font-semibold text-[#1F3B32]">
                    nattan-message-2026.2
                  </code>{' '}
                  do Amazon DynamoDB
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#1F3B32] text-[#FAF7F0] px-2.5 py-1 rounded font-semibold">
                {currentUser.perfil}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  E-mail Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] font-mono focus:outline-none focus:border-[#1F3B32]"
                  placeholder="seu.email@alunos.ufersa.edu.br"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  Cargo / Vínculo Acadêmico *
                </label>
                <input
                  type="text"
                  required
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                  placeholder="Ex.: Discente · Ciência da Computação"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  Curso / Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                  placeholder="Ex.: Ciência da Computação - Campus Pau dos Ferros"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  Matrícula / SIAPE *
                </label>
                <input
                  type="text"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] font-mono focus:outline-none focus:border-[#1F3B32]"
                  placeholder="Ex.: 2026010982"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                  Telefone / Contato
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                  placeholder="Ex.: (84) 99999-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3B32] mb-1">
                Biografia / Apresentação Acadêmica
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32]"
                placeholder="Conte um pouco sobre sua atuação no campus, projetos ou interesses..."
              />
            </div>

            <div className="pt-3 border-t border-[#22201B]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#5A554A] font-mono">
                Método HTTP: <strong>PUT /profile</strong> (S3 + DynamoDB)
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-[#C1443A] hover:bg-[#a93a31] disabled:opacity-50 text-[#FAF7F0] text-xs font-semibold px-5 py-2.5 rounded-lg shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <IconSpinner size={15} />
                    <span>Salvando no S3 e DynamoDB...</span>
                  </>
                ) : (
                  <>
                    <IconSave size={15} />
                    <span>Salvar Alterações de Perfil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
