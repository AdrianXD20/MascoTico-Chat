import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Plus, Trash2, ChevronLeft } from "lucide-react";
import axiosInstance from "../utils/AxiosInstance";
import VoiceRecorder from "./VoiceRecorder";
import { VeterinarioCard } from "./VeterinarioCard";
import { TarjetaCita } from "./TarjetaCita";
import { TarjetaProducto } from "./TarjetaProducto";

// ─── Parser de las etiquetas especiales que manda el agente ────────────────
// El backend (system prompt en api.py) puede devolver texto + estas etiquetas:
//   <render_productos nombre="..." marca="..." precio="..." stock="...">
//   <render_cita mascota="..." fecha="..." razon="..." veterinario="...">
//   <navegar destino="blogs|tienda|perfil|inicio" />
// chat.jsx antes ignoraba todo esto y solo mostraba texto plano.

const DESTINOS = {
  blogs: "/blogs",
  tienda: "/shop",
  perfil: "/perfil",
  inicio: "/",
  citas: "/perfil",
  productos: "/shop"
};

const parseAtributos = (tagString) => {
  const attrs = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = attrRegex.exec(tagString)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
};

const parseRespuesta = (raw) => {
  let texto = raw;
  const productos = [];
  const veterinarios = [];
  const compras = [];
  let cita = null;
  let destino = null;

  // render_productos (puede haber varios)
  texto = texto.replace(/<render_productos\s+([^>]*?)\/?>/g, (_, attrsStr) => {
    productos.push(parseAtributos(attrsStr));
    return "";
  });

  // render_cita (uno solo esperado)
  texto = texto.replace(/<render_cita\s+([^>]*?)\/?>/g, (_, attrsStr) => {
    cita = parseAtributos(attrsStr);
    return "";
  });

  // render_veterinario (puede haber varios)
  texto = texto.replace(/<render_veterinario\s+([^>]*?)\/?>/g, (_, attrsStr) => {
    veterinarios.push(parseAtributos(attrsStr));
    return "";
  });

  // render_compra (puede haber varios)
  texto = texto.replace(/<render_compra\s+([^>]*?)\/?>/g, (_, attrsStr) => {
    compras.push(parseAtributos(attrsStr));
    return "";
  });

  // navegar
  texto = texto.replace(/<navegar\s+destino="([^"]*)"\s*\/?>/g, (_, dest) => {
    destino = dest;
    return "";
  });

  return { texto: texto.trim(), productos, cita, veterinarios, compras, destino };
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStoredConversationId = () => localStorage.getItem("chat_conversation_id");
const saveConversationId      = (id) => localStorage.setItem("chat_conversation_id", id);
const clearConversationId     = () => localStorage.removeItem("chat_conversation_id");

// ─── CompraCard (tarjeta de compra) ────────────────────────────────────────

const CompraCard = ({ data }) => {
  if (!data) return null;
  const { producto = 'Producto', cantidad = '1', total = '?', fecha = '' } = data;
  return (
    <div className="border rounded-xl p-3 shadow-sm bg-white hover:shadow-md transition-shadow mt-1">
      <p className="text-sm font-semibold text-gray-800">{producto}</p>
      <p className="text-xs text-gray-500">Cantidad: {cantidad} · Total: ${total}</p>
      {fecha && <p className="text-xs text-gray-400 mt-0.5">{fecha}</p>}
    </div>
  );
};

// ─── Burbuja de mensaje ──────────────────────────────────────────────────────

const MessageBubble = ({ role, content, productos, cita, veterinarios, compras }) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`} >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <span className="text-white text-xs font-bold">🐾</span>
        </div>
      )}
      <div className="max-w-[85%] flex flex-col">
        {content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              isUser
                ? "bg-primary text-white rounded-br-sm self-end"
                : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
            }`}
          >
            {content}
          </div>
        )}
        {!isUser && productos?.length > 0 && <TarjetaProducto data={productos} />}
        {!isUser && cita && <TarjetaCita data={cita} />}
        {!isUser && veterinarios?.length > 0 && (
          <div className="mt-2 space-y-2">
            {veterinarios.map((v, idx) => (
              <VeterinarioCard key={idx} data={v} />
            ))}
          </div>
        )}
        {!isUser && compras?.length > 0 && (
          <div className="mt-2 space-y-2">
            {compras.map((c, idx) => (
              <CompraCard key={idx} data={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Indicador de escritura ──────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex justify-start mb-3">
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
      <span className="text-white text-xs">🐾</span>
    </div>
    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
      <div className="flex space-x-1 items-center h-4">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate();
  const [isOpen,          setIsOpen]          = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [isLoading,       setIsLoading]       = useState(false);
  const [conversationId,  setConversationId]  = useState(getStoredConversationId);
  const [showHistory,     setShowHistory]     = useState(false);
  const [historial,       setHistorial]       = useState([]);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Foco en el input al abrir
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Mensaje de bienvenida si no hay historial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "¡Hola! 🐾 Soy el asistente de MascoTico. Puedo ayudarte con información sobre veterinarios, productos, citas y más. ¿En qué te ayudo?"
      }]);
    }
  }, [isOpen]);

  // ── Enviar mensaje ─────────────────────────────────────────────────────────

