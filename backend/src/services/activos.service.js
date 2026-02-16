const prisma = require('./prisma');

/**
 * Servicio para la gestión de activos fijos.
 * Maneja la interacción directa con la base de datos a través de Prisma ORM.
 */

/**
 * Obtiene todos los activos registrados incluyendo relaciones clave.
 * @returns {Promise<Array>} Lista de activos con Categoría, Estado y Ubicación.
 */
const getAll = async () => {
  return await prisma.activos.findMany({
    include: {
      categorias_activos: true,
      estados_activos: true,
      ubicaciones: true
    },
    orderBy: { id_activo: 'desc' }
  });
};

/**
 * Busca un activo específico por su ID.
 * @param {number|string} id - Identificador único del activo.
 * @returns {Promise<Object|null>} El activo encontrado o null.
 */
const getById = async (id) => {
  return await prisma.activos.findUnique({
    where: { id_activo: parseInt(id) },
    include: {
      categorias_activos: true,
      estados_activos: true,
      ubicaciones: true
    }
  });
};

/**
 * Crea un nuevo activo en el sistema.
 * @param {Object} data - Objeto con los datos del activo (nombre, serie, IDs foráneos).
 * @returns {Promise<Object>} El activo creado.
 */
const create = async (data) => {
  return await prisma.activos.create({
    data: {
      nombre_maquina: data.nombre_maquina,
      numero_serie: data.numero_serie,
      id_categoria: data.id_categoria,
      id_estado: data.id_estado,
      id_ubicacion: data.id_ubicacion
      // TODO: Agregar validación de proyecto o adquisición si es necesario en el futuro
    }
  });
};

module.exports = { getAll, getById, create };