// src/controllers/auth.controller.js
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); // ¡Nuestra nueva herramienta a prueba de fallos!
const qrcode = require('qrcode');

const login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    if (captchaToken) {
      const captchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        { method: 'POST' }
      );
      const captchaData = await captchaResponse.json();
      
      if (!captchaData.success) {
        return res.status(401).json({ error: "Fallo la validación del Captcha. ¿Eres un robot?" });
      }
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const tiene2FA = usuario.secreto_2fa !== null && usuario.secreto_2fa !== '';

    res.status(200).json({ 
      requires2fa: true, 
      userId: usuario.id_usuario,
      setupRequired: !tiene2FA 
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const generarQR = async (req, res) => {
  try {
    const { userId } = req.body;
    const usuario = await prisma.usuarios.findUnique({ where: { id_usuario: parseInt(userId) } });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // 1. Speakeasy genera un objeto con todo lo que necesitamos
    const secreto = speakeasy.generateSecret({ 
      name: `ZF Halo 2026 (${usuario.email})` 
    });

    // 2. Guardamos la versión 'base32' del secreto en la base de datos
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: { secreto_2fa: secreto.base32 }
    });

    // 3. Convertimos la URL lista de Speakeasy a un código QR
    const qrImage = await qrcode.toDataURL(secreto.otpauth_url);

    res.status(200).json({ 
      mensaje: "Escanea este código en tu app de Google Authenticator",
      qrImage: qrImage, 
      secretoManual: secreto.base32 // ¡Este es el que teclearás en tu celular!
    });

  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).json({ error: "Error al generar configuración 2FA" });
  }
};

const verify2fa = async (req, res) => {
  try {
    const { userId, codigo2FA } = req.body;

    const usuario = await prisma.usuarios.findUnique({ where: { id_usuario: parseInt(userId) } });
    if (!usuario || !usuario.secreto_2fa) {
      return res.status(400).json({ error: "2FA no está configurado para este usuario" });
    }

    // MAGIA: Speakeasy verifica si el código coincide
    const esValido = speakeasy.totp.verify({
      secret: usuario.secreto_2fa,
      encoding: 'base32',
      token: codigo2FA,
      window: 1 // Truco de vida: Da un margen de 30 segundos extra por si el usuario es lento al escribir
    });

    if (!esValido) {
      return res.status(401).json({ error: "Código 2FA incorrecto o expirado" });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol, id_disciplina: usuario.id_disciplina },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token,
      user: { id: usuario.id_usuario, nombre: usuario.nombre_completo, id_rol: usuario.id_rol }
    });

  } catch (error) {
    console.error('Error en 2FA:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.usuario_token.id; 
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
      select: { id_usuario: true, nombre_completo: true, id_rol: true, id_disciplina: true }
    });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

module.exports = { login, generarQR, verify2fa, getMe };