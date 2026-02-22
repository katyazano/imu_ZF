// src/controllers/activos.controller.js
const prisma = require('../services/prisma');
const crypto = require('crypto'); // <-- 1. Importas la librería nativa de Node.js

const getActivos = async (req, res) => {
  try {
    // CORRECCIÓN: Cambiamos id_estado por id_estado_maquina
    const { id_categoria, id_estado_maquina } = req.query;
    
    const whereClause = {};
    if (id_categoria) whereClause.id_categoria = parseInt(id_categoria);
    if (id_estado_maquina) whereClause.id_estado_maquina = parseInt(id_estado_maquina);

    const listaActivos = await prisma.activos.findMany({
      where: whereClause,
      // CORRECCIÓN en include (nombres reales del schema actual)
      include: { 
        categoria: true, 
        estado_maquina: true 
      } 
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
    const datosDelFrontend = req.body;

    // 2. GENERACIÓN AUTOMÁTICA DEL QR (Crea un UUID único mundial)
    const qrGenerado = crypto.randomUUID(); 

    // 3. Guardamos en la base de datos
    const nuevoActivo = await prisma.activos.create({
      data: {
        ...datosDelFrontend,
        qr_codigo: qrGenerado, // <-- Le inyectamos el UUID generado
        id_estado_maquina: 1   // <-- 1 = "Operativa" por defecto (opcional, si no viene en el body)
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

const actualizarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const datosNuevos = req.body;

    const activoActualizado = await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: datosNuevos 
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
    
    // CORRECCIÓN: Usamos id_estado_maquina en lugar de id_estado
    await prisma.activos.update({
      where: { id_activo: parseInt(id) },
      data: { id_estado_maquina: 4 } // Asumiendo que 4 es el ID para "Dado de baja"
    });

    // CORRECCIÓN: Ajustamos el mensaje para que sea exactamente el que tu compañero documentó
    res.status(200).json({ status: "success", mensaje: "Activo dado de baja" });
  } catch (error) {
    console.error('Error en dar de baja:', error);
    res.status(400).json({ error: "No se pudo dar de baja el activo" });
  }
};

module.exports = { getActivos, getActivoPorId, crearActivo, actualizarActivo, darDeBajaActivo };