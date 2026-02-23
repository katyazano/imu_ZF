// src/controllers/activos.controller.js
const prisma = require('../services/prisma'); // Importamos tu conexión real a Supabase

const getActivos = async (req, res) => {
  try {
    // Leemos posibles filtros en la URL (ej. ?id_categoria=2&id_estado=1)
    const { id_categoria, id_estado } = req.query;
    
    // Armamos la búsqueda dinámica
    const whereClause = {};
    if (id_categoria) whereClause.id_categoria = parseInt(id_categoria);
    if (id_estado) whereClause.id_estado = parseInt(id_estado);

    const listaActivos = await prisma.activos.findMany({
      where: whereClause,
      // Opcional: include trae los datos de las tablas relacionadas (JOINs automáticos)
      // include: { categorias_activos: true, estados_activos: true } 
    });

    res.status(200).json(listaActivos);
  } catch (error) {
    console.error('Error en getActivos:', error);
    res.status(500).json({ error: "Hubo un error al consultar los activos" });
  }
};

const getActivoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await prisma.activos.findUnique({
      where: { id_activo: parseInt(id) }
    });

    if (!activo) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    res.status(200).json(activo);
  } catch (error) {
    console.error('Error en getActivoPorId:', error);
    res.status(500).json({ error: "Hubo un error al buscar el activo" });
  }
};

const crearActivo = async (req, res) => {
  try {
    // Extraemos todo lo que React nos mandó en el Body
    const { numero_serie, nombre_maquina, id_categoria, id_ubicacion } = req.body;

    const nuevoActivo = await prisma.activos.create({
      data: {
        numero_serie,
        nombre_maquina,
        id_categoria: parseInt(id_categoria),
        id_ubicacion: parseInt(id_ubicacion),
        id_estado: 1 // Por defecto, al crearlo entra como 'DISPONIBLE' (1)
      }
    });

    res.status(201).json({ status: "success", new_id_activo: nuevoActivo.id_activo });
  } catch (error) {
    console.error('Error al crear activo:', error);
    res.status(400).json({ error: "Error al crear el registro. Verifica los datos." });
  }
};

const actualizarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosNuevos = req.body;

    const activoActualizado = await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: datosNuevos // Prisma es lo bastante inteligente para mapear esto
    });

    res.status(200).json({ status: "success", activo_actualizado: true, data: activoActualizado });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(400).json({ error: "No se pudo actualizar el activo" });
  }
};

const darDeBajaActivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Baja lógica: En lugar de usar prisma.activos.delete(), lo actualizamos
    await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: { id_estado: 4 } // Suponiendo que el ID 4 en tu tabla de estados es "DADO DE BAJA"
    });

    res.status(200).json({ status: "success", mensaje: "Activo dado de baja correctamente" });
  } catch (error) {
    console.error('Error en dar de baja:', error);
    res.status(400).json({ error: "No se pudo dar de baja el activo" });
  }
};

// ==========================================
// NUEVO ENDPOINT: TRAZABILIDAD (LÍNEA DE TIEMPO)
// ==========================================
const getTrazabilidadActivo = async (req, res) => {
  try {
    const idActivo = parseInt(req.params.id);

    // 1. Obtener los datos base del activo
    const activo = await prisma.activos.findUnique({
      where: { id_activo: idActivo }
    });

    if (!activo) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    // 2. Arreglo maestro donde meteremos TODOS los eventos
    let lineaDeTiempo = [];

    // A) EVENTO 1: ADQUISICIÓN (Suponiendo que tu tabla tiene fecha_creacion o similar)
    // Si tu campo de fecha de alta se llama distinto en Prisma, solo cámbialo aquí
    lineaDeTiempo.push({
      tipo_evento: 'ADQUISICIÓN',
      descripcion: 'Registro inicial en el sistema de inventario.',
      // Si no tienes un campo de fecha de creación, usamos una fecha por defecto o la actual para que no truene
      fecha: activo.fecha_creacion || activo.created_at || new Date('2024-01-01') 
    });

    // B) EVENTOS 2: HISTORIAL DE PRÉSTAMOS
    const prestamos = await prisma.solicitudes.findMany({
      where: { id_activo: idActivo },
      include: { solicitante: { select: { nombre_completo: true } } }
    });

    prestamos.forEach(p => {
      lineaDeTiempo.push({
        tipo_evento: p.estatus_general === 'En curso' ? 'PRÉSTAMO ACTUAL' : 'HISTORIAL DE PRÉSTAMO',
        descripcion: `Asignado a ${p.solicitante?.nombre_completo || 'Usuario Desconocido'} - Estatus: ${p.estatus_general}`,
        fecha: p.fecha_creacion 
      });
    });

    // C) EVENTOS 3: MANTENIMIENTOS 
    // Lo envolvemos en un try/catch interno por si tu tabla de mantenimientos aún no está conectada en Prisma
    try {
      const mantenimientos = await prisma.mantenimientos.findMany({
        where: { id_activo: idActivo }
      });
      
      mantenimientos.forEach(m => {
        lineaDeTiempo.push({
          tipo_evento: 'MANTENIMIENTO',
          descripcion: m.descripcion || m.tipo_mantenimiento || 'Revisión técnica programada',
          fecha: m.fecha_inicio || m.fecha_creacion // Ajusta al campo de fecha de tu tabla mantenimientos
        });
      });
    } catch (error) {
      console.log('Nota: No se pudo cargar mantenimientos o la tabla no existe aún.');
    }

    // 3. ORDENAR CRONOLÓGICAMENTE (Del más reciente al más antiguo)
    lineaDeTiempo.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // 4. Devolver la estructura perfecta para el frontend
    res.status(200).json({
      activo_id: idActivo,
      nombre_maquina: activo.nombre_maquina,
      numero_serie: activo.numero_serie,
      historial_trazabilidad: lineaDeTiempo
    });

  } catch (error) {
    console.error('Error en getTrazabilidadActivo:', error);
    res.status(500).json({ error: "Hubo un error al generar la trazabilidad del activo" });
  }
};

module.exports = { getActivos, getActivoPorId, crearActivo, actualizarActivo, darDeBajaActivo, getTrazabilidadActivo};