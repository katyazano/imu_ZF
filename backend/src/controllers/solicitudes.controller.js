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
    let regla = await prisma.reglas_aprobacion.findUnique({
      where: { id_categoria: activo.id_categoria }
    });

    // 🛡️ EL PLAN B (Fallback): Si no hay regla, aplicamos la configuración por defecto
    if (!regla) {
      console.warn(`Categoría ${activo.id_categoria} sin reglas. Usando valores por defecto.`);
      regla = { 
        requiere_gerente: true, // Por seguridad, siempre pedimos firma de gerente
        requiere_syr: false, 
        requiere_ehs: false 
      };
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


const getMisSolicitudes = async (req, res) => {
  try {
    // Sacamos el ID del usuario directamente del token
    const id_usuario = req.usuario_token.id;

    // Buscamos SOLO las solicitudes de este usuario
    const misSolicitudes = await prisma.solicitudes.findMany({
      where: { id_usuario_solicitante: id_usuario },
      orderBy: { fecha_salida_programada: 'desc' },
      include: {
        activo: {
          select: { nombre_maquina: true }
        }
      }
    });

    // Mapeamos al formato exacto de tu documento
    const respuestaFormateada = misSolicitudes.map(sol => ({
      id_solicitud: sol.id_solicitud,
      estatus_general: sol.estatus_general,
      fecha_salida_programada: sol.fecha_salida_programada,
      activo: {
        nombre_maquina: sol.activo?.nombre_maquina || "N/A"
      }
    }));

    res.status(200).json(respuestaFormateada);
  } catch (error) {
    console.error("Error en getMisSolicitudes:", error);
    res.status(500).json({ error: "Error al consultar tus solicitudes" });
  }
};


const getSolicitudPorId = async (req, res) => {
  try {
    // Convertimos el string de la URL a un número entero
        const id = parseInt(req.params.id, 10);

        // Validación rápida por si mandan algo que no es un número
        if (isNaN(id)) {
        return res.status(400).json({ error: "El ID de la solicitud debe ser un número válido" });
        }

    const solicitud = await prisma.solicitudes.findUnique({
      where: { id_solicitud: id },
      // Hacemos los JOINs con los nombres exactos de tu schema
      include: {
        activo: { 
          select: { nombre_maquina: true }
        },
        solicitante: { 
          select: { nombre_completo: true }
        },
        firmas: { 
          select: {
            id_firma: true,
            id_rol_esperado: true,
            estatus_firma: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // Formateamos la respuesta para que empate 100% con tu documento
    const respuestaFormateada = {
      id_solicitud: solicitud.id_solicitud,
      estatus_general: solicitud.estatus_general,
      activo: {
        nombre_maquina: solicitud.activo?.nombre_maquina || "Desconocido"
      },
      solicitante: {
        nombre_completo: solicitud.solicitante?.nombre_completo || "Desconocido"
      },
      firmas: solicitud.firmas
    };

    res.status(200).json(respuestaFormateada);
  } catch (error) {
    console.error("Error en getSolicitudPorId:", error);
    res.status(500).json({ error: "Error al obtener el detalle de la solicitud" });
  }
};


const cancelarSolicitud = async (req, res) => {
  try {
    const id_solicitud = parseInt(req.params.id, 10);
    const id_usuario_auth = req.usuario_token.id;
    const id_rol_auth = req.usuario_token.id_rol; // Extraemos el rol del token

    if (isNaN(id_solicitud)) {
      return res.status(400).json({ error: "El ID de la solicitud debe ser un número válido" });
    }

    // 1. Buscamos la solicitud
    const solicitud = await prisma.solicitudes.findUnique({
      where: { id_solicitud },
    });

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    // 2. SEGURIDAD REFORZADA: 
    // Si NO es el dueño (id_usuario_solicitante) Y TAMPOCO es Admin (id_rol 1)
    if (solicitud.id_usuario_solicitante !== id_usuario_auth && id_rol_auth !== 1) {
      return res.status(403).json({ error: "No tienes permiso para cancelar esta solicitud" });
    }

    // 3. LÓGICA DE NEGOCIO: Solo cancelar si sigue Pendiente
    // Nota: Usamos 'Pendiente' con P mayúscula para que coincida con tu crearSolicitud
    if (solicitud.estatus_general !== 'Pendiente') {
      return res.status(400).json({ error: "Solo se pueden cancelar solicitudes en estado Pendiente" });
    }

    // 4. TRANSACCIÓN: Actualizar solicitud y liberar activo
    await prisma.$transaction([
      // Marcar solicitud como cancelada
      prisma.solicitudes.update({
        where: { id_solicitud },
        data: { estatus_general: 'Cancelada' }
      }),
      // Liberar el activo (1 = Disponible)
      prisma.activos.update({
        where: { id_activo: solicitud.id_activo },
        data: { id_estado_maquina: 1 } 
      })
    ]);

    res.json({ status: "success", estatus_general: "Cancelada" });

  } catch (error) {
    console.error("Error al cancelar:", error);
    res.status(500).json({ error: "Error interno al procesar la cancelación" });
  }
};

module.exports = { 
  crearSolicitud, 
  getSolicitudesMaster, 
  getMisSolicitudes, 
  getSolicitudPorId, 
  cancelarSolicitud 
};