const prisma = require('../services/prisma');

// ==========================================
// 1. OBTENER FIRMAS (CON FILTRO SECUENCIAL PARA S&R)
// ==========================================
const getFirmasPendientes = async (req, res) => {
  try {
    const mi_id = req.usuario_token.id;
    const mi_rol = req.usuario_token.id_rol;

    // refactor: ahora también necesitamos saber los IDs de a quién suplimos
    const usuariosAQuienesSuplo = await prisma.usuarios.findMany({
      where: { id_suplente: mi_id, activo: true },
      select: { id_usuario: true, id_rol: true }
    });

    const roles_autorizados = [mi_rol, ...usuariosAQuienesSuplo.map(u => u.id_rol)];
    const ids_autorizados = [mi_id, ...usuariosAQuienesSuplo.map(u => u.id_usuario)];

    const firmas = await prisma.aprobaciones_firma.findMany({
      where: {
        estatus_firma: 'Pendiente',
        solicitud: {
          estatus_general: { notIn: ['Cancelada', 'Rechazada', 'En Tránsito'] } 
        },
        // refactor: filtro de seguridad
        OR: [
          // para Gerentes (Rol 3): Exigimos que sea exactamente para este usuario
          { 
            id_rol_esperado: 3, 
            id_usuario_esperado: { in: ids_autorizados } 
          },
          // para otros roles (Logística, EHS): Se basa en el rol general
          { 
            id_rol_esperado: { in: roles_autorizados, not: 3 } 
          }
        ]
      },
      include: {
        solicitud: {
          include: {
            activo: { select: { id_activo: true, nombre_maquina: true } },
            solicitante: { select: { nombre_completo: true } },
            destino: true,
            firmas: { select: { id_firma: true, estatus_firma: true } } 
          }
        }
      }
    });

    // 🚨 FILTRO INTELIGENTE: S&R (Rol 4) solo ve la solicitud si NADIE MÁS falta por firmar
    const firmasFiltradas = firmas.filter(f => {
      if (f.id_rol_esperado === 4) {
        const faltanOtrasFirmas = f.solicitud.firmas.some(
          otraFirma => otraFirma.id_firma !== f.id_firma && otraFirma.estatus_firma === 'Pendiente'
        );
        return !faltanOtrasFirmas; // Si faltan otras (ej. Gerente o EHS), se oculta para S&R
      }
      return true; // Para los demás roles (Gerentes, EHS), se muestra normal
    });

    const respuesta = firmasFiltradas.map(f => ({
      id_firma: f.id_firma,
      rol_esperado_id: f.id_rol_esperado, 
      solicitud: {
        id_solicitud: f.solicitud.id_solicitud,
        tipo_salida: f.solicitud.tipo_salida, 
        comentarios: f.solicitud.comentarios, 
        metodo_transporte: f.solicitud.metodo_transporte,
        fecha_salida_programada: f.solicitud.fecha_salida_programada,
        activo: { 
           id_activo: f.solicitud.activo?.id_activo,
           nombre_maquina: f.solicitud.activo?.nombre_maquina || "N/A" 
        },
        destino: f.solicitud.destino,
        solicitante: { nombre_completo: f.solicitud.solicitante?.nombre_completo || "Desconocido" }
      }
    }));

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en getFirmasPendientes:", error);
    res.status(500).json({ error: "Error al cargar la bandeja de pendientes" });
  }
};

