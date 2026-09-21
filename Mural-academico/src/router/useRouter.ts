import { useState, useEffect, useCallback } from 'react';
import type { TabNavegacao } from '../types';

export interface RouteInfo {
  tab: TabNavegacao;
  params: Record<string, string>;
}

function parseHash(hash: string): RouteInfo {
  const clean = hash.replace(/^#\/?/, '').trim();
  const [path, queryString] = clean.split('?');
  const segments = path ? path.split('/') : [];

  const queryParams: Record<string, string> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });
  }

  if (segments.length === 0 || segments[0] === '' || segments[0] === 'mural') {
    return { tab: 'mural', params: queryParams };
  }

  if (segments[0] === 'aviso' && segments[1]) {
    return { tab: 'detalhe-aviso', params: { ...queryParams, id: segments[1] } };
  }

  if (segments[0] === 'login') {
    return { tab: 'login', params: queryParams };
  }

  if (segments[0] === 'cadastro') {
    return { tab: 'cadastro', params: queryParams };
  }

  if (segments[0] === 'minhas-ocorrencias') {
    return { tab: 'minhas-ocorrencias', params: queryParams };
  }

  if (segments[0] === 'admin') {
    if (segments[1] === 'avisos' && segments[2] === 'novo') {
      return { tab: 'admin-novo-aviso', params: queryParams };
    }
    return { tab: 'admin-ocorrencias', params: queryParams };
  }

  if (segments[0] === 'admin-ocorrencias') {
    return { tab: 'admin-ocorrencias', params: queryParams };
  }

  if (segments[0] === 'admin-novo-aviso') {
    return { tab: 'admin-novo-aviso', params: queryParams };
  }

  if (segments[0] === 'ocorrencias' && segments[1] === 'nova') {
    return { tab: 'nova-ocorrencia', params: queryParams };
  }

  if (segments[0] === 'nova-ocorrencia') {
    return { tab: 'nova-ocorrencia', params: queryParams };
  }

  if (segments[0] === 'sobre') {
    return { tab: 'sobre', params: queryParams };
  }

  // Padrão fallback
  return { tab: 'mural', params: queryParams };
}

function buildHash(tab: TabNavegacao, params?: Record<string, string>): string {
  let base: string;
  switch (tab) {
    case 'mural':
      base = '#/mural';
      break;
    case 'detalhe-aviso':
      base = `#/aviso/${params?.id || ''}`;
      break;
    case 'login':
      base = '#/login';
      break;
    case 'cadastro':
      base = '#/cadastro';
      break;
    case 'minhas-ocorrencias':
      base = '#/minhas-ocorrencias';
      break;
    case 'admin-ocorrencias':
      base = '#/admin';
      break;
    case 'admin-novo-aviso':
      base = '#/admin/avisos/novo';
      break;
    case 'nova-ocorrencia':
      base = '#/ocorrencias/nova';
      break;
    case 'sobre':
      base = '#/sobre';
      break;
    default:
      base = '#/mural';
  }

  // Se houver parâmetros extras (ex: local predefinido)
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k !== 'id' && v) search.set(k, v);
    });
    const qs = search.toString();
    if (qs) {
      base += `?${qs}`;
    }
  }

  return base;
}

export function useRouter() {
  const [route, setRoute] = useState<RouteInfo>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((tab: TabNavegacao, params?: Record<string, string>) => {
    const newHash = buildHash(tab, params);
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      setRoute(parseHash(newHash));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    currentTab: route.tab,
    params: route.params,
    navigate,
  };
}
