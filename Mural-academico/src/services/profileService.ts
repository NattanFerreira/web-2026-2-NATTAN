import { getCognitoIdToken, getCognitoAccessToken } from './ssoAuth';

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

/** Converte um File em string Data URL (base64). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
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
    throw new Error('Usuário não autenticado no Cognito. Faça login com Google para salvar no S3 e DynamoDB.');
  }

  let fotoBase64 = profile.fotoBase64;
  let contentType = 'image/jpeg';

  if (photoFile) {
    fotoBase64 = await fileToDataUrl(photoFile);
    contentType = photoFile.type || 'image/jpeg';
  }

  const response = await fetch(PROFILE_API_URL, {
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao atualizar perfil (${response.status}): ${errorText}`);
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

  const response = await fetch(`${PROFILE_API_URL}?format=json`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
 * Envia uma imagem via PUT /profile (ou POST /profile) usando fetch.
 */
export async function uploadProfileImage(file: File): Promise<UploadProfileResponse> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para enviar a imagem.');
  }

  const response = await fetch(PROFILE_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type || 'image/jpeg',
    },
    body: file,
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
