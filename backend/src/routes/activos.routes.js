// src/routes/activos.routes.js
const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');

// GET /api/activos
router.get('/', activosController.getActivos);

// GET /api/activos/:id
router.get('/:id', activosController.getActivoById);

// POST /api/activos
router.post('/', activosController.createActivo);

module.exports = router;