const prisma = require('../services/prisma');

const getNotificacionesMaestras = async (req, res) => {
  try {
    const { id, id_rol } = req.usuario_token;
    let notificaciones = [];

    // 🕵️ CASO 1: AUDITOR O ADMIN (Usa registro_alertas_retrasos)
    if ([1, 7].includes(id_rol)) {
      const alertas = await prisma.registro_alertas_retrasos.findMany({
        include: { 
          infractor: { select: { nombre_completo: true } } 
        },
        orderBy: { fecha_envio: 'desc' } // ✅ Correcto según tu schema
      });

      notificaciones = alertas.map(a => ({
        id: `alerta-${a.id_alerta}`,
        titulo: `Alerta: ${a.tipo_alerta}`,
        mensaje: `Infracción detectada para ${a.infractor.nombre_completo}`,
        tipo: 'urgente'
      }));
    }

    // 👔 CASO 2: GERENTE (Usa aprobaciones_firma)
    else if (id_rol === 3) {
      const firmas = await prisma.aprobaciones_firma.findMany({
        where: { id_rol_esperado: 3, estatus_firma: 'Pendiente' },
        include: { 
          solicitud: { include: { solicitante: true } } 
        }
      });

      notificaciones = firmas.map(f => ({
        id: `firma-${f.id_firma}`,
        titulo: "Firma Pendiente",
        mensaje: `${f.solicitud.solicitante.nombre_completo} solicita un activo.`,
        tipo: "peticion"
      }));
    }

    // 👷 CASO 3: USUARIO (Usa solicitudes)
    else {
      const solicitudes = await prisma.solicitudes.findMany({
        where: { id_usuario_solicitante: id },
        orderBy: { 
          fecha_creacion: 'desc' // ✅ CORREGIDO: En tu schema se llama fecha_creacion
        },
        take: 10
      });

      notificaciones = solicitudes.map(s => ({
        id: `sol-${s.id_solicitud}`,
        titulo: `Solicitud #${s.id_solicitud}`,
        mensaje: `Tu trámite está actualmente: ${s.estatus_general}`,
        tipo: s.estatus_general === 'Aprobada' ? 'exito' : 'info'
      }));
    }

    res.json(notificaciones);

  } catch (error) {
    console.error('Error en notificaciones:', error);
    res.status(500).json({ error: "Error al sincronizar notificaciones" });
  }
};

module.exports = { getNotificacionesMaestras };