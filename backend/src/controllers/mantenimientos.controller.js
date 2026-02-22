// src/controllers/mantenimientos.controller.js
const prisma = require('../services/prisma');

// GET /api/mantenimientos -> Lista de equipos en el taller
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

// POST /api/mantenimientos -> Levantar reporte de daño
const crearMantenimiento = async (req, res) => {
  try {
    const { id_activo, id_solicitud_origen, tipo_mantenimiento, descripcion, fecha_programada } = req.body;
    const id_reportador = req.usuario_token.id; 

    const nuevoMantenimiento = await prisma.mantenimientos_incidencias.create({
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

    // Cambiar estado de la máquina a "En mantenimiento" (ID 2)
    await prisma.activos.update({
      where: { id_activo: parseInt(id_activo) },
      data: { id_estado_maquina: 2 }
    });

    res.status(201).json({ 
      status: "success", 
      id_mantenimiento: nuevoMantenimiento.id_mantenimiento, 
      estatus_reparacion: "Abierto" 
    });
  } catch (error) {
    console.error("🚨 ERROR DE PRISMA:", error);
    res.status(400).json({ error: "No se pudo crear el reporte de mantenimiento." });
  }
};

// PATCH /api/mantenimientos/:id -> Técnico repara el equipo
const cerrarMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const mantenimiento = await prisma.mantenimientos_incidencias.update({
      where: { id_mantenimiento: parseInt(id) },
      data: { 
        estatus_reparacion: 'Cerrado', 
        fecha_resolucion: new Date()
      }
    });

    // El equipo ya está arreglado, lo regresamos a "Operativa" (ID 1)
    await prisma.activos.update({
      where: { id_activo: mantenimiento.id_activo },
      data: { id_estado_maquina: 1 }
    });

    res.status(200).json({ status: "success", activo_liberado: true, mensaje: "Equipo reparado y disponible." });
  } catch (error) {
    console.error("🚨 ERROR DE PRISMA:", error);
    res.status(500).json({ error: "Error al cerrar el mantenimiento." });
  }
};

module.exports = { getMantenimientos, crearMantenimiento, cerrarMantenimiento };