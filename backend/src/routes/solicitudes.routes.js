// src/routes/solicitudes.routes.js
const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todo el módulo de solicitudes está protegido
router.use(verificarToken); 

// === RUTAS GET ===
router.get('/master', solicitudesController.getSolicitudesMaster);

// === RUTAS POST ===
router.post('/', solicitudesController.crearSolicitud);

module.exports = router;