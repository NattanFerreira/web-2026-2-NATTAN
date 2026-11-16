import { getCognitoIdToken, getCognitoAccessToken } from './ssoAuth';

const PROFILE_API_URL =
  (import.meta.env.VITE_PROFILE_API_URL as string) ||
  'https://up7r1blab3.execute-api.us-east-1.amazonaws.com/prod/profile';

export interface UploadProfileResponse {
  message: string;
  key: string;
  userId: string;
}

/**
 * Envia uma imagem de perfil para a rota /profile da API Gateway via POST e fetch.
 * O arquivo é enviado diretamente no corpo da requisição e protegido pelo token JWT do Cognito.
 */
export async function uploadProfileImage(file: File): Promise<UploadProfileResponse> {
  const token = getCognitoIdToken() || getCognitoAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado. Faça login para enviar a imagem de perfil.');
  }

  const response = await fetch(PROFILE_API_URL, {
    method: 'POST',
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
 * Lê a imagem de perfil enviada através do método GET na rota /profile.
 * Retorna uma URL de objeto (blob URL) pronta para ser atribuída ao src de uma tag <img>,
 * ou null se o usuário ainda não tiver imagem salva.
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

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
