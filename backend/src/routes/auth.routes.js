const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Fíjate que aquí solo dice '/login' (NO '/api/auth/login')
// Porque el prefijo '/api/auth' ya lo pusimos en el index.js
router.post('/login', authController.login);

module.exports = router;