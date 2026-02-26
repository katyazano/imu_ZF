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
// Endpoint para las gráficas matemáticas 
router.get('/dashboard/kpis', verificarToken, getDashboardKPIs);

// Endpoint para escanear retrasos 
router.get('/dashboard/vencidos', verificarToken, getVencidos);

// Endpoint para el historial de correos de infracción
router.get('/alertas', verificarToken, getAlertas);

// Endpoint para generar el Excel (Se usa GET para descargar archivos) 
router.get('/reportes/exportar', verificarToken, exportarReportes);

// Endpoint para historial web
router.get('/reportes/historial', verificarToken, getHistorialWeb);

// Endpoint para trazabilidad de un activo específico
router.get('/trazabilidad/:id', verificarToken, getTrazabilidadActivo);

module.exports = router;