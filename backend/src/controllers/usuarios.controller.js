// src/controllers/usuarios.controller.js
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');

// =========================================================================
// 🔍 FUNCIONES DE LECTURA (USO PRINCIPAL DEL SISTEMA)
// =========================================================================

// GET /api/usuarios -> Lista de todos los empleados
const getUsuarios = async (req, res) => {
  try {
    const { incluir_inactivos } = req.query;
    const filtro = incluir_inactivos === 'true' ? {} : { activo: true };

    const usuarios = await prisma.usuarios.findMany({
      where: filtro,
      select: {
        id_usuario: true,
        nombre_completo: true,
        email: true,
        activo: true,
        rol: { select: { nombre: true } },
        disciplina: { select: { nombre: true } },
        usuario_suplente: { select: { nombre_completo: true } }
      },
      orderBy: { nombre_completo: 'asc' }
    });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error("🚨 ERROR PRISMA AL OBTENER USUARIOS:", error);
    res.status(500).json({ error: "Error al obtener la lista de usuarios." });
  }
};

// GET /api/usuarios/:id -> Expediente completo e historial del empleado
const getUsuarioDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(id) },
      select: {
        id_usuario: true,
        nombre_completo: true,
        email: true,
        activo: true,
        rol: { select: { nombre: true } },
        disciplina: { select: { nombre: true } },
        usuario_suplente: { select: { nombre_completo: true } },
        // Historial: Sus últimas 5 solicitudes
        solicitudes_solicitante: {
          select: { id_solicitud: true, estatus_general: true, fecha_creacion: true, activo: { select: { nombre_maquina: true } } },
          orderBy: { fecha_creacion: 'desc' },
          take: 5
        },
        // Historial: Sus últimas 5 firmas (Si es jefe)
        firmas_realizadas: {
          select: { id_firma: true, estatus_firma: true, fecha_firma: true, solicitud: { select: { id_solicitud: true } } },
          orderBy: { fecha_firma: 'desc' },
          take: 5
        }
      }
    });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });
    
    res.status(200).json(usuario);
  } catch (error) {
    console.error("🚨 ERROR PRISMA AL OBTENER DETALLE DE USUARIO:", error);
    res.status(500).json({ error: "Error al obtener el expediente del usuario." });
  }
};


// =========================================================================
// ⚠️ FUNCIONES DE MUTACIÓN (ADMINISTRACIÓN / SINCRONIZACIÓN EXTERNA)
// NOTA: Si los usuarios se importan desde la base de datos de la empresa, 
// estos endpoints serán de uso exclusivo del Administrador o se desactivarán.
// =========================================================================

// POST /api/usuarios -> ⚠️ [FUNCIÓN DE MUTACIÓN] Dar de alta empleado
const crearUsuario = async (req, res) => {
  try {
    const { nombre_completo, email, password, id_rol, id_disciplina, id_suplente } = req.body;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const data = {
      nombre_completo,
      email,
      password_hash,
      rol: { connect: { id_rol: parseInt(id_rol) } },
      disciplina: { connect: { id_disciplina: parseInt(id_disciplina) } }
    };

    if (id_suplente) data.usuario_suplente = { connect: { id_usuario: parseInt(id_suplente) } };

    const nuevoUsuario = await prisma.usuarios.create({ data });
    res.status(201).json({ status: "success", id_usuario: nuevoUsuario.id_usuario });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: "El correo ya está registrado." });
    res.status(500).json({ error: "Error al crear el usuario." });
  }
};

// PATCH /api/usuarios/:id -> ⚠️ [FUNCIÓN DE MUTACIÓN] Editar empleado / Suplente
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, id_rol, id_disciplina, id_suplente, activo } = req.body;

    const dataToUpdate = {};
    if (nombre_completo) dataToUpdate.nombre_completo = nombre_completo;
    if (activo !== undefined) dataToUpdate.activo = activo;
    if (id_rol) dataToUpdate.rol = { connect: { id_rol: parseInt(id_rol) } };
    if (id_disciplina) dataToUpdate.disciplina = { connect: { id_disciplina: parseInt(id_disciplina) } };
    
    if (id_suplente !== undefined) {
      if (id_suplente === null) dataToUpdate.usuario_suplente = { disconnect: true };
      else dataToUpdate.usuario_suplente = { connect: { id_usuario: parseInt(id_suplente) } };
    }

    await prisma.usuarios.update({ where: { id_usuario: parseInt(id) }, data: dataToUpdate });
    res.status(200).json({ status: "success", mensaje: "Usuario actualizado." });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario." });
  }
};

// DELETE /api/usuarios/:id -> ⚠️ [FUNCIÓN DE MUTACIÓN] Baja Lógica
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.usuarios.update({
      where: { id_usuario: parseInt(id) },
      data: { activo: false } 
    });
    res.status(200).json({ status: "success", mensaje: "Usuario dado de baja (Inactivo)." });
  } catch (error) {
    res.status(500).json({ error: "Error al dar de baja al usuario." });
  }
};

module.exports = { getUsuarios, getUsuarioDetalle, crearUsuario, actualizarUsuario, eliminarUsuario };