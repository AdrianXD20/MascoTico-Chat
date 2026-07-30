
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Magic bytes por tipo de imagen
const MAGIC_BYTES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  jpg:  [0xFF, 0xD8, 0xFF],
  png:  [0x89, 0x50, 0x4E, 0x47],
  gif:  [0x47, 0x49, 0x46, 0x38],
};

function validarMagicBytes(buffer) {
  for (const [_, bytes] of Object.entries(MAGIC_BYTES)) {
    if (buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)) {
      return true;
    }
  }
  return false;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/i;
  const mimetype = allowedTypes.test(file.mimetype);

  if (!mimetype) {
    return cb(new Error('El archivo debe ser una imagen (jpeg, jpg, png, gif).'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Middleware para verificar magic bytes después de multer
function verificarMagicBytes(req, res, next) {
  if (!req.file) return next();
  try {
    if (!validarMagicBytes(req.file.buffer || require('fs').readFileSync(req.file.path))) {
      require('fs').unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'El archivo no es una imagen válida' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Error al validar el archivo' });
  }
  next();
}

module.exports = upload;
module.exports.verificarMagicBytes = verificarMagicBytes;
