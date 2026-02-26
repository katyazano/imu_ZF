// src/scripts/create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Generando contraseña encriptada...');
  
  // La contraseña que usarás en Postman
  const passwordPlana = 'ZFAdmin2026!'; 
  
  // Encriptamos la contraseña (el 10 es el nivel de "sal", el estándar de la industria)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlana, salt);

  console.log('👤 Insertando usuario en la base de datos...');

  try {
    const admin = await prisma.usuarios.upsert({
      where: { email: 'admin@zf.com' },
      update: {
        // Si el usuario ya existe, le actualizamos la contraseña para asegurarnos de que funcione
        password_hash: passwordHash
      },
      create: {
        nombre_completo: 'Administrador Maestro',
        email: 'admin@zf.com',
        password_hash: passwordHash,
        id_rol: 1,         // IMPORTANTE: Asegúrate de tener el Rol con ID 1 en tu BD
        id_disciplina: 1,  // IMPORTANTE: Asegúrate de tener la Disciplina con ID 1 en tu BD
        activo: true
      }
    });

    console.log('✅ ¡Éxito! Usuario listo para pruebas.');
    console.log('-----------------------------------');
    console.log(`📧 Email para Postman: ${admin.email}`);
    console.log(`🔑 Contraseña para Postman: ${passwordPlana}`);
    console.log(`🛡️ Hash real guardado: ${admin.password_hash}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('❌ Error al crear el usuario. ¿Existen el id_rol 1 y id_disciplina 1 en tus tablas?');
    console.error(error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });