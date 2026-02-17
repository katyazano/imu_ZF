const prisma = require('../src/services/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('--- INICIANDO SEED ZF HALO ---');

  // ===========================================================================
  // 1. DEFINICIÓN DE ROLES (Jerarquía de Seguridad)
  // ===========================================================================
  const rolAdmin = await prisma.roles.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN' }
  });

  const rolUser = await prisma.roles.upsert({
    where: { nombre: 'USUARIO' },
    update: {},
    create: { nombre: 'USUARIO' }
  });

  console.log('Roles asegurados: ADMIN y USUARIO.');

  // ===========================================================================
  // 2. CATÁLOGOS BASE (Datos Maestros)
  // ===========================================================================
  const catLaptop = await prisma.categorias_activos.upsert({
    where: { nombre: 'Laptops' },
    update: {},
    create: { nombre: 'Laptops' }
  });

  const estadoDisp = await prisma.estados_activos.upsert({
    where: { nombre: 'DISPONIBLE' },
    update: {},
    create: { nombre: 'DISPONIBLE' }
  });

  const ubicacion = await prisma.ubicaciones.upsert({
    where: { nombre: 'Oficina Central' },
    update: {},
    create: { nombre: 'Oficina Central' }
  });

  console.log('Catálogos base asegurados.');

  // ===========================================================================
  // 3. USUARIOS DEL SISTEMA (Credenciales)
  // ===========================================================================
  
  // --- A. Usuario Administrador (Kathy) ---
  const passAdmin = await bcrypt.hash('admin123', 10);
  const emailAdmin = 'kathy.admin@zf.com';

  await prisma.usuarios.upsert({
    where: { email: emailAdmin },
    update: { password_hash: passAdmin }, // Actualiza pass si corres el seed de nuevo
    create: {
      nombre_completo: 'Kathy Lider',
      email: emailAdmin,
      password_hash: passAdmin,
      id_rol: rolAdmin.id_rol
    }
  });

  // --- B. Usuario Base (Pepe) ---
  const passUser = await bcrypt.hash('user123', 10);
  const emailUser = 'pepe.usuario@zf.com';

  await prisma.usuarios.upsert({
    where: { email: emailUser },
    update: { password_hash: passUser },
    create: {
      nombre_completo: 'Pepe Empleado',
      email: emailUser,
      password_hash: passUser,
      id_rol: rolUser.id_rol
    }
  });

  console.log('✅ Usuarios creados: Kathy (Admin) y Pepe (Usuario).');

  // ===========================================================================
  // 4. ACTIVOS DE PRUEBA (Solo si la DB está vacía)
  // ===========================================================================
  const totalActivos = await prisma.activos.count();

  if (totalActivos === 0) {
    const activosData = [
      { nombre: 'MacBook Pro M3', serie: `APPLE-${Date.now()}-1` },
      { nombre: 'Dell Latitude 5420', serie: `DELL-${Date.now()}-2` },
      { nombre: 'Lenovo ThinkPad X1', serie: `LENOVO-${Date.now()}-3` }
    ];

    for (const item of activosData) {
      await prisma.activos.create({
        data: {
          nombre_maquina: item.nombre,
          numero_serie: item.serie,
          id_categoria: catLaptop.id_categoria,
          id_estado: estadoDisp.id_estado,
          id_ubicacion: ubicacion.id_ubicacion
        }
      });
    }
    console.log(`Se insertaron ${activosData.length} activos de prueba.`);
  } else {
    console.log(`ℹOmitiendo activos (Ya existen ${totalActivos} en BD).`);
  }

  console.log('--- SEED COMPLETADO EXITOSAMENTE ---');
}

main()
  .catch((e) => {
    console.error('Error fatal en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });