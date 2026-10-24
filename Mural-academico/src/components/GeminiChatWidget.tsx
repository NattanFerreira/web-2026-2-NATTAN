import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Usuario } from '../types';
import { getCognitoAccessToken, startGoogleLogin } from '../services/ssoAuth';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system';
  text: string;
  timestamp: string;
}

interface GeminiChatWidgetProps {
  currentUser: Usuario | null;
}

const DEFAULT_WS_URL = 'wss://api.nattan.mestre.web.ufersa.dev.br';
const WS_BASE_URL = ((import.meta.env.VITE_WS_URL as string) || DEFAULT_WS_URL).trim();

export const GeminiChatWidget: React.FC<GeminiChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>(
    'disconnected'
  );
  const [input, setInput] = useState('');
  const [isWaitingReply, setIsWaitingReply] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'system',
      text: 'Olá! Sou o assistente acadêmico integrado ao Google Gemini via AWS WebSocket. Faça uma pergunta sobre o campus ou estudos!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const token = getCognitoAccessToken();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingReply, isOpen]);

  const connectWebSocket = useCallback(() => {
    if (!currentUser) return;

    // Fecha conexão anterior se existir
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignora erro ao fechar socket antigo
      }
      wsRef.current = null;
    }

    const cognitoToken = getCognitoAccessToken();
    const wsUrl = cognitoToken
      ? `${WS_BASE_URL}?token=${encodeURIComponent(cognitoToken)}`
      : WS_BASE_URL;

    setStatus('connecting');
    console.info('[WebSocket] Conectando a:', WS_BASE_URL);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.info('[WebSocket] Conexão estabelecida com sucesso em:', WS_BASE_URL);
        setStatus('connected');
      };

      ws.onmessage = (event) => {
        console.info('[WebSocket] Mensagem recebida da Lambda:', event.data);
        setIsWaitingReply(false);

        let replyText = String(event.data ?? '');
        try {
          const parsed = JSON.parse(replyText);
          replyText =
            parsed.answer ||
            parsed.reply ||
            parsed.message ||
            parsed.response ||
            parsed.text ||
            replyText;
        } catch {
          // Resposta já veio em texto puro
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `gemini-${Date.now()}`,
            sender: 'gemini',
            text: replyText,
            timestamp: new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Erro na conexão:', err);
        setStatus('error');
        setIsWaitingReply(false);
      };

      ws.onclose = (event) => {
        console.info('[WebSocket] Conexão encerrada:', event.code, event.reason);
        setStatus((prev) => (prev === 'error' ? 'error' : 'disconnected'));
        setIsWaitingReply(false);
      };
    } catch (err) {
      console.error('[WebSocket] Falha ao iniciar WebSocket:', err);
      setStatus('error');
    }
  }, [currentUser]);

  // Conecta automaticamente assim que o usuário estiver autenticado
  useEffect(() => {
    if (currentUser) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [currentUser, connectWebSocket]);

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const payload = JSON.stringify({
      action: '$default',
      message: trimmed,
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.info('[WebSocket] Enviando pergunta para rota $default:', payload);
      setIsWaitingReply(true);
      wsRef.current.send(payload);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          text: 'WebSocket não está conectado. Clique em "Reconectar" no topo do chat e tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }
  };

  const statusBadge = {
    connected: { label: 'Conectado (WS)', dot: 'bg-emerald-400', text: 'text-emerald-200' },
    connecting: { label: 'Conectando...', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-200' },
    disconnected: { label: 'Desconectado', dot: 'bg-gray-400', text: 'text-gray-300' },
    error: { label: 'Erro de conexão', dot: 'bg-[#C1443A]', text: 'text-red-200' },
  }[status];

  const wsHostname = WS_BASE_URL.replace(/^wss?:\/\//, '');

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {isOpen ? (
        <div className="w-[350px] sm:w-[390px] bg-[#FAF7F0] border-2 border-[#1F3B32] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-3">
          {/* Cabeçalho do Chat */}
          <div className="bg-[#1F3B32] text-[#FAF7F0] px-4 py-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h3 className="font-display font-bold text-sm tracking-tight truncate">
                  Assistente Gemini · UFERSA
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                <span className={`text-[10px] font-mono ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
                <span className="text-[10px] text-[#FAF7F0]/50 font-mono truncate">
                  · {wsHostname}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={connectWebSocket}
                title="Reconectar ao WebSocket (útil após abrir a aba Network/WS do DevTools)"
                className="text-[10.5px] font-mono bg-[#274A3F] hover:bg-[#325d4f] text-[#FAF7F0] px-2 py-1 rounded border border-[#FAF7F0]/20 cursor-pointer transition"
              >
                ↻ Reconectar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimizar chat"
                className="text-[#FAF7F0]/75 hover:text-[#FAF7F0] px-1.5 py-0.5 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Aviso caso o usuário tenha logado localmente sem token do Cognito */}
          {!token && (
            <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 flex items-center justify-between gap-2 text-[11px] text-amber-900">
              <span>Para autenticar com token JWT do Cognito, entre com Google.</span>
              <button
                type="button"
                onClick={() => startGoogleLogin()}
                className="shrink-0 bg-[#1F3B32] text-[#FAF7F0] px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
              >
                Login Cognito
              </button>
            </div>
          )}

          {/* Lista de Mensagens */}
          <div className="h-72 overflow-y-auto p-3.5 space-y-3 bg-[#EDE1CB]/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user'
                    ? 'items-end'
                    : msg.sender === 'gemini'
                    ? 'items-start'
                    : 'items-center'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1F3B32] text-[#FAF7F0] rounded-br-xs'
                      : msg.sender === 'gemini'
                      ? 'bg-white text-[#22201B] border border-[#22201B]/15 rounded-bl-xs'
                      : 'bg-[#EDE1CB] text-[#5A554A] text-[11px] border border-[#22201B]/10 text-center max-w-[95%]'
                  }`}
                >
                  {msg.sender === 'gemini' && (
                    <div className="text-[10px] font-bold font-mono text-[#1F3B32] mb-0.5">
                      🤖 Google Gemini (via AWS Lambda)
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="text-[9.5px] text-[#5A554A] mt-0.5 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isWaitingReply && (
              <div className="flex items-start">
                <div className="bg-white text-[#5A554A] border border-[#22201B]/15 rounded-xl rounded-bl-xs px-3 py-2 text-xs font-mono flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#1F3B32] animate-ping" />
                  <span>Lambda consultando Google Gemini...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Campo de envio de pergunta */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-[#FAF7F0] border-t border-[#22201B]/15 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Envie uma pergunta para o Gemini..."
              className="flex-1 bg-white border border-[#22201B]/20 rounded-lg px-3 py-2 text-xs text-[#22201B] focus:outline-none focus:border-[#1F3B32] focus:ring-2 focus:ring-[#1F3B32]/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || status !== 'connected'}
              className="bg-[#C1443A] hover:bg-[#a93a31] disabled:opacity-50 disabled:cursor-not-allowed text-[#FAF7F0] text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer shrink-0"
            >
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-[#1F3B32] hover:bg-[#274A3F] text-[#FAF7F0] border-2 border-[#FAF7F0]/20 px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition"
        >
          <span>✨</span>
          <span>Chat IA (Gemini)</span>
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
        </button>
      )}
    </div>
  );
};
