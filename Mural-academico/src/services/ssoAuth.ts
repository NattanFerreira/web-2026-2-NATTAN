const domain = import.meta.env.VITE_COGNITO_DOMAIN as string;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string;
const redirectUri = `${window.location.origin}/auth/callback`;

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const randomString = () =>
  b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);

/** Redireciona para o Google (via Cognito) usando PKCE. */
export async function startGoogleLogin(): Promise<void> {
  const verifier = randomString();
  const state = randomString();
  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('pkce_state', state);

  const challenge = b64url(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  );

  const url = new URL(`${domain}/oauth2/authorize`);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    identity_provider: 'Google',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  }).toString();
  window.location.assign(url.toString());
}

/** Roda em /auth/callback: troca o code pelos tokens e devolve o id_token. */
export async function finishLogin(): Promise<string> {
  const p = new URLSearchParams(window.location.search);
  if (p.get('error')) throw new Error(p.get('error_description') || 'Login cancelado.');
  if (p.get('state') !== sessionStorage.getItem('pkce_state')) throw new Error('State inválido.');

  const res = await fetch(`${domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: p.get('code') ?? '',
      redirect_uri: redirectUri,
      code_verifier: sessionStorage.getItem('pkce_verifier') ?? '',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Falha ao obter token.');

  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('pkce_state');

  // Guarda os JWT da sessão para inspeção no DevTools e autenticação no WebSocket.
  sessionStorage.setItem('id_token', data.id_token as string);
  sessionStorage.setItem('access_token', data.access_token as string);
  localStorage.setItem('cognito_id_token', data.id_token as string);
  localStorage.setItem('cognito_access_token', data.access_token as string);
  return data.id_token as string;
}

/** Retorna o token JWT do Cognito (access_token ou id_token) da sessão atual. */
export function getCognitoAccessToken(): string | null {
  return (
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('id_token') ||
    localStorage.getItem('cognito_access_token') ||
    localStorage.getItem('cognito_id_token')
  );
}

/** Lê os claims do id_token. Não valida a assinatura: o token veio direto
 *  do endpoint do Cognito, por HTTPS, na troca do code com PKCE. */
export function decodeJwt(token: string): Record<string, unknown> {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Encerra também a sessão no Cognito. */
export function cognitoLogout(): void {
  sessionStorage.removeItem('id_token');
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('cognito_id_token');
  localStorage.removeItem('cognito_access_token');
  const url = new URL(`${domain}/logout`);
  url.search = new URLSearchParams({
    client_id: clientId,
    logout_uri: `${window.location.origin}/`,
  }).toString();
  window.location.assign(url.toString());
}