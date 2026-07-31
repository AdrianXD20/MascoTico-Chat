const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const RefreshToken = require('../Models/RefreshToken');
require('dotenv').config();

const secretKey = process.env.secretKey;

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts) {
    if (data.lockUntil && data.lockUntil <= now) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 1000);

class UserService {
  constructor() {}

  async buscarPorEmail(email) {
    return User.findOne({ where: { email } });
  }

  async crearUsuario(nuevoUsuario) {
    try {
      const campos = ['nombre', 'email', 'contraseña', 'rol', 'direccion', 'telefono', 'imagen_perfil'];
      const seguro = {};
      for (const key of Object.keys(nuevoUsuario || {})) {
        if (campos.includes(key)) seguro[key] = nuevoUsuario[key];
      }
      seguro.contraseña = await bcrypt.hash(seguro.contraseña, 10);

      const usuarioCreado = await User.create(seguro);

      // 👇 Objeto limpio, SIN el hash de la contraseña
      const usuarioSeguro = {
        id: usuarioCreado.id,
        nombre: usuarioCreado.nombre,
        email: usuarioCreado.email,
        rol: usuarioCreado.rol,
        imagen_perfil: usuarioCreado.imagen_perfil,
      };

      return usuarioSeguro;
    } catch (error) {
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  }

  async login(email, contraseña) {
    try {
      const key = `login:${email}`;
      const now = Date.now();
      const record = loginAttempts.get(key);

      if (record && record.lockUntil && record.lockUntil > now) {
        throw new Error('Demasiados intentos. Intenta de nuevo en 15 minutos.');
      }

      const user = await User.findOne({ where: { email } });
      const dummyHash = '$2a$10$' + 'x'.repeat(53);
      const isPasswordValid = await bcrypt.compare(contraseña, user ? user.contraseña : dummyHash);

      if (!user || !isPasswordValid) {
        const attempts = (record?.count || 0) + 1;
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          loginAttempts.set(key, { count: attempts, lockUntil: now + LOCKOUT_MINUTES * 60 * 1000 });
        } else {
          loginAttempts.set(key, { count: attempts });
        }
        throw new Error('Credenciales inválidas');
      }

      loginAttempts.delete(key);

      const jti = crypto.randomUUID();
      const JWT = jwt.sign(
        { id: user.id, rol: user.rol, tipo: 'usuario', jti },
        secretKey,
        { expiresIn: '15m' }
      );

      const refreshToken = crypto.randomBytes(32).toString('hex');
      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        tipo: 'usuario',
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // 👇 Objeto limpio, SIN la contraseña ni campos sensibles
      const usuarioSeguro = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        direccion: user.direccion,
        telefono: user.telefono,
        imagen_perfil: user.imagen_perfil,
      };

      return { JWT, refreshToken, user: usuarioSeguro };
    } catch (error) {
      throw new Error('Error en el proceso de login: ' + error.message);
    }
  }

  async refreshJWT(refreshToken) {
    const stored = await RefreshToken.findByPk(refreshToken);
    if (!stored || stored.expiry < new Date()) {
      if (stored) await stored.destroy();
      throw new Error('Refresh token inválido o expirado');
    }

    const user = await User.findByPk(stored.userId);
    if (!user) throw new Error('Usuario no encontrado');

    const jti = crypto.randomUUID();
    const newJWT = jwt.sign(
      { id: user.id, rol: user.rol, jti },
      secretKey,
      { expiresIn: '15m' }
    );

    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    await stored.destroy();
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user.id,
      tipo: 'usuario',
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { JWT: newJWT, refreshToken: newRefreshToken };
  }

  async resetearPassword(token, nuevaContraseña) {
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpira < new Date()) return null; // Token inválido o expirado

    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
    await user.update({ contraseña: hashedPassword, resetToken: null, resetTokenExpira: null });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async solicitarRecuperacion(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) return { message: 'Si el email existe, se enviará un correo' }; // No revelar si el usuario existe o no
  
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 3600000);
  
    await user.update({ resetToken: token, resetTokenExpira: tokenExpira });
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.email, 
        pass: process.env.email_password 
      }
    });
  
    const mailOptions = {
      from: process.env.email,
      to: user.email,
      subject: 'Recuperación de contraseña',
      text: `Usa el siguiente enlace para restablecer tu contraseña: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`
    };
  
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado: ', info.response);
      return { message: 'Correo enviado correctamente' };
    } catch (error) {
      console.error('Error al enviar correo: ', error);
      return { error: 'No se pudo enviar el correo' };
    }
  }

  async obtenerUsuarios(page, limit){
    const offset = (page - 1) * limit;
    const users = await User.findAll({limit, offset});
    return users.map(u => this._sanitizeUser(u, true));
  }

  async obtenerUsuarioId(Id, ofuscar = true){
    const user = await User.findByPk(Id);
    return user ? this._sanitizeUser(user, ofuscar) : null;
  }

  _ofuscarEmail(email) {
    if (!email) return null;
    const [local, dominio] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${dominio}`;
    return `${local[0]}${local[1]}***@${dominio}`;
  }

  _sanitizeUser(user, ofuscar = false) {
    return {
      id: user.id,
      nombre: user.nombre,
      email: ofuscar ? this._ofuscarEmail(user.email) : user.email,
      rol: user.rol,
      direccion: user.direccion,
      telefono: user.telefono,
      imagen_perfil: user.imagen_perfil,
    };
  }

  _allowedFields() {
    return ['nombre', 'direccion', 'telefono', 'imagen_perfil'];
  }

  async actualizarUsuario(Id, datosActualizados, imagen = null){
    const users = await User.findByPk(Id);
    if(!users) return null;

    const camposPermitidos = {};
    for (const campo of this._allowedFields()) {
      if (datosActualizados[campo] !== undefined) {
        camposPermitidos[campo] = datosActualizados[campo];
      }
    }
    if (imagen) {
      camposPermitidos.imagen_perfil = imagen;
    }

    const update = await User.update(camposPermitidos, { where: { id: Id } });
    if (update > 0) {
      const updated = await User.findByPk(Id);
      return updated ? this._sanitizeUser(updated) : null;
    }
    return null;
  }

  async revocarRefreshTokens(userId) {
    await RefreshToken.destroy({ where: { userId, tipo: 'usuario' } });
  }

  async eliminarUsuarios(Id){
    const users = await User.findByPk(Id)
    if(users){
      return User.destroy({
        where:{id:Id}
      })
    }
    return null
  }
  

}

module.exports = UserService;

