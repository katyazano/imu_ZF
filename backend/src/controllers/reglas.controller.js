// src/controllers/reglas.controller.js
const prisma = require('../services/prisma');

// GET /api/reglas -> Ver todas las reglas configuradas
const getReglas = async (req, res) => {
  try {
    const reglas = await prisma.reglas_aprobacion.findMany({
      include: {
        categoria: { select: { nombre: true } }
      }
    });
    res.status(200).json(reglas);
  } catch (error) {
    console.error("🚨 ERROR AL OBTENER REGLAS:", error);
    res.status(500).json({ error: "Error al obtener las reglas de aprobación." });
  }
};

// PATCH /api/reglas/:id_categoria -> Configurar regla para una categoría
const configurarRegla = async (req, res) => {
  try {
    const { id_categoria } = req.params;

    // 🛡️ Validación de seguridad: Si no hay body, detenemos la ejecución
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No se recibieron datos en el cuerpo de la petición." });
    }

    const { requiere_gerente, requiere_syr, requiere_ehs } = req.body;

    const regla = await prisma.reglas_aprobacion.upsert({
      where: { id_categoria: parseInt(id_categoria) },
      update: {
        requiere_gerente: requiere_gerente ?? true,
        requiere_syr: requiere_syr ?? false,
        requiere_ehs: requiere_ehs ?? false,
      },
      create: {
        id_categoria: parseInt(id_categoria),
        requiere_gerente: requiere_gerente ?? true,
        requiere_syr: requiere_syr ?? false,
        requiere_ehs: requiere_ehs ?? false,
      },
    });

    res.status(200).json({ status: "success", mensaje: "Configuración guardada.", regla });
  } catch (error) {
    console.error("🚨 ERROR AL CONFIGURAR REGLA:", error);
    res.status(500).json({ error: "No se pudo guardar la regla de aprobación." });
  }
};

// GET /api/reglas/:id_categoria -> Ver la configuración de una categoría específica
const getReglaPorCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;

    const regla = await prisma.reglas_aprobacion.findUnique({
      where: { id_categoria: parseInt(id_categoria) },
      include: {
        categoria: { select: { nombre: true } }
      }
    });

    // Si no existe una regla específica, devolvemos un objeto con los valores por defecto
    // Esto evita errores en el Frontend
    if (!regla) {
      return res.status(200).json({
        id_categoria: parseInt(id_categoria),
        requiere_gerente: true, // Valor por defecto sugerido
        requiere_syr: false,
        requiere_ehs: false,
        mensaje: "Usando valores por defecto (No hay regla personalizada aún)."
      });
    }

    res.status(200).json(regla);
  } catch (error) {
    console.error("🚨 ERROR AL OBTENER REGLA INDIVIDUAL:", error);
    res.status(500).json({ error: "Error al obtener la regla de la categoría." });
  }
};

module.exports = { getReglas, getReglaPorCategoria, configurarRegla };