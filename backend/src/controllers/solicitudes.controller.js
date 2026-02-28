// src/controllers/solicitudes.controller.js
const prisma = require('../services/prisma');

const crearSolicitud = async (req, res) => {
  try {
    // 1. Extraemos ID y Rol del token (inyectado por tu middleware de auth)
    const id_usuario_solicitante = req.usuario_token.id;
    const id_rol_usuario = req.usuario_token.id_rol; // 👈 Clave para la lógica bimodal

    const { 
      id_activo, 
      tipo_salida, 
      fecha_salida_programada, 
      fecha_devolucion_programada, 
      id_destino, // Este es el id_proyecto de centros_costo_proyectos
      metodo_transporte 
    } = req.body;

    // 2. Buscamos el activo
    const activo = await prisma.activos.findUnique({
      where: { id_activo: parseInt(id_activo) }
    });

    if (!activo) {
      return res.status(404).json({ error: "El activo solicitado no existe." });
    }

    // Validamos disponibilidad (1 = Operativa/Disponible)
    if (activo.id_estado_maquina !== 1) { 
      return res.status(400).json({ error: "Este equipo no está disponible para préstamo o asignación." });
    }

    // 🔍 DETERMINAR FLUJO POR ROL
    const esAdmin = id_rol_usuario === 1; // Suponiendo que 1 es Admin en tu DB
    const estatusGeneral = esAdmin ? "Aprobada" : "Pendiente";
    const nuevoEstadoActivo = esAdmin ? 3 : 4; // 3 = Prestada (Directo), 4 = En proceso de préstamo

    // 3. Lógica de firmas (Solo si NO es admin)
    let firmasRequeridas = [];
    if (!esAdmin) {
      let regla = await prisma.reglas_aprobacion.findUnique({
        where: { id_categoria: activo.id_categoria }
      });

      if (!regla) {
        regla = { requiere_gerente: true, requiere_syr: false, requiere_ehs: false };
      }

      if (regla.requiere_gerente) {
        firmasRequeridas.push({ id_rol_esperado: 3, estatus_firma: "Pendiente" });
      }

      if (regla.requiere_syr) {
        firmasRequeridas.push({ id_rol_esperado: 4, estatus_firma: "Pendiente" });
      }

      if (regla.requiere_ehs || (tipo_salida && tipo_salida.toLowerCase() === 'scrap')) {
        firmasRequeridas.push({ id_rol_esperado: 5, estatus_firma: "Pendiente" });
      }
    }

    // 4. TRANSACCIÓN ATÓMICA
    const nuevaSolicitud = await prisma.$transaction(async (tx) => {
      
      // A. Crear la Solicitud
      const solicitud = await tx.solicitudes.create({
        data: {
          id_activo: parseInt(id_activo),
          id_usuario_solicitante: id_usuario_solicitante,
          id_destino: id_destino ? parseInt(id_destino) : null, // Vinculado a centros_costo_proyectos
          tipo_salida: tipo_salida || (esAdmin ? "Asignacion Directa" : "Prestamo"),
          estatus_general: estatusGeneral,
          fecha_salida_programada: fecha_salida_programada ? new Date(fecha_salida_programada) : new Date(),
          fecha_devolucion_programada: fecha_devolucion_programada ? new Date(fecha_devolucion_programada) : null,
          metodo_transporte: metodo_transporte || "Interno"
        }
      });

      // B. Crear Firmas (Solo si hay firmas y NO es admin)
      if (firmasRequeridas.length > 0) {
        const firmasData = firmasRequeridas.map(firma => ({
          ...firma,
          id_solicitud: solicitud.id_solicitud
        }));
        await tx.aprobaciones_firma.createMany({ data: firmasData });
      }

      // C. Actualizar Estado del Activo
      await tx.activos.update({
        where: { id_activo: parseInt(id_activo) },
        data: { id_estado_maquina: nuevoEstadoActivo } 
      });

      return solicitud;
    });

    res.status(201).json({
      id_solicitud: nuevaSolicitud.id_solicitud,
      estatus_general: nuevaSolicitud.estatus_general,
      mensaje: esAdmin ? "Asignación directa realizada con éxito" : "Solicitud creada, pendiente de firmas"
    });

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno al generar la solicitud o asignación." });
  }
};

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
        activo: true,
        solicitante: { 
          select: { nombre_completo: true }
        }
      }
    });

    const respuestaFormateada = solicitudes.map(sol => ({
      id_solicitud: sol.id_solicitud,
      estatus_general: sol.estatus_general,
      activo: {
        id_activo: sol.activo?.id_activo,
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
<<<<<<< Updated upstream
    // CORRECCIÓN 1: Forzar a que sea un Int. Prisma odia los strings en campos numéricos.
    const id_usuario = parseInt(req.usuario_token.id, 10);

=======
    const id_usuario = parseInt(req.usuario_token.id, 10);
>>>>>>> Stashed changes
    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: "ID de usuario inválido en el token" });
    }

    // 1. Recibimos los parámetros de paginación y filtros desde el frontend
    const { page = 1, limit = 10, estatus, q } = req.query;
    
    // 2. Armamos la cláusula de búsqueda dinámica
    const whereClause = { id_usuario_solicitante: id_usuario };

    if (estatus) {
      whereClause.estatus_general = estatus;
    }

    // Búsqueda inteligente por nombre de máquina o ID de folio
    if (q) {
      const orConditions = [
        { activo: { nombre_maquina: { contains: q, mode: 'insensitive' } } }
      ];
      
      const qNum = parseInt(q, 10);
      if (!isNaN(qNum)) {
        orConditions.push({ id_solicitud: qNum });
      }
      whereClause.OR = orConditions;
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // 3. Ejecutamos cuenta total y búsqueda en paralelo
    const [totalRegistros, misSolicitudes] = await Promise.all([
      prisma.solicitudes.count({ where: whereClause }),
      prisma.solicitudes.findMany({
        where: whereClause,
        skip: skip,
        take: parsedLimit,
        orderBy: { fecha_salida_programada: 'desc' },
        include: {
          activo: { select: { nombre_maquina: true } }
        }
      })
    ]);

    const respuestaFormateada = misSolicitudes.map(sol => ({
      id_solicitud: sol.id_solicitud,
      estatus_general: sol.estatus_general,
      fecha_salida_programada: sol.fecha_salida_programada,
      activo: {
        nombre_maquina: sol.activo?.nombre_maquina || "N/A"
      }
    }));

    // 4. Devolvemos el estándar de la industria
    res.status(200).json({ 
      data: respuestaFormateada,
      meta: {
        total: totalRegistros,
        paginaActual: parsedPage,
        totalPaginas: Math.ceil(totalRegistros / parsedLimit) || 1
      }
    });
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

    // Formateamos la respuesta 
    const respuestaFormateada = {
      id_solicitud: solicitud.id_solicitud,
      estatus_general: solicitud.estatus_general,
      
      // AGREGAMOS LOS CAMPOS LOGÍSTICOS QUE FALTABAN
      tipo_salida: solicitud.tipo_salida,
      fecha_salida_programada: solicitud.fecha_salida_programada,
      fecha_devolucion_programada: solicitud.fecha_devolucion_programada,
      metodo_transporte: solicitud.metodo_transporte,
      id_destino: solicitud.id_destino,

      activo: {
        nombre_maquina: solicitud.activo?.nombre_maquina || "Desconocido"
      },
      solicitante: {
        nombre_completo: solicitud.solicitante?.nombre_completo || "Desconocido"
      },
      
      // TRADUCCIÓN DE FIRMAS: Convertimos la lista de Prisma al formato que espera React
      firmas: {
        gerente: solicitud.firmas.find(f => f.id_rol_esperado === 3)?.estatus_firma || 'Pendiente',
        syr: solicitud.firmas.find(f => f.id_rol_esperado === 4)?.estatus_firma || 'Pendiente',
        ehs: solicitud.firmas.find(f => f.id_rol_esperado === 5)?.estatus_firma || 'Pendiente'
      }
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