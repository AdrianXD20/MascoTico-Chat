import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import axiosInstance from "../utils/AxiosInstance";

/**
 * Componente de grabación de voz.
 * Grava audio del micrófono, lo manda a /chat/transcribir,
 * y entrega el texto transcrito mediante onTranscription.
 */
export default function VoiceRecorder({ onTranscription, disabled }) {
  const [isRecording,    setIsRecording]    = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Liberar el micrófono
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await enviarAudio(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (err) {
      console.error("Error accediendo al micrófono:", err);
      alert("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const enviarAudio = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "grabacion.webm");

      const { data } = await axiosInstance.post("/chat/transcribir", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      console.log(`[Whisper] Transcrito en ${data.tiempo_transcripcion_ms}ms:`, data.texto);

      if (data.texto?.trim()) {
        onTranscription(data.texto.trim());
      }

    } catch (err) {
      console.error("Error transcribiendo audio:", err);
      alert("No se pudo transcribir el audio. Intenta de nuevo.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (isTranscribing) {
    return (
      <button
        disabled
        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0"
        title="Transcribiendo..."
      >
        <Loader2 size={14} className="text-gray-500 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {isRecording
        ? <Square size={12} className="text-white" fill="white" />
        : <Mic size={14} className="text-gray-600" />
      }
    </button>
  );
}