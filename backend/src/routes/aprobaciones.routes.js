const express = require('express');
const router = express.Router();
const aprobacionesController = require('../controllers/aprobaciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

// Bandeja de entrada para firmantes
router.get('/pendientes', aprobacionesController.getFirmasPendientes);

router.patch('/dictaminar/:id_firma', aprobacionesController.dictaminarFirma);

// Endpoint para obtener el panel de logística
router.get('/logistica/historial', aprobacionesController.getPanelLogistica);

module.exports = router;