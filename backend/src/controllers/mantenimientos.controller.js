const prisma = require('../services/prisma');

// ==========================================
// 1. GET: Lista de equipos en el taller
// ==========================================
const getMantenimientos = async (req, res) => {
  try {
    const mantenimientos = await prisma.mantenimientos_incidencias.findMany({
      include: { 
        activo: { select: { nombre_maquina: true, qr_codigo: true } },
        reportador: { select: { nombre_completo: true } }
      },
      orderBy: { fecha_reporte: 'desc' }
    });
    res.status(200).json(mantenimientos);
  } catch (error) {
    console.error("🚨 ERROR DE PRISMA:", error);
    res.status(500).json({ error: "Error al obtener mantenimientos." });
  }
};

// ==========================================
// 2. POST: Levantar reporte de daño (Bloquea la máquina)
// ==========================================
const crearMantenimiento = async (req, res) => {
  try {
    const { id_activo, id_solicitud_origen, tipo_mantenimiento, descripcion, fecha_programada } = req.body;
    const id_reportador = req.usuario_token.id; 

    // 🛡️ Transacción: Creamos reporte y bloqueamos máquina al mismo tiempo (Todo o nada)
    const nuevoMantenimiento = await prisma.$transaction(async (tx) => {
      
      // A) Crear el ticket de mantenimiento
      const reporte = await tx.mantenimientos_incidencias.create({
        data: {
          id_activo: parseInt(id_activo),
          id_reportador: id_reportador,
          id_solicitud_origen: id_solicitud_origen ? parseInt(id_solicitud_origen) : null,
          tipo_mantenimiento,
          descripcion,
          fecha_programada: fecha_programada ? new Date(fecha_programada) : null,
          estatus_reparacion: 'Abierto'
        }
      });

      // B) Cambiar estado de la máquina a "En mantenimiento" (ID 2)
      await tx.activos.update({
        where: { id_activo: parseInt(id_activo) },
        data: { id_estado_maquina: 2 }
      });

      return reporte;
    });

    res.status(201).json({ 
      status: "success", 
      id_mantenimiento: nuevoMantenimiento.id_mantenimiento, 
      estatus_reparacion: "Abierto",
      mensaje: "Reporte creado y equipo bloqueado exitosamente."
    });
  } catch (error) {
    console.error("🚨 ERROR DE PRISMA:", error);
    res.status(400).json({ error: "No se pudo crear el reporte de mantenimiento." });
  }
};

// ==========================================
// 3. PATCH: Técnico repara el equipo (Libera la máquina)
// ==========================================
const cerrarMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ Transacción: Cerramos ticket y liberamos máquina al mismo tiempo
    await prisma.$transaction(async (tx) => {
      
      // A) Cerrar el ticket y registrar la fecha de resolución
      const mantenimiento = await tx.mantenimientos_incidencias.update({
        where: { id_mantenimiento: parseInt(id) },
        data: { 
          estatus_reparacion: 'Cerrado', 
          fecha_resolucion: new Date()
        }
      });

      // B) El equipo ya está arreglado, lo regresamos a "Operativa" (ID 1)
      await tx.activos.update({
        where: { id_activo: mantenimiento.id_activo },
        data: { id_estado_maquina: 1 }
      });
    });

    res.status(200).json({ 
      status: "success", 
      activo_liberado: true, 
      mensaje: "Equipo reparado y disponible para préstamos." 
    });
  } catch (error) {
    console.error("🚨 ERROR DE PRISMA:", error);
    res.status(500).json({ error: "Error al cerrar el mantenimiento." });
  }
};

module.exports = { getMantenimientos, crearMantenimiento, cerrarMantenimiento };