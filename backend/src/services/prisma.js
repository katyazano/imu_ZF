const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

/**
 * Configuración centralizada de la base de datos.
 * Implementa el Driver Adapter de Prisma para optimizar conexiones
 * en entornos Serverless/Cloud (Supabase).
 */

const connectionString = process.env.DATABASE_URL;

// Configuración del Pool de conexiones de PostgreSQL
// SSL requerido para conexiones seguras a Supabase
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

// Inicialización del adaptador y cliente de Prisma
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;