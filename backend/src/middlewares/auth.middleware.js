// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Leemos el token que viene en los headers (Bearer Token)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "No se proporcionó un token de acceso" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Intentamos descifrar el token usando nuestra firma secreta (.env)
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Pegamos la info del usuario en la petición (req)
    req.usuario_token = decodificado; 
    
    next(); // Dale pase libre al controlador
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = { verificarToken };