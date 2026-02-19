// src/routes/activos.routes.js
const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');

// Módulo 2: Inventario de Activos
router.get('/', activosController.getActivos);
router.post('/', activosController.crearActivo);
router.get('/:id', activosController.getActivoPorId);
router.put('/:id', activosController.actualizarActivo);
router.delete('/:id', activosController.darDeBajaActivo);

module.exports = router;