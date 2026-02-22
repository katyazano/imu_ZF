const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', usuariosController.getUsuarios);
router.get('/:id', usuariosController.getUsuarioDetalle);
router.post('/', usuariosController.crearUsuario);
router.patch('/:id', usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;