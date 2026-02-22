// src/controllers/solicitudes.controller.js
const prisma = require('../services/prisma');

const crearSolicitud = async (req, res) => {
  try {
    // 1. Extraemos el ID del usuario directamente del token (magia del middleware)
    const id_usuario_solicitante = req.usuario_token.id; 

    // 2. Extraemos los datos que nos manda React o Postman
    const { 
      id_activo, 
      tipo_salida, 
      fecha_salida_programada, 
      fecha_devolucion_programada, 
      id_destino, 
      metodo_transporte 
    } = req.body;

    // 3. Buscamos el activo para saber a qué categoría pertenece (para leer las reglas)
    const activo = await prisma.activos.findUnique({
      where: { id_activo: parseInt(id_activo) }
    });

    if (!activo) {
      return res.status(404).json({ error: "El activo solicitado no existe." });
    }

    // Opcional: Validar que el equipo no esté ya prestado o en mantenimiento
    if (activo.id_estado_maquina !== 1) { // Suponiendo que 1 = Disponible
      return res.status(400).json({ error: "Este equipo no está disponible para préstamo." });
    }

    // 4. Buscamos las reglas de aprobación del Admin para esta categoría
    const regla = await prisma.reglas_aprobacion.findUnique({
      where: { id_categoria: activo.id_categoria }
    });

    if (!regla) {
      return res.status(400).json({ error: "No hay reglas de firma configuradas para esta categoría." });
    }

    // 5. Construimos el "Arreglo de Firmas" basándonos en las reglas y el tipo de salida
    const firmasRequeridas = [];

    // Regla 1: ¿Requiere Gerente? (ID Rol = 3)
    if (regla.requiere_gerente) {
      firmasRequeridas.push({ id_rol_esperado: 3, estatus_firma: "Pendiente" });
    }

    // Regla 2: ¿Requiere Logística S&R? (ID Rol = 4)
    if (regla.requiere_syr) {
      firmasRequeridas.push({ id_rol_esperado: 4, estatus_firma: "Pendiente" });
    }

    // Regla 3: Si es Scrap o la regla manda EHS (ID Rol = 5)
    if (regla.requiere_ehs || tipo_salida.toLowerCase() === 'scrap') {
      // Solo validamos que no lo hayamos metido ya dos veces
      const yaTieneEHS = firmasRequeridas.some(f => f.id_rol_esperado === 5);
      if (!yaTieneEHS) {
        firmasRequeridas.push({ id_rol_esperado: 5, estatus_firma: "Pendiente" });
      }
    }

    // 6. Ejecutamos la "Transacción" (Todo o nada)
    const nuevaSolicitud = await prisma.$transaction(async (tx) => {
      
      // A) Creamos la solicitud de viaje
      const solicitud = await tx.solicitudes.create({
        data: {
          id_activo: parseInt(id_activo),
          id_usuario_solicitante: id_usuario_solicitante,
          id_destino: id_destino ? parseInt(id_destino) : null,
          tipo_salida: tipo_salida,
          estatus_general: "Pendiente", // Como dice tu documento
          fecha_salida_programada: new Date(fecha_salida_programada),
          // Si es Scrap o sin retorno, la fecha de devolución puede venir vacía
          fecha_devolucion_programada: fecha_devolucion_programada ? new Date(fecha_devolucion_programada) : null,
          metodo_transporte: metodo_transporte
        }
      });

      // B) Creamos todas las firmas necesarias ligadas a esta nueva solicitud
      if (firmasRequeridas.length > 0) {
        const firmasData = firmasRequeridas.map(firma => ({
          ...firma,
          id_solicitud: solicitud.id_solicitud // Le inyectamos el ID que se acaba de crear arriba
        }));

        await tx.aprobaciones_firma.createMany({
          data: firmasData
        });
      }

      return solicitud;
    });

    // 7. Respondemos exactamente lo que el Frontend espera
    res.status(201).json({
      id_solicitud: nuevaSolicitud.id_solicitud,
      estatus_general: nuevaSolicitud.estatus_general
    });

  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ error: "Error interno al generar la solicitud y firmas." });
  }
};


// ========================================================
// 1. EL HISTORIAL MAESTRO (Ya con los nombres correctos)
// ========================================================
const getSolicitudesMaster = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol; 
    const rolesPermitidos = [1, 6, 7];
    
    if (!rolesPermitidos.includes(id_rol)) {
      return res.status(403).json({ error: "Acceso denegado. Tu rol no tiene permisos para auditar el historial maestro." });
    }

    const { estatus, page = 1, limit = 10 } = req.query;
    const whereClause = {};
    if (estatus) whereClause.estatus_general = estatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const solicitudes = await prisma.solicitudes.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      orderBy: { fecha_salida_programada: 'desc' },
      include: {
        activo: { // <-- CORREGIDO: 'activo'
          select: { nombre_maquina: true, qr_codigo: true }
        },
        solicitante: { // <-- CORREGIDO: 'solicitante'
          select: { nombre_completo: true }
        }
      }
    });

    const respuestaFormateada = solicitudes.map(sol => ({
      id_solicitud: sol.id_solicitud,
      estatus_general: sol.estatus_general,
      activo: {
        nombre_maquina: sol.activo?.nombre_maquina || "N/A",
        tag: sol.activo?.qr_codigo || "Sin Tag"
      },
      solicitante: {
        nombre_completo: sol.solicitante?.nombre_completo || "Usuario Desconocido"
      }
    }));

    const totalRegistros = await prisma.solicitudes.count({ where: whereClause });

    res.status(200).json({
      data: respuestaFormateada,
      paginacion: {
        total: totalRegistros,
        pagina_actual: parseInt(page),
        limite: parseInt(limit),
        total_paginas: Math.ceil(totalRegistros / limit)
      }
    });

  } catch (error) {
    console.error("Error en getSolicitudesMaster:", error);
    res.status(500).json({ error: "Error al consultar el historial maestro" });
  }
};

module.exports = { crearSolicitud, getSolicitudesMaster };