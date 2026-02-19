const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/setup-2fa', authController.generarQR); // <-- NUEVA RUTA
router.post('/verify-2fa', authController.verify2fa);
router.get('/me', verificarToken, authController.getMe);

module.exports = router;