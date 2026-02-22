const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacora.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', bitacoraController.getBitacora);
router.post('/checkout', bitacoraController.registrarCheckout);
router.post('/checkin', bitacoraController.registrarCheckin);

module.exports = router;