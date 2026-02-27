const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/notificaciones
 * @desc    Obtener notificaciones dinámicas según el rol (Alertas, Firmas o Solicitudes)
 * @access  Privado (Requiere Token)
 */
router.get('/', verificarToken, notificacionesController.getNotificacionesMaestras);

module.exports = router;