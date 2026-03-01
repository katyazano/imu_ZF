const prisma = require('../services/prisma');
const exceljs = require('exceljs');

// ==========================================
// 1. ENDPOINT: DASHBOARD TRAZABILIDAD (NUEVO ENFOQUE)
// ==========================================
// Mantenemos el nombre "getDashboardKPIs" para no romper tus rutas actuales, 
// pero ahora devuelve ubicaciones y retrasos reales.
const getDashboardKPIs = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 2, 3, 4, 6, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver el control de trazabilidad." });
    }

    const hoy = new Date();

    // 1. OBTENER SOLO LOS EQUIPOS QUE ESTÁN FÍSICAMENTE FUERA
    // Buscamos solicitudes aprobadas o en curso
    const solicitudesActivas = await prisma.solicitudes.findMany({
      where: {
        estatus_general: { in: ['Aprobada', 'En curso', 'Vencido'] }
      },
      include: {
        activo: { select: { nombre_maquina: true } },
        solicitante: { select: { nombre_completo: true } }
      }
    });

    let devolucionesVencidas = 0;
    let enTiempo = 0;
    let infractoresSet = new Set();
    let destinosMap = {};
    let listaVencidos = [];

    // 2. PROCESAMIENTO MATEMÁTICO SÚPER RÁPIDO
    solicitudesActivas.forEach(sol => {
      // Agrupar por destino (Usamos tipo_salida o id_destino según lo que guardes)
      const nombreDestino = sol.tipo_salida || 'Asignación General';
      destinosMap[nombreDestino] = (destinosMap[nombreDestino] || 0) + 1;

      // Evaluar Vencimientos
      if (sol.fecha_devolucion_programada && new Date(sol.fecha_devolucion_programada) < hoy) {
        devolucionesVencidas++;
        infractoresSet.add(sol.id_usuario_solicitante); // Evita contar a la misma persona 2 veces

        const diffTime = Math.abs(hoy - new Date(sol.fecha_devolucion_programada));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        listaVencidos.push({
          id: sol.id_solicitud,
          solicitante: sol.solicitante?.nombre_completo || 'Usuario Desconocido',
          equipo: sol.activo?.nombre_maquina || 'Equipo sin nombre',
          destino: nombreDestino,
          dias_retraso: diffDays
        });
      } else {
        enTiempo++;
      }
    });

    // 3. ORDENAR DATOS (Los más atrasados hasta arriba)
    listaVencidos.sort((a, b) => b.dias_retraso - a.dias_retraso);

    const equiposPorDestino = Object.keys(destinosMap).map(key => ({
      name: key,
      cantidad: destinosMap[key]
    })).sort((a, b) => b.cantidad - a.cantidad);

    // 4. ENVIAR LA ESTRUCTURA EXACTA QUE ESPERA REACT
    res.json({
      kpis: {
        equipos_fuera: solicitudesActivas.length,
        devoluciones_vencidas: devolucionesVencidas,
        usuarios_infractores: infractoresSet.size
      },
      estatus: {
        en_tiempo: enTiempo,
        vencidos: devolucionesVencidas
      },
      equipos_por_destino: equiposPorDestino,
      lista_vencidos: listaVencidos
    });

  } catch (error) {
    console.error('Error en getDashboardKPIs:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error interno al calcular la trazabilidad' });
  }
};

// ==========================================
// 2. ENDPOINT: EQUIPOS VENCIDOS
// ==========================================
const getVencidos = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver los vencidos." });
    }

    const hoy = new Date();

    const solicitudesVencidas = await prisma.solicitudes.findMany({
      where: {
        estatus_general: { in: ['Aprobada', 'En curso'] }, 
        fecha_devolucion_programada: { lt: hoy } 
      },
      include: {
        activo: { select: { nombre_maquina: true } },
        solicitante: { select: { nombre_completo: true } }
      }
    });

    const vencidos = solicitudesVencidas.map(sol => {
      const fechaDevolucion = new Date(sol.fecha_devolucion_programada);
      const diferenciaTiempo = Math.abs(hoy - fechaDevolucion);
      const dias_retraso = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)); 
      
      return {
        id_solicitud: sol.id_solicitud,
        activo: { nombre_maquina: sol.activo.nombre_maquina },
        infractor: { nombre_completo: sol.solicitante.nombre_completo },
        dias_retraso: dias_retraso
      };
    });

    res.json(vencidos);

  } catch (error) {
    console.error('Error en getVencidos:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al buscar equipos vencidos' });
  }
};

