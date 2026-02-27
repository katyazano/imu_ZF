const prisma = require('../services/prisma');
const crypto = require('crypto');

// 1. OBTENER TODOS LOS ACTIVOS (Con filtros)
const getActivos = async (req, res) => {
  try {
    const { id_categoria, id_estado_maquina } = req.query;
    
    const whereClause = {};
    if (id_categoria) whereClause.id_categoria = parseInt(id_categoria);
    if (id_estado_maquina) whereClause.id_estado_maquina = parseInt(id_estado_maquina);

    const listaActivos = await prisma.activos.findMany({
      where: whereClause,
      include: { 
        categoria: true, 
        estado_maquina: true,
        disciplina: true
      } 
    });

    res.status(200).json(listaActivos);
  } catch (error) {
    console.error('Error en getActivos:', error);
    res.status(500).json({ error: "Hubo un error al consultar los activos" });
  }
};

// 2. OBTENER UN ACTIVO POR ID O QR (El "Controlador Inteligente")
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
        gerente: { select: { nombre_completo: true } }
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

// 3. CREAR NUEVO ACTIVO
const crearActivo = async (req, res) => {
  try {
    const datos = req.body;
    const qrGenerado = crypto.randomUUID(); 

    const nuevoActivo = await prisma.activos.create({
      data: {
        ...datos,
        qr_codigo: qrGenerado,
        id_estado_maquina: datos.id_estado_maquina || 1 
      }
    });

    res.status(201).json({
      status: "success",
      mensaje: "Activo registrado y QR generado correctamente",
      activo: nuevoActivo
    });
  } catch (error) {
    console.error("Error al crear activo:", error);
    res.status(500).json({ error: "Error interno al registrar el activo" });
  }
};

// 4. ACTUALIZAR ACTIVO
const actualizarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosNuevos = req.body;

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

// 5. DAR DE BAJA
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

// 6. TRAZABILIDAD (Historial Completo) - AHORA INTELIGENTE 🧠
const getTrazabilidadActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const idNumerico = parseInt(id);

    // 1. Buscamos el activo por ID o por QR (Igual que en el detalle normal)
    const activo = await prisma.activos.findFirst({
      where: {
        OR: [
          { id_activo: isNaN(idNumerico) ? undefined : idNumerico },
          { qr_codigo: id }
        ]
      }
    });

    if (!activo) return res.status(404).json({ error: "Activo no encontrado" });

    // ¡IMPORTANTE! A partir de aquí, usamos el ID real numérico que sacamos de la BD
    const idActivoReal = activo.id_activo;

    let lineaDeTiempo = [];

    lineaDeTiempo.push({
      tipo_evento: 'ADQUISICIÓN',
      descripcion: 'Alta inicial en el sistema ZF Assets.',
      fecha: activo.fecha_compra || new Date() 
    });

    // 2. Buscamos solicitudes usando el ID real numérico
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

    // 3. Buscamos mantenimientos usando el ID real numérico
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

// ⚠️ EXPORTACIÓN CLÁSICA DE COMMONJS
module.exports = {
  getActivos,
  getActivoById,
  crearActivo,
  actualizarActivo,
  darDeBajaActivo,
  getTrazabilidadActivo
};