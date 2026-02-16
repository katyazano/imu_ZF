// backend/src/index.js
const express = require('express');
const cors = require('cors');
// OJO: Ya no importamos Prisma ni Pool aquí para no duplicar lógica.

const app = express();
const port = process.env.PORT || 3000;

// Importar rutas
const activosRoutes = require('./routes/activos.routes');

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/activos', activosRoutes);

// Health Check Simple
app.get('/api/health', (req, res) => {
  res.json({ status: 'API ZF-Halo Online 🚀' });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});