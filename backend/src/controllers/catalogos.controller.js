// src/controllers/catalogos.controller.js
const prisma = require('../services/prisma');

const getCatalogoPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Diccionario de seguridad: Mapea el texto de la URL con el modelo real de Prisma
    const modelosPermitidos = {
      'disciplinas': prisma.disciplinas_areas,
      'ubicaciones': prisma.ubicaciones_fisicas,
      'categorias': prisma.categorias_activos,
      'estados': prisma.estados_maquina,
      'tipos_compra': prisma.tipos_compra,
      'nacionalidades': prisma.tipos_nacionalidad,
      'destinos_externos': prisma.destinos_externos,
      'proyectos': prisma.centros_costo_proyectos,
      'roles': prisma.roles
    };

    const modeloSeleccionado = modelosPermitidos[tipo];

    if (!modeloSeleccionado) {
      return res.status(400).json({ 
        error: `El catálogo '${tipo}' no existe o no está permitido.` 
      });
    }

    // Prisma ejecuta la consulta en la tabla que haya coincidido
    const datos = await modeloSeleccionado.findMany();
    
    res.status(200).json(datos);
  } catch (error) {
    console.error(`Error al consultar catálogo ${req.params.tipo}:`, error);
    res.status(500).json({ error: "Hubo un error al obtener el catálogo" });
  }
};

const crearDestinoExterno = async (req, res) => {
  try {
    const { nombre_institucion, tipo, contacto_nombre, contacto_email, contacto_telefono } = req.body;

    const nuevoDestino = await prisma.destinos_externos.create({
      data: {
        nombre_institucion,
        tipo,
        contacto_nombre,
        contacto_email,
        contacto_telefono
      }
    });

    res.status(201).json({ status: "success", new_id_destino: nuevoDestino.id_destino });
  } catch (error) {
    console.error('Error al crear destino externo:', error);
    res.status(400).json({ error: "No se pudo crear el destino externo" });
  }
};

const actualizarDestinoExterno = async (req, res) => {
  try {
    const { id } = req.params;
    const { contacto_nombre, contacto_email, contacto_telefono } = req.body;

    await prisma.destinos_externos.update({
      where: { id_destino: parseInt(id) },
      data: {
        contacto_nombre,
        contacto_email,
        contacto_telefono
      }
    });

    res.status(200).json({ status: "success", destino_actualizado: true });
  } catch (error) {
    console.error('Error al actualizar destino externo:', error);
    res.status(400).json({ error: "No se pudo actualizar el destino" });
  }
};

module.exports = { getCatalogoPorTipo, crearDestinoExterno, actualizarDestinoExterno };