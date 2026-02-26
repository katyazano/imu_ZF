// src/routes/reglas.routes.js
const express = require('express');
const router = express.Router();
const reglasController = require('../controllers/reglas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', reglasController.getReglas);
router.get('/:id_categoria', reglasController.getReglaPorCategoria);
router.patch('/:id_categoria', reglasController.configurarRegla);

module.exports = router;