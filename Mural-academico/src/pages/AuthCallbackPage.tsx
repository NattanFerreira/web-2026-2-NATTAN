import { useEffect, useRef, useState } from 'react';
import { finishLogin, decodeJwt } from '../services/ssoAuth';
import { storageService } from '../services/storageService';

const ALLOWED = ((import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS as string) ?? '')
  .split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false); // StrictMode roda o effect 2x e o code só vale uma vez

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const claims = decodeJwt(await finishLogin());
      const email = String(claims.email ?? '').toLowerCase().trim();

      if (!email || String(claims.email_verified) !== 'true')
        throw new Error('E-mail não verificado pelo Google.');
      if (ALLOWED.length && !ALLOWED.includes(email.split('@')[1]))
        throw new Error('Use sua conta institucional.');

      // Admins pré-cadastrados em initialData.ts mantêm o perfil; novos viram LEITOR
      const user =
        storageService.getUsuarioByEmail(email) ??
        storageService.addUsuario({
          nome: String(claims.name ?? email.split('@')[0]),
          email_institucional: email,
          cargo: '',
        });

      storageService.setCurrentUser(user);
      window.location.replace(user.perfil === 'ADMINISTRADOR' ? '/#/admin' : '/#/mural');
    })().catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-[#C1443A] font-semibold mb-4">{error}</p>
        <a href="/#/login" className="underline text-[#1F3B32]">Voltar ao login</a>
      </div>
    );
  }
  return <p className="text-center py-16">Finalizando login…</p>;
}