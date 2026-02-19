const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Prisma Client estándar (Prisma 5)
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- Health Checks ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'API ZF-Halo Online', version: '1.0.0' });
});

app.get('/api/db-check', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'Conexión Exitosa con PostgreSQL', db: 'zf_patrimonial' });
  } catch (error) {
    console.error('Error DB:', error);
    res.status(500).json({ error: 'Error de conexión', details: error.message });
  }
});

// Endpoint de Activos (Ejemplo)
app.get('/api/activos', async (req, res) => {
  try {
    const activos = await prisma.activos.findMany({ take: 50 });
    res.json(activos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo activos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});