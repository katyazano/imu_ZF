const prisma = require('../src/services/prisma');

/**
 * Script de inicialización de datos (Seeding).
 * Carga catálogos base (Roles, Categorías, Estados) y datos de prueba.
 * Utiliza 'upsert' para evitar duplicados en ejecuciones múltiples.
 */

async function main() {
  console.log('Iniciando proceso de seeding...');

  // 1. Inicialización de Catálogos
  const rolAdm = await prisma.roles.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN' }
  });

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

  console.log('Catalogos verificados.');

  // 2. Creación de Usuario Administrador
  const adminEmail = `kathy.admin.${Date.now()}@zf.com`;
  await prisma.usuarios.create({
    data: {
      nombre_completo: 'Kathy Lider',
      email: adminEmail,
      password_hash: 'admin123_hash_placeholder', // TODO: Implementar hash real con bcrypt
      id_rol: rolAdm.id_rol
    }
  });

  // 3. Inserción de Activos de Prueba
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

  console.log(`Seeding completado exitosamente. ${activosData.length} activos insertados.`);
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });