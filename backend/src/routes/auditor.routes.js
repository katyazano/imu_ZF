const { Router } = require('express');
const { 
    getDashboardKPIs, 
    getVencidos, 
    getAlertas, 
    exportarReportes 
} = require('../controllers/auditor.controller');

const router = Router();

// Endpoint para las gráficas matemáticas 
router.get('/dashboard/kpis', getDashboardKPIs);

// Endpoint para escanear retrasos 
router.get('/dashboard/vencidos', getVencidos);

// Endpoint para el historial de correos de infracción
router.get('/alertas', getAlertas);

// Endpoint para generar el Excel (Se usa POST para enviar JSON seguro) 
router.post('/reportes/exportar', exportarReportes);

module.exports = router;