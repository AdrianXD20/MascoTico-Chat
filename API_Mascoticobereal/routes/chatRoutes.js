const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../Controllers/chatController');
const { chatMensaje } = require('../middleware/validators');

// Configuración de Multer para manejar el audio en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      const err = new Error('Solo archivos de audio son permitidos');
      err.status = 400;
      return cb(err, false);
    }
    cb(null, true);
  }
});

// Convierte errores de multer/fileFilter en respuestas 4xx limpias (no 500)
function manejarErrorMulter(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado grande (máximo 10MB)' : 'Error al subir el archivo' });
  }
  if (err) {
    return res.status(err.status || 400).json({ error: err.message || 'Archivo inválido' });
  }
  next();
}

// Middleware para validar magic bytes de audio
function verificarMagicBytesAudio(req, res, next) {
  if (!req.file) return next();
  const buffer = req.file.buffer;
  if (!buffer || buffer.length < 4) {
    return res.status(400).json({ error: 'Archivo de audio inválido' });
  }
  const header = buffer.slice(0, 4).toString('hex');
  const formatosAudio = ['52494646', 'fff', '4f676753', '664c6143']; // WAVE/RIFF, MP3, OGG, FLAC
  const esValido = formatosAudio.some(f => header.startsWith(f));
  if (!esValido) {
    return res.status(400).json({ error: 'El archivo no es un formato de audio válido' });
  }
  next();
}

/**
 * @swagger
 * /chat:
 * post:
 * summary: Envía un mensaje al agente de IA de MascoTico
 * description: Endpoint principal del chat con memoria persistente. Si no se provee conversation_id, se crea una nueva sesión. Si se provee, se continúa la conversación existente.
 * tags:
 * - Chat IA
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - mensaje
 * properties:
 * mensaje:
 * type: string
 * description: Mensaje del usuario al agente
 * conversation_id:
 * type: string
 * description: UUID de la conversación existente (opcional)
 * responses:
 * 200:
 * description: Respuesta del agente
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * conversation_id:
 * type: string
 * respuesta:
 * type: string
 * es_nueva_sesion:
 * type: boolean
 * 401:
 * description: Token no proporcionado o inválido
 * 500:
 * description: Error del agente de IA
 */
router.post('/chat', verifyToken, chatMensaje, chatController.enviarMensaje);

/**
 * @swagger
 * /chat/conversaciones/{user_id}:
 * get:
 * summary: Lista las conversaciones del usuario autenticado
 * tags:
 * - Chat IA
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: user_id
 * required: true
 * schema:
 * type: string
 * description: ID del usuario
 * responses:
 * 200:
 * description: Lista de conversaciones
 * 401:
 * description: Token no proporcionado o inválido
 */
router.get('/chat/conversaciones/:user_id', verifyToken, chatController.listarConversaciones);

/**
 * @swagger
 * /chat/conversaciones/{conversation_id}:
 * delete:
 * summary: Elimina una conversación del usuario
 * tags:
 * - Chat IA
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversation_id
 * required: true
 * schema:
 * type: string
 * description: UUID de la conversación a eliminar
 * responses:
 * 200:
 * description: Conversación eliminada correctamente
 * 404:
 * description: Conversación no encontrada
 * 401:
 * description: Token no proporcionado o inválido
 */
router.delete('/chat/conversaciones/:conversation_id', verifyToken, chatController.eliminarConversacion);

/**
 * @swagger
 * /chat/transcribir:
 * post:
 * summary: Transcribe un audio grabado a texto usando Whisper local
 * tags:
 * - Chat IA
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * audio:
 * type: string
 * format: binary
 * responses:
 * 200:
 * description: Texto transcrito
 * 401:
 * description: Token no proporcionado o inválido
 * 500:
 * description: Error al transcribir
 */
router.post('/chat/transcribir', verifyToken, upload.single('audio'), verificarMagicBytesAudio, chatController.transcribirAudio, manejarErrorMulter);

module.exports = router;