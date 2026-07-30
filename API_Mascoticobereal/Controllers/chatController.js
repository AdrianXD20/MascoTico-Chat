const axios = require('axios');
const FormData = require('form-data');

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000';
const RAG_API_KEY = process.env.RAG_API_KEY || '';

// ── Control de concurrencia: máximo 2 requests simultáneas a Python ──
let activeRequests = 0;
const MAX_CONCURRENT = 2;

function _apiHeaders() {
  return RAG_API_KEY ? { 'X-API-Key': RAG_API_KEY } : {};
}

class ChatController {

    /**
     * Envía un mensaje al agente de IA y retorna la respuesta.
     * Usa el user.id del JWT para identificar al usuario.
     * Si no hay conversation_id, Python crea una nueva sesión.
     */
    async enviarMensaje(req, res) {
        if (activeRequests >= MAX_CONCURRENT) {
            console.warn(`[ChatController] Saturado (${activeRequests}/${MAX_CONCURRENT}) — rechazando request`);
            return res.status(503).json({
                error: 'El servicio de IA está saturado en este momento. Intenta de nuevo en unos segundos.'
            });
        }

        try {
            const user_id = req.user.id;
            const { mensaje, conversation_id } = req.body;

            if (!mensaje || mensaje.trim() === '') {
                return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
            }

            if (mensaje.length > 1000) {
                return res.status(400).json({ error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' });
            }

            const payload = {
                user_id,
                mensaje: mensaje.trim(),
                conversation_id: conversation_id || null
            };

            activeRequests++;
            console.log(`[ChatController] Requests activos: ${activeRequests}/${MAX_CONCURRENT}`);

            const response = await axios.post(`${PYTHON_API}/chat`, payload, {
                headers: { 'Content-Type': 'application/json', ..._apiHeaders() },
                timeout: 30000
            });

            return res.status(200).json(response.data);

        } catch (error) {
            console.error('[ChatController] Error:', error.message);

            if (error.code === 'ECONNABORTED') {
                return res.status(504).json({
                    error: 'El servicio de IA tardó demasiado en responder. Intenta con un mensaje más corto.'
                });
            }

            if (error.response) {
                return res.status(error.response.status).json({
                    error: error.response.data?.detail || 'Error del agente de IA'
                });
            }

            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    error: 'El servicio de IA no está disponible en este momento'
                });
            }

            return res.status(500).json({ error: 'Error interno del servidor' });
        } finally {
            activeRequests = Math.max(0, activeRequests - 1);
        }
    }

    /**
     * Lista todas las conversaciones del usuario autenticado.
     */
    async listarConversaciones(req, res) {
        try {
            // Desactivar caching (Se mantiene del 1ro)
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');

            const user_id = req.params.user_id;
            const token_user_id = req.user.id;

            // Validar que el usuario no acceda al historial de otros usuarios (Se mantiene del 1ro)
            if (String(user_id) !== String(token_user_id)) {
                return res.status(403).json({
                    error: 'No tienes permiso para acceder al historial de este usuario'
                });
            }

            const response = await axios.get(`${PYTHON_API}/conversaciones/${user_id}`, {
                headers: _apiHeaders(),
                timeout: 10000
            });

            return res.status(200).json(response.data);

        } catch (error) {
            console.error('[ChatController] Error listando conversaciones:', error.message);

            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    error: 'El servicio de IA no está disponible'
                });
            }

            return res.status(500).json({ error: 'Error al obtener conversaciones' });
        }
    }

    /**
     * Elimina una conversación del usuario autenticado.
     */
    async eliminarConversacion(req, res) {
        try {
            const user_id = req.user.id;
            const { conversation_id } = req.params;

            const response = await axios.delete(
                `${PYTHON_API}/conversaciones/${conversation_id}`,
                {
                    headers: _apiHeaders(),
                    params: { user_id },
                    timeout: 10000
                }
            );

            return res.status(200).json(response.data);

        } catch (error) {
            console.error('[ChatController] Error eliminando conversación:', error.message);

            if (error.response?.status === 404) {
                return res.status(404).json({
                    error: 'Conversación no encontrada o no pertenece a este usuario'
                });
            }

            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    error: 'El servicio de IA no está disponible'
                });
            }

            return res.status(500).json({ error: 'Error al eliminar conversación' });
        }
    }

    /**
     * Recibe el audio grabado desde React, lo reenvía a Python/Whisper
     * para transcribirlo y retorna el texto resultante.
     * <-- Agregado por completo del segundo código
     */
    async transcribirAudio(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se recibió ningún archivo de audio' });
            }

            const formData = new FormData();
            formData.append('audio', req.file.buffer, {
                filename: req.file.originalname || 'audio.webm',
                contentType: req.file.mimetype
            });

            const response = await axios.post(`${PYTHON_API}/transcribir`, formData, {
                headers: { ...formData.getHeaders(), ..._apiHeaders() },
                timeout: 60000
            });

            return res.status(200).json(response.data);

        } catch (error) {
            console.error('[ChatController] Error transcribiendo:', error.message);

            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    error: 'El servicio de transcripción no está disponible'
                });
            }

            return res.status(500).json({ error: 'Error al transcribir el audio' });
        }
    }
}

module.exports = new ChatController();