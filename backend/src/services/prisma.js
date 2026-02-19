/* 
Recuerda que este archivo existe para centralizar la conexión a tu base de datos con Prisma. 
Si quieres cambiar algo en la configuración de Prisma, este es el lugar. 
Luego, en tus controladores, solo importas esta instancia y listo, sin preocuparte por detalles técnicos.
Es parte del patron de diseño "Singleton" para la conexión a la base de datos.
*/

// src/services/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;