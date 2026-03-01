const cron = require('node-cron');
const prisma = require('./prisma');

cron.schedule('0 * * * *', async () => { // Cada minuto para pruebas
  try {
    const hoy = new Date();

    const porVencer = await prisma.solicitudes.findMany({
      where: {
        estatus_general: { in: ['Aprobada', 'En tránsito'] },
        fecha_devolucion_programada: { lt: hoy }
      }
    });

    if (porVencer.length > 0) {
      for (const sol of porVencer) {
        await prisma.$transaction([
          // 1. Actualizamos el estatus de la solicitud
          prisma.solicitudes.update({
            where: { id_solicitud: sol.id_solicitud },
            data: { estatus_general: 'Vencido' }
          }),

          // 2. ÚNICO REGISTRO: En tu tabla de alertas
          prisma.registro_alertas_retrasos.create({
            data: {
              id_solicitud: sol.id_solicitud,
              id_usuario_infractor: sol.id_usuario_solicitante,
              tipo_alerta: "vencimiento" // Lo usamos en minúsculas para el CSS de tu React
            }
          })
        ]);
      }
      console.log(`✅ ${porVencer.length} alertas registradas en registro_alertas_retrasos.`);
    }
  } catch (error) {
    console.error('❌ Error en el Cron Job:', error);
  }
});