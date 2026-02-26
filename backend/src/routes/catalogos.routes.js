// src/routes/catalogos.routes.js
const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogos.controller');

// Módulo 2: Catálogos genéricos y Destinos Externos
router.post('/destinos_externos', catalogosController.crearDestinoExterno);
router.put('/destinos_externos/:id', catalogosController.actualizarDestinoExterno);
// La ruta dinámica /:tipo debe ir al final para que no choque con las anteriores
router.get('/:tipo', catalogosController.getCatalogoPorTipo);

module.exports = router;