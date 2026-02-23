const prisma = require('../services/prisma');

const getFirmasPendientes = async (req, res) => {
  try {
    const mi_id = req.usuario_token.id;
    const mi_rol = req.usuario_token.id_rol;

    // 1. Buscamos si alguien me dejó como su suplente
    const usuariosAQuienesSuplo = await prisma.usuarios.findMany({
      where: { id_suplente: mi_id, activo: true },
      select: { id_rol: true }
    });

    // 2. Armamos la lista de roles que tengo derecho a firmar
    const roles_autorizados = [mi_rol]; 
    usuariosAQuienesSuplo.forEach(u => roles_autorizados.push(u.id_rol));

    // 3. Buscamos TODAS las firmas pendientes para esos roles
    const firmas = await prisma.aprobaciones_firma.findMany({
      where: {
        id_rol_esperado: { in: roles_autorizados }, // <-- MAGIA: Busca en un arreglo
        estatus_firma: 'Pendiente'
      },
      include: {
        solicitud: {
          include: {
            activo: { select: { nombre_maquina: true } },
            solicitante: { select: { nombre_completo: true } }
          }
        }
      }
    });

    const respuesta = firmas.map(f => ({
      id_firma: f.id_firma,
      rol_esperado_id: f.id_rol_esperado, // Útil para que el front sepa "con qué sombrero" firmas
      solicitud: {
        id_solicitud: f.solicitud.id_solicitud,
        activo: { nombre_maquina: f.solicitud.activo?.nombre_maquina || "N/A" },
        solicitante: { nombre_completo: f.solicitud.solicitante?.nombre_completo || "Desconocido" }
      }
    }));

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en getFirmasPendientes:", error);
    res.status(500).json({ error: "Error al cargar la bandeja de pendientes" });
  }
};

const dictaminarFirma = async (req, res) => {
  try {
    const id_firma = parseInt(req.params.id_firma);
    const { estatus_firma, comentarios } = req.body;
    
    const mi_id = req.usuario_token.id; // Extraemos MI ID
    const mi_rol = req.usuario_token.id_rol;

    const firmaExistente = await prisma.aprobaciones_firma.findUnique({
      where: { id_firma },
      include: { solicitud: true }
    });

    if (!firmaExistente) return res.status(404).json({ error: "Firma no encontrada" });

    // 2. SEGURIDAD INTELIGENTE
    // Tengo permiso si es mi rol, O SI SOY ADMIN (id_rol === 1)
    let tengoPermiso = (firmaExistente.id_rol_esperado === mi_rol || mi_rol === 1);

    // Si no es mi rol natural, checo si soy suplente de alguien con ese rol
    if (!tengoPermiso) {
      const supliendoA = await prisma.usuarios.findFirst({
        where: { id_suplente: mi_id, id_rol: firmaExistente.id_rol_esperado, activo: true }
      });
      if (supliendoA) tengoPermiso = true;
    }

    if (!tengoPermiso) {
      return res.status(403).json({ error: "Tu rol no tiene permiso para aplicar esta firma." });
    }

    // ==========================================
    // NUEVO CANDADO: Evitar firmar solicitudes "muertas"
    // ==========================================
    if (firmaExistente.solicitud.estatus_general === 'Cancelada' || firmaExistente.solicitud.estatus_general === 'Rechazada') {
      return res.status(400).json({ 
        error: `Operación denegada. Esta solicitud se encuentra ${firmaExistente.solicitud.estatus_general}.` 
      });
    }

    // 3. PROCESO DE DICTAMEN (Transacción)
    const resultado = await prisma.$transaction(async (tx) => {
      
      // A) Actualizamos la firma y REGISTRAMOS QUIÉN FIRMÓ 🕵️‍♀️
      const firmaActualizada = await tx.aprobaciones_firma.update({
        where: { id_firma },
        data: { 
          estatus_firma, 
          comentarios,
          fecha_firma: new Date(),
          id_usuario_firmo: mi_id // <-- CRÍTICO PARA AUDITORÍA
        }
      });

      let estatus_general = firmaExistente.solicitud.estatus_general;

      // B) Lógica de Negocio: Si rechazan una, se rechaza toda la solicitud
      if (estatus_firma === 'Rechazada') {
        estatus_general = 'Rechazada';
      } else {
        // C) Si aprueban, checamos si faltan más firmas por aprobar
        const firmasRestantes = await tx.aprobaciones_firma.count({
          where: {
            id_solicitud: firmaExistente.id_solicitud,
            estatus_firma: 'Pendiente',
            id_firma: { not: id_firma } // Excluimos la que estamos firmando ahorita
          }
        });

        // Si ya no hay pendientes, la solicitud completa pasa a 'Aprobada'
        if (firmasRestantes === 0) {
          estatus_general = 'Aprobada';
        }
      }

      // D) Actualizamos el estatus general de la solicitud si hubo cambios
      const solicitudActualizada = await tx.solicitudes.update({
        where: { id_solicitud: firmaExistente.id_solicitud },
        data: { estatus_general }
      });

      return solicitudActualizada.estatus_general;
    });

    res.json({ status: "success", estatus_general_solicitud: resultado });

  } catch (error) {
    console.error("Error al dictaminar:", error);
    res.status(500).json({ error: "Error al procesar el dictamen de la firma" });
  }
};


module.exports = { getFirmasPendientes, dictaminarFirma };