const express = require('express');
const router = express.Router();
const mantenimientosController = require('../controllers/mantenimientos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', mantenimientosController.getMantenimientos);
router.post('/', mantenimientosController.crearMantenimiento);
router.patch('/:id', mantenimientosController.cerrarMantenimiento);

module.exports = router;