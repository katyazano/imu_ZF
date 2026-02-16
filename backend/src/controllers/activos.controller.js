const activosService = require('../services/activos.service');

/**
 * Controlador para endpoints de Activos.
 * Maneja las respuestas HTTP y el manejo de errores básicos.
 */

const getActivos = async (req, res) => {
  try {
    const activos = await activosService.getAll();
    res.status(200).json({
      success: true,
      count: activos.length,
      data: activos
    });
  } catch (error) {
    console.error('[ActivosController] Error al obtener activos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al recuperar los activos.' 
    });
  }
};

const getActivoById = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await activosService.getById(id);
    
    if (!activo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activo no encontrado.' 
      });
    }

    res.status(200).json({ success: true, data: activo });
  } catch (error) {
    console.error('[ActivosController] Error al buscar activo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

const createActivo = async (req, res) => {
  try {
    // Se asume que el body ya pasó por validaciones de middleware (pendiente de implementar)
    const nuevoActivo = await activosService.create(req.body);
    res.status(201).json({ success: true, data: nuevoActivo });
  } catch (error) {
    console.error('[ActivosController] Error al crear activo:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error al crear el activo. Verifique los datos enviados.' 
    });
  }
};

module.exports = { getActivos, getActivoById, createActivo };