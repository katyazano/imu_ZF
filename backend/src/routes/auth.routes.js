// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Módulo 1: Autenticación y Seguridad corporativa
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2fa);
router.get('/me', authController.getMe);

module.exports = router;