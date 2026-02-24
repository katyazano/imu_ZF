// src/controllers/bitacora.controller.js
const prisma = require('../services/prisma');

// POST /api/bitacora/checkout -> El guardia escanea salida
const registrarCheckout = async (req, res) => {
  try {
    const { qr_codigo } = req.body;
    const id_guardia = req.usuario_token.id; // Asumiendo que tu token trae 'id'

    // 1. Encontrar el activo por QR
    const activo = await prisma.activos.findFirst({ where: { qr_codigo } });
    if (!activo) return res.status(404).json({ error: "QR no reconocido en el catálogo." });

    // 2. Encontrar la solicitud aprobada para este activo
    const solicitudAprobada = await prisma.solicitudes.findFirst({
      where: { id_activo: activo.id_activo, estatus_general: 'Aprobada' },
      orderBy: { fecha_creacion: 'desc' }
    });

    if (!solicitudAprobada) {
      return res.status(403).json({ error: "ALERTA: Este equipo no tiene una solicitud Aprobada. ¡No puede salir!" });
    }

    // 3. Crear registro en bitácora (Conectando Guardia y Solicitud, como dicta tu Schema)
    const registro = await prisma.bitacora_caseta.create({
      data: {
        guardia: { connect: { id_usuario: id_guardia } },
        solicitud: { connect: { id_solicitud: solicitudAprobada.id_solicitud } },
        tipo_movimiento: 'Salida'
        // fecha_hora_real se llena automáticamente por el @default(now()) en tu schema
      }
    });

    // 4. Cambiar solicitud a "En Uso"
    await prisma.solicitudes.update({
      where: { id_solicitud: solicitudAprobada.id_solicitud },
      data: { estatus_general: 'En Uso' }
    });

    // 5. Cambiar activo a "Prestada" (ID 3 según tu catálogo de estados)
    await prisma.activos.update({
      where: { id_activo: activo.id_activo },
      data: { id_estado_maquina: 3 }
    });

    res.status(200).json({ 
      status: "success", 
      mensaje: "Salida autorizada y registrada.", 
      fecha_hora_real: registro.fecha_hora_real 
    });
  } catch (error) {
    console.error("🚨 ERROR DETALLADO DE PRISMA:", error);
    res.status(500).json({ error: "Error al registrar checkout." });
  }
};

// POST /api/bitacora/checkin -> El guardia escanea entrada
const registrarCheckin = async (req, res) => {
  try {
    const { qr_codigo } = req.body;
    const id_guardia = req.usuario_token.id;

    // 1. Encontrar el activo por QR
    const activo = await prisma.activos.findFirst({ where: { qr_codigo } });
    if (!activo) return res.status(404).json({ error: "QR no reconocido." });

    // 2. Buscar la solicitud ACTIVA (En Uso) para poder amarrarla a la bitácora
    const solicitudActiva = await prisma.solicitudes.findFirst({
      where: { id_activo: activo.id_activo, estatus_general: 'En Uso' }
    });

    if (!solicitudActiva) {
       return res.status(400).json({ error: "Este equipo no figura como 'En Uso' actualmente." });
    }

    // 3. Crear registro de entrada en bitácora
    const registro = await prisma.bitacora_caseta.create({
      data: {
        guardia: { connect: { id_usuario: id_guardia } },
        solicitud: { connect: { id_solicitud: solicitudActiva.id_solicitud } },
        tipo_movimiento: 'Entrada'
      }
    });

    // 4. Cerrar solicitud a "Devuelto"
    await prisma.solicitudes.update({
      where: { id_solicitud: solicitudActiva.id_solicitud },
      data: { estatus_general: 'Devuelto' } 
    });

    // 5. Devolver activo a estado "Operativa" (ID 1 según tu catálogo)
    await prisma.activos.update({
      where: { id_activo: activo.id_activo },
      data: { id_estado_maquina: 1 } 
    });

    res.status(200).json({ 
      status: "success", 
      mensaje: "Equipo devuelto al almacén.", 
      fecha_hora_real: registro.fecha_hora_real 
    });
  } catch (error) {
    console.error("🚨 ERROR DETALLADO DE PRISMA:", error);
    res.status(500).json({ error: "Error al registrar checkin." });
  }
};

// GET /api/bitacora -> Historial puro para el auditor
const getBitacora = async (req, res) => {
  try {
    const historial = await prisma.bitacora_caseta.findMany({
      include: {
        // Navegamos: Bitácora -> Solicitud -> Activo
        solicitud: { 
          select: { 
            activo: { select: { nombre_maquina: true, qr_codigo: true } } 
          } 
        },
        guardia: { select: { nombre_completo: true } }
      },
      orderBy: { fecha_hora_real: 'desc' },
      take: 100 // Límite de seguridad
    });

    // Mapeamos la respuesta para hacerla súper amigable para React
    const historialFormateado = historial.map(item => ({
      id_bitacora: item.id_bitacora,
      tipo_movimiento: item.tipo_movimiento,
      fecha_hora_real: item.fecha_hora_real,
      guardia: item.guardia?.nombre_completo,
      activo: item.solicitud?.activo?.nombre_maquina || 'Desconocido',
      qr_codigo: item.solicitud?.activo?.qr_codigo || 'N/A'
    }));

    res.status(200).json(historialFormateado);
  } catch (error) {
    console.error("🚨 ERROR AL OBTENER BITACORA:", error);
    res.status(500).json({ error: "Error al obtener la bitácora." });
  }
};

module.exports = { registrarCheckout, registrarCheckin, getBitacora };