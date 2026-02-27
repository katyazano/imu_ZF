const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');

// Módulo 2: Inventario de Activos
router.get('/', activosController.getActivos);
router.post('/', activosController.crearActivo);

// Trazabilidad (Historial de movimientos)
router.get('/:id/trazabilidad', activosController.getTrazabilidadActivo);

// ✅ CORRECCIÓN: Aquí estaba el error. Cambiamos "Por" a "By"
router.get('/:id', activosController.getActivoById);

router.put('/:id', activosController.actualizarActivo);
router.delete('/:id', activosController.darDeBajaActivo);

module.exports = router;