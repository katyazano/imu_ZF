const prisma = require('../services/prisma');
const crypto = require('crypto');

// ==========================================
// 1. OBTENER TODOS LOS ACTIVOS (Con filtros y ORDENAMIENTO)
// ==========================================
const getActivos = async (req, res) => {
  try {
    // 👇 1. Agregamos 'orden' a lo que recibimos del frontend
    const { id_categoria, id_estado_maquina, mis_activos, limit = 50, page = 1, q, orden } = req.query;
    
    const whereClause = {};

    if (id_categoria) whereClause.id_categoria = parseInt(id_categoria);
    if (id_estado_maquina) whereClause.id_estado_maquina = parseInt(id_estado_maquina);
    if (mis_activos === 'true' && req.usuario_token) {
      // refactor: buscamos en la tabla activos_responsables si el usuario está en la lista de dueños
      whereClause.responsables = {
        some: { id_usuario: req.usuario_token.id }
      };
    }

    if (q) {
      whereClause.OR = [
        { nombre_maquina: { contains: q, mode: 'insensitive' } },
        { numero_serie: { contains: q, mode: 'insensitive' } },
        { qr_codigo: { contains: q, mode: 'insensitive' } }
      ];
      const qNum = parseInt(q);
      if (!isNaN(qNum)) whereClause.OR.push({ id_activo: qNum });
    }

    // 👇 2. LÓGICA DE ORDENAMIENTO (SORT)
    let orderByClause = { id_activo: 'desc' }; // Por defecto: Más recientes

    if (orden === 'antiguos') orderByClause = { id_activo: 'asc' };
    if (orden === 'a-z') orderByClause = { nombre_maquina: 'asc' };
    if (orden === 'z-a') orderByClause = { nombre_maquina: 'desc' };

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const [totalActivos, listaActivos] = await Promise.all([
      prisma.activos.count({ where: whereClause }),
      prisma.activos.findMany({
        where: whereClause,
        skip: skip,
        take: parsedLimit,
        orderBy: orderByClause, // 👈 3. Le pasamos la regla a Prisma
        include: { categoria: true, estado_maquina: true, disciplina: true } 
      })
    ]);

    res.status(200).json({
      data: listaActivos,
      meta: {
        total: totalActivos,
        paginaActual: parsedPage,
        totalPaginas: Math.ceil(totalActivos / parsedLimit) || 1
      }
    });
  } catch (error) {
    console.error('Error en getActivos:', error);
    res.status(500).json({ error: "Hubo un error al consultar los activos" });
  }
};

// ==========================================
// 2. OBTENER UN ACTIVO POR ID O QR
// ==========================================
const getActivoById = async (req, res) => {
  const { id } = req.params; 

  try {
    const idNumerico = parseInt(id);

    const activo = await prisma.activos.findFirst({
      where: {
        OR: [
          { id_activo: isNaN(idNumerico) ? undefined : idNumerico },
          { qr_codigo: id } 
        ]
      },
      include: {
        categoria: true,
        estado_maquina: true,
        disciplina: true,
        ubicacion: true,
        // refactor: en lugar de 'gerente', traemos la lista de responsables y su info
        responsables: { 
          include: {
            gerente: { select: { nombre_completo: true } }
          }
        }
      }
    });

    if (!activo) {
      return res.status(404).json({ error: "Activo no registrado en ZF" });
    }

    res.json(activo);
  } catch (error) {
    console.error('Error en getActivoById:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// 3. CREAR NUEVO ACTIVO
// ==========================================
const crearActivo = async (req, res) => {
  try {
    const datos = req.body;
    
    const qrGenerado = datos.qr_codigo || crypto.randomUUID(); 
    const idResponsable = req.usuario_token ? req.usuario_token.id : 1; 

    // 🛡️ Escudo de fechas en la creación
    if (!datos.fecha_compra || datos.fecha_compra.trim() === "") {
      datos.fecha_compra = null; 
    } else {
      datos.fecha_compra = new Date(datos.fecha_compra);
    }

    // refactor: preparar arreglo de IDs de gerentes
    let gerentesIds = [idResponsable]; 
    
    if (datos.gerentes_ids && Array.isArray(datos.gerentes_ids)) {
        gerentesIds = datos.gerentes_ids.map(id => parseInt(id));
    } 
    // Si el front manda el campo viejo (Compatibilidad temporal)
    else if (datos.id_gerente_responsable) {
        gerentesIds = [parseInt(datos.id_gerente_responsable)];
    }

    // Limpiamos los datos viejos para que Prisma no crashee
    delete datos.id_gerente_responsable;
    delete datos.gerentes_ids;

    const nuevoActivo = await prisma.activos.create({
      data: {
        ...datos,
        qr_codigo: qrGenerado,
        id_estado_maquina: parseInt(datos.id_estado_maquina) || 1,
        cantidad_actual: parseInt(datos.cantidad_inicial) || 1,
        // 🚨 REFACTOR: Creación anidada en la tabla intermedia 'activos_responsables'
        responsables: {
          create: gerentesIds.map(id => ({ id_usuario: id }))
        }
      }
    });

    res.status(201).json({
      status: "success",
      mensaje: "Activo registrado correctamente",
      activo: nuevoActivo
    });
  } catch (error) {
    console.error("Error al crear activo:", error);
    if (error.code === 'P2002') {
        return res.status(400).json({ error: "El número de serie, tag o QR ya existen en el sistema." });
    }
    res.status(500).json({ error: "Error interno al registrar el activo" });
  }
};

// ==========================================
// 4. ACTUALIZAR ACTIVO
// ==========================================
const actualizarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosNuevos = req.body;

    // 🛡️ Escudo de fechas en la actualización
    if (datosNuevos.fecha_compra !== undefined) {
      if (!datosNuevos.fecha_compra || datosNuevos.fecha_compra.trim() === "") {
        datosNuevos.fecha_compra = null;
      } else {
        datosNuevos.fecha_compra = new Date(datosNuevos.fecha_compra);
      }
    }
    delete datosNuevos.id_gerente_responsable; // evita crasheo de prisma
    const activoActualizado = await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: datosNuevos 
    });

    res.status(200).json({ status: "success", data: activoActualizado });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(400).json({ error: "No se pudo actualizar el activo" });
  }
};

