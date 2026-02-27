// src/controllers/auth.controller.js
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); // Herramienta para generar y validar códigos 2FA
const qrcode = require('qrcode');       // Transforma las URLs de Google Auth en imágenes QR

// ==========================================
// 1. LOGIN PRINCIPAL (Revisión de credenciales)
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // A) VALIDACIÓN DE RECAPTCHA (Google)
    // Verifica que la petición venga de un humano y no de un bot haciendo ataques de fuerza bruta.
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

    // B) BUSCAMOS AL USUARIO EN LA BASE DE DATOS
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // C) VERIFICAMOS LA CONTRASEÑA ENCRIPTADA
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // ==========================================
    // 🔥 MODO DESARROLLO (2FA APAGADO)
    // Generamos el token inmediatamente y dejamos pasar al usuario sin pedir código.
    // ==========================================
    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol, id_disciplina: usuario.id_disciplina },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: { id: usuario.id_usuario, nombre: usuario.nombre_completo, id_rol: usuario.id_rol }
    });

    // ==========================================
    // 🔒 MODO PRODUCCIÓN (2FA ENCENDIDO)
    // Cuando quieras volver a activar el 2FA, BORRA el bloque de "MODO DESARROLLO" 
    // de arriba y DESCOMENTA las siguientes líneas:
    // ==========================================
    /*
    const tiene2FA = usuario.secreto_2fa !== null && usuario.secreto_2fa !== '';
    return res.status(200).json({ 
      requires2fa: true, 
      userId: usuario.id_usuario,
      setupRequired: !tiene2FA // Le dice al Front si debe mostrar el QR o solo pedir el código
    });
    */

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// 2. GENERADOR DE CÓDIGO QR (Primera vez usando 2FA)
// ==========================================
const generarQR = async (req, res) => {
  try {
    const { userId } = req.body;
    const usuario = await prisma.usuarios.findUnique({ where: { id_usuario: parseInt(userId) } });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // A) GENERAMOS LA "LLAVE MAESTRA" DEL 2FA
    // Le ponemos el nombre de tu proyecto para que se vea profesional en la app de Google Authenticator.
    const secreto = speakeasy.generateSecret({ 
      name: `ZF Halo 2026 (${usuario.email})` 
    });

    // B) GUARDAMOS EL SECRETO EN LA BD
    // Es vital guardarlo para poder comparar los códigos que el usuario escriba en el futuro.
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: { secreto_2fa: secreto.base32 }
    });

    // C) CREAMOS LA IMAGEN DEL QR
    // Convertimos la URL especial de Speakeasy en una imagen Base64 para que React la pueda dibujar.
    const qrImage = await qrcode.toDataURL(secreto.otpauth_url);

    res.status(200).json({ 
      mensaje: "Escanea este código en tu app de Google Authenticator",
      qrImage: qrImage, 
      secretoManual: secreto.base32 // Para los usuarios que prefieren teclear el código en lugar de escanear
    });

  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).json({ error: "Error al generar configuración 2FA" });
  }
};

// ==========================================
// 3. VERIFICACIÓN DEL CÓDIGO DEL CELULAR (2FA)
// ==========================================
const verify2fa = async (req, res) => {
  try {
    const { userId, codigo2FA } = req.body;

    // A) BUSCAMOS EL SECRETO DEL USUARIO
    const usuario = await prisma.usuarios.findUnique({ where: { id_usuario: parseInt(userId) } });
    if (!usuario || !usuario.secreto_2fa) {
      return res.status(400).json({ error: "2FA no está configurado para este usuario" });
    }

    // B) VALIDAMOS EL CÓDIGO
    // Speakeasy toma el secreto guardado y el código temporal y verifica si coinciden.
    const esValido = speakeasy.totp.verify({
      secret: usuario.secreto_2fa,
      encoding: 'base32',
      token: codigo2FA,
      window: 1 // Truco de vida: Da 30 segundos de "gracia" por si el usuario es lento al teclear.
    });

    if (!esValido) {
      return res.status(401).json({ error: "Código 2FA incorrecto o expirado" });
    }

    // C) CÓDIGO CORRECTO: GENERAMOS EL "GAFETE" (JWT)
    // El usuario ya demostró quién es, le damos su pase de acceso al sistema.
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

// ==========================================
// 4. OBTENER MI PERFIL (Utilidad)
// ==========================================
// Se alimenta del Middleware. Lee quién soy a partir del Token JWT.
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