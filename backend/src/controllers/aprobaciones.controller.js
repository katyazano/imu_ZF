const prisma = require('../services/prisma');

const getFirmasPendientes = async (req, res) => {
  try {
    // 1. Obtenemos el rol del jefe desde el token
    const id_rol_jefe = req.usuario_token.id_rol;

    // 2. Buscamos todas las firmas donde el rol coincida y el estatus sea pendiente
    const firmas = await prisma.aprobaciones_firma.findMany({
      where: {
        id_rol_esperado: id_rol_jefe,
        estatus_firma: 'Pendiente'
      },
      include: {
        solicitud: {
          include: {
            activo: { select: { nombre_maquina: true } },
            solicitante: { select: { nombre_completo: true } }
          }
        }
      }
    });

    // 3. Mapeamos para que el JSON quede limpiecito como pide tu documento
    const respuesta = firmas.map(f => ({
      id_firma: f.id_firma,
      solicitud: {
        id_solicitud: f.solicitud.id_solicitud,
        activo: {
          nombre_maquina: f.solicitud.activo?.nombre_maquina || "N/A"
        },
        solicitante: {
          nombre_completo: f.solicitud.solicitante?.nombre_completo || "Desconocido"
        }
      }
    }));

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en getFirmasPendientes:", error);
    res.status(500).json({ error: "Error al cargar la bandeja de pendientes" });
  }
};

module.exports = { getFirmasPendientes };