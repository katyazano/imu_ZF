const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que mandaron datos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // 2. Buscar al usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email },
      include: { roles: true } // Traemos el rol para saber quién es
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Verificar contraseña (comparar lo que escribió con el Hash de la BD)
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4. Crear el Token (Usando tu secreto del .env)
    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.roles.nombre },
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // 5. Responder
    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      usuario: {
        nombre: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.roles.nombre
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { login };