const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Users = require('../Models/userModel');

class AuthService {
  async solicitarRecuperacion(email) {
    const user = await Users.findOne({ where: { email } });
    if (!user) return null; // No revelar si el usuario existe o no

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 3600000); // 1 hora de validez

    // Guardar token en la base de datos
    await user.update({ resetToken: token, resetTokenExpira: tokenExpira });

    // Configurar y enviar correo con el enlace de recuperación
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.email, pass: process.env.email_password }
    });

    const mailOptions = {
      from: process.env.email,
      to: user.email,
      subject: 'Recuperación de contraseña',
      text: `Usa el siguiente enlace para restablecer tu contraseña: 
      http://tudominio.com/reset-password?token=${token}`
    };

    await transporter.sendMail(mailOptions);
    return { message: 'Correo enviado' };
  }
}
