const { Router } = require('express');
const { 
    getDashboardKPIs, 
    getVencidos, 
    getAlertas, 
    exportarReportes,
    getHistorialWeb,
    getTrazabilidadActivo
} = require('../controllers/auditor.controller');

// 1. Importamos tu guardia de seguridad (Middleware)
// Asegúrate de que la ruta '../middlewares/auth.middleware' sea la correcta en tu estructura de carpetas
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

// 2. Colocamos 'verificarToken' justo en medio de la URL y la función
router.get('/dashboard/kpis', verificarToken, getDashboardKPIs);
router.get('/dashboard/vencidos', verificarToken, getVencidos);
router.get('/alertas', verificarToken, getAlertas);
router.get('/reportes/exportar', verificarToken, exportarReportes);
router.get('/reportes/historial', verificarToken, getHistorialWeb);
router.get('/trazabilidad/:id', verificarToken, getTrazabilidadActivo);

module.exports = router;