const sendMessage = async (textoOverride) => {
    const texto = (textoOverride ?? input).trim();
    if (!texto || isLoading) return;

    const userMsg = { role: "user", content: texto };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        mensaje: texto,
        // Tu backend obtiene el ID del JWT, así que no necesitas enviarlo aquí
        ...(conversationId && { conversation_id: conversationId })
      };

      const { data } = await axiosInstance.post("/chat", payload);
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // 1. Depuración: Mira qué está devolviendo exactamente tu backend
      console.log("Respuesta del backend:", data);

      // 2. Aseguramos que data.respuesta exista
      const respuestaIA = data.respuesta || "";
      
      const { texto: textoProcesado, productos, cita, veterinarios, compras, destino } = parseRespuesta(respuestaIA);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: textoProcesado,
        productos: productos || [], // Garantizamos un array aunque venga vacío
        cita: cita || null,
        veterinarios: veterinarios || [],
        compras: compras || []
      }]);

      if (destino && DESTINOS[destino]) {
        navigate(DESTINOS[destino]);
      }

    } catch (err) {
      console.error("Error en chat:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Lo siento, tuve un problema al procesar tu mensaje. Intenta de nuevo."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  // Envío automático desde voz — mismo flujo que sendMessage
  const enviarTextoDirecto = (texto) => sendMessage(texto);

  // ── Nueva conversación ─────────────────────────────────────────────────────

  const nuevaConversacion = () => {
    clearConversationId();
    setConversationId(null);
    setMessages([{
      role: "assistant",
      content: "¡Nueva conversación iniciada! 🐾 ¿En qué te puedo ayudar?"
    }]);
  };

  // ── Cargar historial ───────────────────────────────────────────────────────

  const cargarHistorial = async () => {
  try {
    // 1. Recuperamos el usuario logueado para extraer su ID
    const usuarioGuardado = localStorage.getItem("user"); 
    const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const userId = user?.id; // Tu token decía "id: 103", así que buscamos user.id

    if (!userId) {
      console.error("No se encontró el ID del usuario logueado");
      return;
    }

    // 2. Concatenamos el userId a la ruta para evitar el 404
    const { data } = await axiosInstance.get(`/chat/conversaciones/${userId}`);
    setHistorial(data.conversaciones || []);
    setShowHistory(true);
  } catch (err) {
    console.error("Error al cargar historial:", err);
    setHistorial([]);
    setShowHistory(true);
  }
};

  // ── Eliminar conversación del historial ────────────────────────────────────

  const eliminarConversacion = async (convId) => {
    try {
      await axiosInstance.delete(`/chat/conversaciones/${convId}`);
      setHistorial(prev => prev.filter(c => c.conversation_id !== convId));
      if (convId === conversationId) {
        nuevaConversacion();
      }
    } catch {
      // silencioso
    }
  };

  // ── Seleccionar conversación del historial ─────────────────────────────────

  const seleccionarConversacion = (convId) => {
    setConversationId(convId);
    saveConversationId(convId);
    setShowHistory(false);
    setMessages([{
      role: "assistant",
      content: "Conversación retomada. ¿En qué te ayudo?"
    }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Panel del chat ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ height: "520px" }}
      >
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {showHistory && (
              <button
                onClick={() => setShowHistory(false)}
                className="text-white/80 hover:text-white mr-1"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">🐾</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {showHistory ? "Conversaciones" : "Asistente MascoTico"}
              </p>
              {!showHistory && (
                <p className="text-white/70 text-xs">Siempre disponible</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showHistory && (
              <>
                <button
                  onClick={cargarHistorial}
                  title="Ver historial"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                  </svg>
                </button>
                <button
                  onClick={nuevaConversacion}
                  title="Nueva conversación"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Vista historial */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {historial.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <MessageCircle size={32} className="mb-2 opacity-40" />
                <p>No hay conversaciones guardadas</p>
              </div>
            ) : (
              historial.map((conv) => (
                <div
                  key={conv.conversation_id}
                  className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 group"
                >
                  <button
                    onClick={() => seleccionarConversacion(conv.conversation_id)}
                    className="flex-1 text-left"
                  >
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {conv.conversation_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString("es-MX", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </button>
                  <button
                    onClick={() => eliminarConversacion(conv.conversation_id)}
                    className="ml-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} productos={msg.productos} cita={msg.cita} veterinarios={msg.veterinarios} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-primary transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none outline-none leading-5 max-h-24"
                  style={{ minHeight: "20px" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                  }}
                />
                <VoiceRecorder
                  onTranscription={(texto) => {
                    if (!texto.trim()) return;
                    // Envío automático: usamos el texto transcrito directamente
                    // sin pasar por el estado `input` para evitar carreras de render
                    enviarTextoDirecto(texto.trim());
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
              <p className="text-center text-gray-300 text-[10px] mt-1.5">
                Enter para enviar · Shift+Enter para nueva línea
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Botón flotante ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-300 ${
          isOpen ? "rotate-0 scale-90" : "scale-100"
        }`}
        aria-label="Abrir asistente"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
      </button>
    </>
  );
}