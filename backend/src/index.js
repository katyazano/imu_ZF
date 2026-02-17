const express = require('express');
const cors = require('cors'); 
// Importamos las rutas
const activosRoutes = require('./routes/activos.routes');
const authRoutes = require('./routes/auth.routes'); // <--- IMPORTANTE

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ZONA DE RUTAS ---
app.use('/api/activos', activosRoutes);
app.use('/api/auth', authRoutes); // <--- ESTO ES LO QUE TE FALTA O NO SE GUARDÓ

// Ruta de prueba (opcional, para ver si el server vive)
app.get('/', (req, res) => {
  res.send('API ZF Halo funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});