// ==========================================
// 2. DICTAMINAR FIRMA (CON INTERCEPTOR DE ESTATUS DE MÁQUINA)
// ==========================================
const dictaminarFirma = async (req, res) => {
  try {
    const id_firma = parseInt(req.params.id_firma);
    const { estatus_firma, comentarios } = req.body;
    
    const mi_id = req.usuario_token.id;
    const mi_rol = req.usuario_token.id_rol;

    const firmaExistente = await prisma.aprobaciones_firma.findUnique({
      where: { id_firma },
      include: { solicitud: true }
    });

    if (!firmaExistente) return res.status(404).json({ error: "Firma no encontrada" });

    // refactor: validación de permisos
    let tengoPermiso = false;

    if (mi_rol === 1) {
      tengoPermiso = true; // El Admin tiene llave maestra
    } else if (firmaExistente.id_rol_esperado === 3) {
      // Si es firma de Gerente, obligamos a que el ID coincida
      tengoPermiso = (firmaExistente.id_usuario_esperado === mi_id);
      
      if (!tengoPermiso) {
        // revisamos si suple a ESE gerente específico
        const supliendo = await prisma.usuarios.findFirst({
          where: { id_usuario: firmaExistente.id_usuario_esperado, id_suplente: mi_id, activo: true }
        });
        if (supliendo) tengoPermiso = true;
      }
    } else {
      // si es Logística o EHS, validamos por Rol General
      tengoPermiso = (firmaExistente.id_rol_esperado === mi_rol);
      
      if (!tengoPermiso) {
        const supliendo = await prisma.usuarios.findFirst({
          where: { id_rol: firmaExistente.id_rol_esperado, id_suplente: mi_id, activo: true }
        });
        if (supliendo) tengoPermiso = true;
      }
    }

    if (!tengoPermiso) {
      return res.status(403).json({ error: "Tu usuario no tiene permiso para aplicar esta firma específica." });
    }

    if (firmaExistente.solicitud.estatus_general === 'Cancelada' || firmaExistente.solicitud.estatus_general === 'Rechazada') {
      return res.status(400).json({ 
        error: `Operación denegada. Esta solicitud se encuentra ${firmaExistente.solicitud.estatus_general}.` 
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      
      await tx.aprobaciones_firma.update({
        where: { id_firma },
        data: { 
          estatus_firma, 
          comentarios,
          fecha_firma: new Date(),
          id_usuario_firmo: mi_id 
        }
      });

      const todasLasFirmas = await tx.aprobaciones_firma.findMany({
        where: { id_solicitud: firmaExistente.id_solicitud }
      });

      let estatus_general = firmaExistente.solicitud.estatus_general;

      const algunaRechazada = todasLasFirmas.some(f => f.estatus_firma === 'Rechazada');
      const todasAprobadas = todasLasFirmas.every(f => f.estatus_firma === 'Aprobada');

      if (algunaRechazada) {
        estatus_general = 'Rechazada';
      } else if (todasAprobadas) {
        estatus_general = 'Aprobada'; 
      } else {
        estatus_general = 'Pendiente';
      }

      // 🚨 INTERCEPTADOR S&R: CAMBIAR MÁQUINA Y SOLICITUD AL SALIR 🚨
      if (firmaExistente.id_rol_esperado === 4 && estatus_firma === 'Aprobada') {
        
        // 1. Cambiamos el estado físico de la máquina a "Prestada" (ID 3)
        await tx.activos.update({
          where: { id_activo: firmaExistente.solicitud.id_activo },
          data: { id_estado_maquina: 3 }
        });

        // 2. Forzamos la solicitud a "En Tránsito"
        estatus_general = 'En Tránsito';
      }

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

// NUEVA FUNCIÓN: Trae el panel completo para Logística
const getPanelLogistica = async (req, res) => {
  try {
    // Buscamos TODAS las firmas asignadas a Logística (Rol 4)
    const firmas = await prisma.aprobaciones_firma.findMany({
      where: { id_rol_esperado: 4 },
      orderBy: { id_firma: 'desc' }, // Las más recientes primero
      include: {
        solicitud: {
          include: {
            // 👇 1. CORRECCIÓN: Agregamos qr_codigo para el escáner 👇
            activo: { select: { nombre_maquina: true, qr_codigo: true } }, 
            solicitante: { select: { nombre_completo: true } },
            destino: true,
            firmas: { select: { id_firma: true, estatus_firma: true } }
          }
        }
      }
    });

    // 👇 2. CORRECCIÓN: Filtro Inteligente para ocultar lo que aún no es turno de S&R 👇
    const firmasFiltradas = firmas.filter(f => {
      // Si la firma de Logística sigue "Pendiente", revisamos si faltan otros por firmar
      if (f.estatus_firma === 'Pendiente') {
        const faltanOtrasFirmas = f.solicitud.firmas.some(
          otraFirma => otraFirma.id_firma !== f.id_firma && otraFirma.estatus_firma === 'Pendiente'
        );
        // Si falta el Gerente o EHS, ocultamos la tarjeta para Logística
        return !faltanOtrasFirmas; 
      }
      // Si la firma ya fue Aprobada o Rechazada por Logística, la mostramos para su historial
      return true; 
    });

    const respuesta = firmasFiltradas.map(f => {
      // LÓGICA DE PESTAÑAS BASADA EN LA BASE DE DATOS REAL
      let estadoPestana = 'Pendientes de envío';
      
      if (f.estatus_firma === 'Aprobada' && f.solicitud.estatus_general === 'En Tránsito') {
        estadoPestana = 'En tránsito';
      } else if (f.estatus_firma === 'Rechazada' || f.solicitud.estatus_general === 'Rechazada') {
        estadoPestana = 'Devueltos';
      } else if (f.estatus_firma === 'Aprobada' && f.solicitud.estatus_general === 'Aprobada') {
        estadoPestana = 'En tránsito'; 
      }

      return {
        id_firma: f.id_firma,
        id_solicitud: f.solicitud.id_solicitud,
        folio: `SF-${f.solicitud.id_solicitud.toString().padStart(4, '0')}`,
        solicitante: f.solicitud.solicitante.nombre_completo,
        nombre_maquina: f.solicitud.activo.nombre_maquina,
        qr_codigo: f.solicitud.activo.qr_codigo, // 👈 Se manda al Front para el escáner
        destino: f.solicitud.destino?.nombre_institucion || 'Destino Interno',
        tipo_salida: f.solicitud.tipo_salida,
        metodo_transporte: f.solicitud.metodo_transporte || 'Por definir',
        fecha_salida: f.solicitud.fecha_salida_programada 
           ? new Date(f.solicitud.fecha_salida_programada).toLocaleDateString() 
           : 'Sin fecha',
        estado: estadoPestana 
      };
    });

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en getPanelLogistica:", error);
    res.status(500).json({ error: "Error al cargar el panel de logística" });
  }
};

module.exports = { getFirmasPendientes, dictaminarFirma, getPanelLogistica };