// ==========================================
// 3. ENDPOINT: HISTORIAL DE ALERTAS
// ==========================================
const getAlertas = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "Solo Auditores y Admins pueden ver el registro de alertas." });
    }

    const alertas = await prisma.registro_alertas_retrasos.findMany({
      include: {
        infractor: { select: { nombre_completo: true } }
      },
      orderBy: { fecha_envio: 'desc' }
    });

    const resultado = alertas.map(alerta => ({
      id_alerta: alerta.id_alerta,
      tipo_alerta: alerta.tipo_alerta,
      infractor: { nombre_completo: alerta.infractor.nombre_completo },
      fecha_envio: alerta.fecha_envio
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Error en getAlertas:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al obtener el historial de alertas' });
  }
};

// ==========================================
// 4. ENDPOINT: EXPORTAR REPORTES (EXCEL COMO GET)
// ==========================================
const exportarReportes = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para exportar reportes." });
    }

    const { fecha_inicio, fecha_fin } = req.query;

    const whereClause = {};
    if (fecha_inicio && fecha_fin){
      whereClause.fecha_creacion = {
        gte: new Date(`${fecha_inicio}T00:00:00.000Z`),
        lte: new Date(`${fecha_fin}T23:59:59.999Z`)
      };
    }
    
    const historial = await prisma.solicitudes.findMany({
      where: whereClause,
      include: {
        activo: { select: { nombre_maquina: true, numero_serie: true } },
        solicitante: { select: { nombre_completo: true } }
      }
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Préstamos');

    worksheet.columns = [
      { header: 'ID Solicitud', key: 'id_solicitud', width: 15 },
      { header: 'Solicitante', key: 'solicitante', width: 30 },
      { header: 'Máquina', key: 'maquina', width: 30 },
      { header: 'No. Serie', key: 'serie', width: 25 },
      { header: 'Fecha Programada', key: 'fecha', width: 20 },
      { header: 'Estatus', key: 'estatus', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };

    historial.forEach(registro => {
      let fechaFormateada = 'N/A';
      if (registro.fecha_devolucion_programada) {
        fechaFormateada = new Date(registro.fecha_devolucion_programada).toISOString().split('T')[0];
      }

      worksheet.addRow({
        id_solicitud: registro.id_solicitud,
        solicitante: registro.solicitante?.nombre_completo || 'Sin nombre',
        maquina: registro.activo?.nombre_maquina || 'Desconocida',
        serie: registro.activo?.numero_serie || 'N/A',
        fecha: fechaFormateada,
        estatus: registro.estatus_general
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Auditoria_ZF.xlsx"');
    
    return res.send(buffer);

  } catch (error) {
    console.error('Error en exportarReportes:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al generar el archivo Excel' });
  }
};

// ==========================================
// 5. ENDPOINT: VER HISTORIAL EN WEB (CON PAGINACIÓN)
// ==========================================
const getHistorialWeb = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver el historial." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [totalRegistros, historial] = await Promise.all([
      prisma.solicitudes.count(),
      prisma.solicitudes.findMany({
        skip: skip,
        take: limit,
        include: {
          activo: { select: { nombre_maquina: true, numero_serie: true } },
          solicitante: { select: { nombre_completo: true } }
        },
        orderBy: { fecha_creacion: 'desc' }
      })
    ]);

    const datosPantalla = historial.map(registro => ({
      id_solicitud: registro.id_solicitud,
      solicitante: registro.solicitante?.nombre_completo || 'Sin nombre',
      maquina: registro.activo?.nombre_maquina || 'Desconocida',
      serie: registro.activo?.numero_serie || 'N/A',
      fecha_programada: registro.fecha_devolucion_programada,
      estatus: registro.estatus_general
    }));

    res.json({
      metadata: {
        total_registros: totalRegistros,
        pagina_actual: page,
        total_paginas: Math.ceil(totalRegistros / limit)
      },
      data: datosPantalla
    });

  } catch (error) {
    console.error('Error en getHistorialWeb:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al obtener historial web' });
  }
};

// ==========================================
// 6. ENDPOINT: TRAZABILIDAD DE UN ACTIVO (HISTORIAL COMPLETO)
// ==========================================
const getTrazabilidadActivo = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 2, 3, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver la trazabilidad." });
    }

    const { id } = req.params;
    const idActivo = parseInt(id);

    if (isNaN(idActivo)) {
      return res.status(400).json({ error: "ID de activo inválido." });
    }

    const activoFisico = await prisma.activos.findUnique({
      where: { id_activo: idActivo },
      include: { estado_maquina: true }
    });

    if (!activoFisico) {
      return res.status(404).json({ error: "No se encontró el activo solicitado." });
    }

    const solicitudes = await prisma.solicitudes.findMany({
      where: { id_activo: idActivo },
      include: { solicitante: true },
    });

    const mantenimientos = await prisma.mantenimientos_incidencias.findMany({
      where: { id_activo: idActivo },
      include: { reportador: true }
    });

    let historialCrudo = [];

    if (activoFisico.fecha_compra) {
      historialCrudo.push({
        tipo: 'ADQUISICIÓN',
        detalle: `Registrado en sistema. Marca: ${activoFisico.marca || 'N/A'}`,
        fechaReal: new Date(activoFisico.fecha_compra)
      });
    }

    solicitudes.forEach(sol => {
      historialCrudo.push({
        tipo: `PRÉSTAMO - ${sol.estatus_general.toUpperCase()}`,
        detalle: `A: ${sol.solicitante?.nombre_completo || 'Usuario desconocido'}`,
        fechaReal: new Date(sol.fecha_creacion)
      });
    });

    mantenimientos.forEach(mant => {
      historialCrudo.push({
        tipo: `MANTENIMIENTO - ${mant.estatus_reparacion.toUpperCase()}`,
        detalle: mant.descripcion,
        fechaReal: new Date(mant.fecha_reporte)
      });
    });

    historialCrudo.sort((a, b) => b.fechaReal - a.fechaReal);

    const historialFinal = historialCrudo.map(item => {
      const dia = String(item.fechaReal.getDate()).padStart(2, '0');
      const mes = String(item.fechaReal.getMonth() + 1).padStart(2, '0');
      const anio = item.fechaReal.getFullYear();
      
      return {
        tipo: item.tipo,
        detalle: item.detalle,
        fecha: `${dia}/${mes}/${anio}`
      };
    });

    res.json({
      activo: {
        id_activo: activoFisico.id_activo,
        nombre_maquina: activoFisico.nombre_maquina,
        estado: activoFisico.estado_maquina?.nombre || 'Desconocido'
      },
      historial: historialFinal
    });

  } catch (error) {
    console.error('Error en getTrazabilidadActivo:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al obtener la trazabilidad del activo' });
  }
};

module.exports = {
  getDashboardKPIs,
  getVencidos,
  getAlertas,
  exportarReportes,
  getHistorialWeb,
  getTrazabilidadActivo
};