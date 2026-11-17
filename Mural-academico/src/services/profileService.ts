import { getCognitoIdToken, getCognitoAccessToken } from './ssoAuth';
import { compressImage } from '../utils/imageCompressor';

export const PROFILE_API_URL =
  (import.meta.env.VITE_PROFILE_API_URL as string) ||
  'https://up7r1blab3.execute-api.us-east-1.amazonaws.com/prod/profile';

export interface UserProfileData {
  userId?: string;
  nome: string;
  email: string;
  cargo: string;
  curso: string;
  matricula: string;
  telefone: string;
  bio: string;
  bucket?: string;
  tableName?: string;
  fotoKey?: string;
  fotoBase64?: string;
  updatedAt?: string;
}

export interface UploadProfileResponse {
  message: string;
  key: string;
  userId: string;
  bucket?: string;
  tableName?: string;
  profile?: UserProfileData;
}

/**
 * Converte um File em string Data URL (base64) comprimida de tamanho otimizado (< 150 KB).
 */
export async function fileToDataUrl(file: File): Promise<string> {
  try {
    const result = await compressImage(file, 800, 800, 0.85);
    return result.dataUrl;
  } catch (err) {
    console.warn('Compressão falhou, caindo de volta para leitura pura:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Operação PUT na rota /profile do API Gateway:
 * Altera as informações cadastrais do usuário na tabela DynamoDB (nattan-message-2026.2)
 * e armazena a foto de perfil no Bucket S3 (nattan-profile-2026.2).
 */
export async function updateUserProfile(
  profile: Omit<UserProfileData, 'userId' | 'bucket' | 'tableName' | 'fotoKey' | 'updatedAt'>,
  photoFile?: File | null
): Promise<UploadProfileResponse> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    throw new Error('Sua sessão de autenticação no Cognito não foi encontrada ou expirou. Clique em "Entrar com Google" para renovar.');
  }

  let fotoBase64 = profile.fotoBase64;
  let contentType = 'image/jpeg';

  if (photoFile) {
    try {
      const compressed = await compressImage(photoFile, 800, 800, 0.85);
      fotoBase64 = compressed.dataUrl;
      contentType = compressed.file.type || 'image/jpeg';
    } catch {
      fotoBase64 = await fileToDataUrl(photoFile);
      contentType = photoFile.type || 'image/jpeg';
    }
  }

  let response: Response;
  try {
    response = await fetch(PROFILE_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profile,
        fotoBase64,
        contentType,
      }),
    });
  } catch (netErr: unknown) {
    const errorMsg = netErr instanceof Error ? netErr.message : String(netErr);
    throw new Error(
      `Falha de conexão com a API (${errorMsg}). Verifique sua internet, adblockers no navegador ou se a sessão do Cognito expirou.`
    );
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text();
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Sessão do Cognito expirada ou não autorizada (${response.status}). Faça login com Google novamente.`
      );
    }

    throw new Error(`Erro ao atualizar perfil (${response.status}): ${errorDetail}`);
  }

  return response.json();
}

/**
 * Busca os dados cadastrais do usuário no DynamoDB (nattan-message-2026.2)
 * e a foto de perfil armazenada no S3 (nattan-profile-2026.2) via GET /profile?format=json.
 */
export async function getUserProfile(): Promise<UserProfileData | null> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${PROFILE_API_URL}?format=json`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.warn('Erro de rede ao carregar perfil:', err);
    return null;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Erro ao carregar perfil (${response.status})`);
  }

  const data = await response.json();
  return data.profile || data;
}

/**
 * Envia uma imagem via PUT /profile usando fetch.
 */
export async function uploadProfileImage(file: File): Promise<UploadProfileResponse> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para enviar a imagem.');
  }

  let fileToSend = file;
  try {
    const compressed = await compressImage(file, 800, 800, 0.85);
    fileToSend = compressed.file;
  } catch {
    // Mantém original se compressão falhar
  }

  const response = await fetch(PROFILE_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': fileToSend.type || 'image/jpeg',
    },
    body: fileToSend,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar imagem (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Lê a imagem enviada através do método GET na rota /profile.
 */
export async function fetchProfileImage(): Promise<string | null> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch(PROFILE_API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Erro ao buscar imagem (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    return data?.profile?.fotoBase64 || data?.fotoBase64 || null;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
