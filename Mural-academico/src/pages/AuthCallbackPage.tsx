import { useEffect, useRef, useState } from 'react';
import { finishLogin, decodeJwt } from '../services/ssoAuth';
import { storageService } from '../services/storageService';
import { isAllowedDomain } from '../services/authService';

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
      if (!isAllowedDomain(email)) throw new Error('Use sua conta institucional.');

      // E-mails em VITE_ADMIN_EMAILS entram como ADMINISTRADOR; os demais viram LEITOR.
      const user = storageService.upsertGoogleUser(
        String(claims.name ?? email.split('@')[0]),
        email
      );
      if (user.bloqueado) throw new Error('Esta conta foi bloqueada pelo administrador.');

      storageService.setGuest(false);
      storageService.setCurrentUser(user);
      window.location.replace(user.perfil === 'ADMINISTRADOR' ? '/#/admin/gestao' : '/#/mural');
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