// src/routes/solicitudes.routes.js
const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todo el módulo está protegido
router.use(verificarToken); 

// === RUTAS GET (Fijas primero) ===
router.get('/master', solicitudesController.getSolicitudesMaster);
router.get('/mis', solicitudesController.getMisSolicitudes);

// === RUTAS GET (Dinámicas después) ===
router.get('/:id', solicitudesController.getSolicitudPorId);

// === RUTAS POST ===
router.post('/', solicitudesController.crearSolicitud);

module.exports = router;