const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Vital para leer los { body } que mande React

// ==========================================
// IMPORTACIÓN DE RUTAS (Tus 7 Módulos)
// ==========================================
const authRoutes = require('./routes/auth.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const activosRoutes = require('./routes/activos.routes');
// const solicitudesRoutes = require('./routes/solicitudes.routes');
const bitacoraRoutes = require('./routes/bitacora.routes');
const mantenimientosRoutes = require('./routes/mantenimientos.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const aprobacionesRoutes = require('./routes/aprobaciones.routes'); // Agregada

// const mantenimientosRoutes = require('./routes/mantenimientos.routes');
// const usuariosRoutes = require('./routes/usuarios.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');

// ==========================================
// MONTAJE DE ENDPOINTS
// ==========================================
app.use('/api/auth', authRoutes);                   // Módulo 1
app.use('/api/catalogos', catalogosRoutes);         // Módulo 2 (Catálogos)
app.use('/api/activos', activosRoutes);             // Módulo 2 (Inventario)
// app.use('/api/solicitudes', solicitudesRoutes);     // Módulo 3
app.use('/api/bitacora', bitacoraRoutes);              // Módulo 4
app.use('/api/mantenimientos', mantenimientosRoutes);  // Módulo 4
app.use('/api/solicitudes', solicitudesRoutes);     // Módulo 3
app.use('/api/aprobaciones', aprobacionesRoutes);   // Módulo 3 (Firmas y aprobaciones)

// app.use('/api/mantenimientos', mantenimientosRoutes); // Módulo 4
// app.use('/api/usuarios', usuariosRoutes);           // Módulo 5
// app.use('/api/dashboard', dashboardRoutes);         // Módulo 7

// Endpoint de prueba rápida
app.get('/', (req, res) => {
  res.send('🚀 API ZF Halo funcionando correctamente');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});