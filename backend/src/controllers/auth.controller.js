// src/controllers/auth.controller.js

const login = async (req, res) => {
  // Aquí React enviará: { email, password, captchaToken }
  console.log("Datos recibidos:", req.body);
  
  // TODO: Validar en BD con Prisma
  res.status(200).json({ requires2fa: true, userId: 1 });
};

const verify2fa = async (req, res) => {
  // Aquí React enviará: { userId, codigo2FA }
  res.status(200).json({ 
    token: "jwt_falso_temporal", 
    user: { id: 1, nombre: "Admin Temporal", id_rol: 1 } 
  });
};

const getMe = async (req, res) => {
  // TODO: Leer ID desde el JWT
  res.status(200).json({ 
    id: 1, 
    nombre_completo: "Admin Temporal", 
    id_rol: 1, 
    id_disciplina: 2 
  });
};

module.exports = { login, verify2fa, getMe };