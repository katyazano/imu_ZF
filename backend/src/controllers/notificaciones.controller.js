const prisma = require('../services/prisma');

const getNotificacionesMaestras = async (req, res) => {
  try {
    // Extraemos datos del token (ajusta según cómo guardes el id en tu middleware)
    const { id, id_rol } = req.usuario_token; 
    let notificaciones = [];

    // 🕵️ CASO 1: AUDITOR O ADMIN (Ve todas las infracciones de la planta)
    if ([1, 7].includes(id_rol)) {
      const alertas = await prisma.registro_alertas_retrasos.findMany({
        include: { 
          infractor: { select: { nombre_completo: true } }, // ✅ Coincide con tu schema
          solicitud: { 
            include: { 
              activo: { select: { nombre_maquina: true } } 
            } 
          } 
        },
        orderBy: { fecha_envio: 'desc' },
        take: 20
      });

      notificaciones = alertas.map(a => ({
        id: `alerta-${a.id_alerta}`,
        id_solicitud: a.id_solicitud,
        titulo: "ALERTA DE SISTEMA",
        mensaje: `${a.infractor?.nombre_completo || 'Usuario'} tiene vencido: ${a.solicitud?.activo?.nombre_maquina || 'Equipo'}`,
        tipo: 'vencimiento', // Esto activa el color rojo en React
        fecha: a.fecha_envio // Usamos 'fecha' para que coincida con tu useEffect de React
      }));
    }

    // 👔 CASO 2: GERENTE (Firmas de aprobación)
    else if (id_rol === 3) {
      const firmas = await prisma.aprobaciones_firma.findMany({
        where: { id_rol_esperado: 3, estatus_firma: 'Pendiente' },
        include: { 
          solicitud: { include: { solicitante: true } } 
        }
      });

      notificaciones = firmas.map(f => ({
        id: `firma-${f.id_firma}`,
        id_solicitud: f.id_solicitud,
        titulo: "Firma Pendiente",
        mensaje: `${f.solicitud?.solicitante?.nombre_completo} solicita un activo.`,
        tipo: "peticion",
        fecha: f.fecha_creacion
      }));
    }

    // 👷 CASO 3: USUARIO (Sus trámites + sus infracciones)
    else {
      // A. Sus retrasos en la tabla de auditoría
      const misInfracciones = await prisma.registro_alertas_retrasos.findMany({
        where: { id_usuario_infractor: id },
        include: { 
          solicitud: { include: { activo: true } } 
        },
        orderBy: { fecha_envio: 'desc' }
      });

      const alertasFormateadas = misInfracciones.map(i => ({
        id: `alerta-${i.id_alerta}`,
        id_solicitud: i.id_solicitud,
        titulo: "⚠️ DEVOLUCIÓN VENCIDA",
        mensaje: `Debes entregar: ${i.solicitud?.activo?.nombre_maquina || 'el equipo'}.`,
        tipo: "vencimiento",
        fecha: i.fecha_envio
      }));

      // B. Sus solicitudes recientes
      const misSolicitudes = await prisma.solicitudes.findMany({
        where: { id_usuario_solicitante: id },
        orderBy: { fecha_creacion: 'desc' },
        take: 10
      });

      const solicitudesFormateadas = misSolicitudes.map(s => ({
        id: `sol-${s.id_solicitud}`,
        id_solicitud: s.id_solicitud,
        titulo: `Solicitud #${s.id_solicitud}`,
        mensaje: `Tu trámite está actualmente: ${s.estatus_general}`,
        tipo: s.estatus_general === 'Aprobada' ? 'exito' : 'movimiento',
        fecha: s.fecha_creacion
      }));

      notificaciones = [...alertasFormateadas, ...solicitudesFormateadas];
    }

    res.json(notificaciones);

  } catch (error) {
    console.error('Error en notificaciones:', error);
    res.status(500).json({ error: "Error al sincronizar notificaciones" });
  }
};

module.exports = { getNotificacionesMaestras };