// ==========================================
// 5. DAR DE BAJA
// ==========================================
const darDeBajaActivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: { id_estado_maquina: 4 } 
    });

    res.status(200).json({ status: "success", mensaje: "Activo dado de baja" });
  } catch (error) {
    console.error('Error en dar de baja:', error);
    res.status(400).json({ error: "No se pudo dar de baja el activo" });
  }
};

// ==========================================
// 6. TRAZABILIDAD (Historial Completo)
// ==========================================
const getTrazabilidadActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const idNumerico = parseInt(id);

    const activo = await prisma.activos.findFirst({
      where: {
        OR: [
          { id_activo: isNaN(idNumerico) ? undefined : idNumerico },
          { qr_codigo: id }
        ]
      }
    });

    if (!activo) return res.status(404).json({ error: "Activo no encontrado" });

    const idActivoReal = activo.id_activo;
    let lineaDeTiempo = [];

    lineaDeTiempo.push({
      tipo_evento: 'ADQUISICIÓN',
      descripcion: 'Alta inicial en el sistema ZF Assets.',
      fecha: activo.fecha_compra || new Date() 
    });

    const solicitudes = await prisma.solicitudes.findMany({
      where: { id_activo: idActivoReal },
      include: { solicitante: { select: { nombre_completo: true } } },
      orderBy: { fecha_creacion: 'desc' }
    });

    solicitudes.forEach(s => {
      lineaDeTiempo.push({
        tipo_evento: `SOLICITUD: ${s.estatus_general.toUpperCase()}`,
        descripcion: `Solicitado por ${s.solicitante?.nombre_completo}. Destino: ${s.tipo_salida}`,
        fecha: s.fecha_creacion
      });
    });

    const mantenimientos = await prisma.mantenimientos_incidencias.findMany({
      where: { id_activo: idActivoReal },
      orderBy: { fecha_reporte: 'desc' }
    });
    
    mantenimientos.forEach(m => {
      lineaDeTiempo.push({
        tipo_evento: 'MANTENIMIENTO / INCIDENCIA',
        descripcion: `${m.tipo_mantenimiento}: ${m.descripcion}. Estatus: ${m.estatus_reparacion}`,
        fecha: m.fecha_reporte
      });
    });

    lineaDeTiempo.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.status(200).json({
      id_activo: idActivoReal,
      nombre: activo.nombre_maquina,
      serial: activo.numero_serie,
      historial: lineaDeTiempo
    });

  } catch (error) {
    console.error('Error en trazabilidad:', error);
    res.status(500).json({ error: "Error al generar la trazabilidad" });
  }
};

module.exports = {
  getActivos,
  getActivoById,
  crearActivo,
  actualizarActivo,
  darDeBajaActivo,
  getTrazabilidadActivo
};