const { body, param, validationResult } = require('express-validator');

function validar(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() });
  }
  next();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HORA_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIPOS_MASCOTA = ['Perro', 'Gato', 'Roedores', 'Reptiles'];

const usuarioRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().matches(EMAIL_REGEX).withMessage('Email inválido'),
  body('contraseña').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('telefono').optional().trim().isMobilePhone('any').withMessage('Teléfono inválido'),
  validar,
];

const usuarioLogin = [
  body('email').trim().notEmpty().withMessage('Email obligatorio'),
  body('contraseña').trim().notEmpty().withMessage('Contraseña obligatoria'),
  validar,
];

const mascotaCrear = [
  body('nombre').trim().isIn(TIPOS_MASCOTA).withMessage('La especie debe ser Perro, Gato, Roedores o Reptiles'),
  validar,
];

const mascotaActualizar = [
  param('id').isInt({ min: 1 }).withMessage('ID de mascota inválido'),
  body('nombre').trim().isIn(TIPOS_MASCOTA).withMessage('La especie debe ser Perro, Gato, Roedores o Reptiles'),
  validar,
];

const citaCrear = [
  body('id_veterinario').isInt({ min: 1 }).withMessage('ID de veterinario inválido'),
  body('fecha_cita').matches(FECHA_REGEX).withMessage('Fecha inválida (YYYY-MM-DD)'),
  body('hora').matches(HORA_REGEX).withMessage('Hora inválida (HH:MM)'),
  body('razon').trim().notEmpty().withMessage('El motivo es obligatorio'),
  body('mascota').isInt({ min: 1 }).withMessage('ID de especie de mascota inválido'),
  body('tipo_mascota').optional().isIn(TIPOS_MASCOTA).withMessage('Tipo de mascota inválido'),
  validar,
];

const citaEstado = [
  param('id').isInt({ min: 1 }).withMessage('ID de cita inválido'),
  body('estado').isIn(['pendiente', 'confirmada', 'rechazada']).withMessage('Estado inválido (pendiente, confirmada, rechazada)'),
  validar,
];

const ventaCrear = [
  body('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('items.*.cantidad').isInt({ min: 1, max: 100 }).withMessage('Cantidad inválida (1-100)'),
  validar,
];

const veterinarioRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('email').trim().matches(EMAIL_REGEX).withMessage('Email inválido'),
  body('contraseña').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('especialidad').optional().trim(),
  body('dni').optional().trim(),
  validar,
];

const veterinarioLogin = [
  body('email').trim().notEmpty().withMessage('Email obligatorio'),
  body('contraseña').trim().notEmpty().withMessage('Contraseña obligatoria'),
  validar,
];

const productoCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre del producto es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero >= 0'),
  validar,
];

const blogCrear = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
  body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio'),
  body('categoria').optional().trim(),
  validar,
];

const disponibilidadCrear = [
  body('id_veterinario').isInt({ min: 1 }).withMessage('ID de veterinario inválido'),
  body('fecha').matches(FECHA_REGEX).withMessage('Fecha inválida (YYYY-MM-DD)'),
  body('hora_inicio').matches(HORA_REGEX).withMessage('Hora inicio inválida'),
  body('hora_fin').matches(HORA_REGEX).withMessage('Hora fin inválida'),
  validar,
];

const chatMensaje = [
  body('mensaje').trim().isLength({ min: 1, max: 1000 }).withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('conversation_id').optional().isString().withMessage('ID de conversación inválido'),
  validar,
];

module.exports = {
  usuarioRegistro, usuarioLogin,
  mascotaCrear, mascotaActualizar,
  citaCrear, citaEstado,
  ventaCrear,
  veterinarioRegistro, veterinarioLogin,
  productoCrear,
  blogCrear,
  disponibilidadCrear,
  chatMensaje,
};
