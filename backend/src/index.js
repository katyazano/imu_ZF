const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DEL ADAPTADOR (CRÍTICO PARA PRISMA 7) ---
const connectionString = process.env.DATABASE_URL;

// 1. Crear un Pool de conexión con PostgreSQL
const pool = new Pool({ connectionString });

// 2. Crear el adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializar Prisma usando el adaptador
const prisma = new PrismaClient({ adapter });

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
    const activos = await prisma.activo.findMany({ take: 50 });
    res.json(activos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo activos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});