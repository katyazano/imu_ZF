const prisma = require('../services/prisma');
const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. ENDPOINT: DASHBOARD KPIs (100% REAL Y DINÁMICO)
// ==========================================
const getDashboardKPIs = async (req, res) => {
  try {
    const id_rol = req.usuario_token.id_rol;
    if (![1, 2, 3, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver los KPIs." });
    }

    // ⏱️ 1. ATRAPAMOS EL FILTRO DE TIEMPO DESDE REACT
    const { periodo } = req.query; // 'Hoy', '7d', o '30d'
    let fechaLimite = new Date();
    
    if (periodo === 'Hoy') {
      fechaLimite.setHours(0, 0, 0, 0); // Desde las 00:00:00 de hoy
    } else if (periodo === '7d') {
      fechaLimite.setDate(fechaLimite.getDate() - 7); 
    } else if (periodo === '30d') {
      fechaLimite.setDate(fechaLimite.getDate() - 30); 
    } else {
      fechaLimite = new Date('2000-01-01'); // Todo
    }

    // --------------------------------------------------------
    // A. BLOQUE KPIs PRINCIPALES
    // --------------------------------------------------------
    const total_activos = await prisma.activos.count();
    const prestados_actualmente = await prisma.activos.count({
      where: { id_estado_maquina: 3 } 
    });
    const total_alertas = await prisma.registro_alertas_retrasos.count({
      where: { fecha_envio: { gte: fechaLimite } }
    });

    // --------------------------------------------------------
    // B. BLOQUE GRÁFICA: STOCK POR ALMACÉN
    // --------------------------------------------------------
    const activosPorDisciplina = await prisma.activos.groupBy({
      by: ['id_disciplina'],
      _count: { id_activo: true },
    });

    const disciplinas = await prisma.disciplinas_areas.findMany();
    
    const stock_almacen = activosPorDisciplina.map(item => {
      const nombreArea = disciplinas.find(d => d.id_disciplina === item.id_disciplina)?.nombre || 'Desconocida';
      return { name: nombreArea, stock: item._count.id_activo };
    });

    // --------------------------------------------------------
    // C. BLOQUE GRÁFICA: ESTADO GENERAL
    // --------------------------------------------------------
    const activosPorEstado = await prisma.activos.groupBy({
      by: ['id_estado_maquina'],
      _count: { id_activo: true }
    });

    const estados = await prisma.estados_maquina.findMany(); 
    
    const estado_general = activosPorEstado.map(item => {
      const nombreEstado = estados.find(e => e.id_estado_maquina === item.id_estado_maquina)?.nombre || 'DESCONOCIDO';
      return { name: nombreEstado.toUpperCase(), value: item._count.id_activo };
    });

    // --------------------------------------------------------
    // D. 🛠️ NUEVO: GRÁFICA DE MANTENIMIENTOS REAL
    // --------------------------------------------------------
    // Buscamos los mantenimientos reportados desde la fecha límite
    const mantenimientos = await prisma.mantenimientos_incidencias.findMany({
      where: { fecha_reporte: { gte: fechaLimite } },
      select: { fecha_reporte: true },
      orderBy: { fecha_reporte: 'asc' } // Orden cronológico
    });

    // Los agrupamos dependiendo del botón que presionaste
    const agrupado = {};
    mantenimientos.forEach(m => {
      const fecha = new Date(m.fecha_reporte);
      let clave = '';

      if (periodo === 'Hoy') {
        clave = `${fecha.getHours()}:00`; // Agrupar por hora (ej. "14:00")
      } else {
        // Agrupar por Día/Mes (ej. "24/02")
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        clave = `${dia}/${mes}`;
      }

      agrupado[clave] = (agrupado[clave] || 0) + 1;
    });

    // Lo convertimos al formato exacto que espera tu código de React
    // Nota: Seguimos usando la palabra 'month' como llave para no romper tu frontend
    let historial_mantenimientos = Object.keys(agrupado).map(key => ({
      month: key, 
      mant: agrupado[key]
    }));

    // Si no ha habido mantenimientos en ese periodo, mandamos un dato en ceros
    if (historial_mantenimientos.length === 0) {
      historial_mantenimientos = [{ month: 'Sin datos', mant: 0 }];
    }

    // --------------------------------------------------------
    // E. ENSAMBLAJE FINAL PARA REACT
    // --------------------------------------------------------
    res.json({
      kpis: {
        total: total_activos,
        prestados: prestados_actualmente,
        alertas: total_alertas
      },
      stock_almacen: stock_almacen,
      estado_general: estado_general,
      historial_mantenimientos: historial_mantenimientos // <-- ¡Datos vivos!
    });

  } catch (error) {
    console.error('Error en getDashboardKPIs:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error interno al calcular los KPIs' });
  }
};

// ==========================================
// 2. ENDPOINT: EQUIPOS VENCIDOS
// ==========================================
// Escanea solicitudes vencidas que no han sido devueltas a caseta 
const getVencidos = async (req, res) => {
  try {
    // Validación de rol: Solo Admin, Gerente, S&R y Auditor pueden ver estos KPIs
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { // Admin, Gerente, S&R, Auditor
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

    // Calculamos los días exactos de retraso
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
// Muestra el historial de quiénes han recibido más correos de infracción 
const getAlertas = async (req, res) => {
  try {
    // Validación de rol: Solo Admin y Auditor pueden ver el registro de alertas
    const id_rol = req.usuario_token.id_rol;
    if (![1, 7].includes(id_rol)) { // Admin, Auditor
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
    // Validación de rol: Solo Admin, Gerente, S&R y Auditor pueden exportar reportes
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { // Admin, Gerente, S&R, Auditor
      return res.status(403).json({ error: "No tienes permiso para exportar reportes." });
    }

    // 1. Ahora leemos las fechas desde la URL (query parameters) en lugar del body
    const { fecha_inicio, fecha_fin } = req.query;

    const whereClause = {};
    if (fecha_inicio && fecha_fin){
      // Forzamos el inicio y fin del día para que Prisma busque correctamente
      whereClause.fecha_creacion = {
        gte: new Date(`${fecha_inicio}T00:00:00.000Z`),
        lte: new Date(`${fecha_fin}T23:59:59.999Z`)
      };
    }
    
    // 2. Traemos los datos de la base de datos
    const historial = await prisma.solicitudes.findMany({
      where: whereClause,
      include: {
        activo: { select: { nombre_maquina: true, numero_serie: true } },
        solicitante: { select: { nombre_completo: true } }
      }
    });

    // 3. Armamos la estructura del Excel
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

    // Damos estilo azul marino corporativo a los encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };

    // 4. Llenamos las filas
    historial.forEach(registro => {
      // Blindaje: Si no hay fecha, ponemos 'N/A' en lugar de que el código explote
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

    // 5. Generamos el archivo en memoria (Buffer)
    const buffer = await workbook.xlsx.writeBuffer();

    // 6. Mandamos las cabeceras exactas para que el navegador sepa que es un Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Auditoria_ZF.xlsx"');
    
    // 7. Entregamos el archivo
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
    // Validación de rol: Solo Admin, Gerente, S&R y Auditor pueden ver el historial en web
    const id_rol = req.usuario_token.id_rol;
    if (![1, 3, 4, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver el historial." });
    }

    // 1. Leer en qué página estamos y cuántos registros queremos (Por defecto: página 1, de 10 en 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // 2. Calcular cuántos registros saltarnos
    const skip = (page - 1) * limit;

    // 3. Hacer 2 consultas al mismo tiempo: Contar el total y traer el pedazo de datos
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

    // 4. Mapear los datos
    const datosPantalla = historial.map(registro => ({
      id_solicitud: registro.id_solicitud,
      solicitante: registro.solicitante?.nombre_completo || 'Sin nombre',
      maquina: registro.activo?.nombre_maquina || 'Desconocida',
      serie: registro.activo?.numero_serie || 'N/A',
      fecha_programada: registro.fecha_devolucion_programada,
      estatus: registro.estatus_general
    }));

    // 5. Entregar la respuesta con la "metadata" para que React dibuje los botones de [Anterior] y [Siguiente]
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
    // Validación de rol: Admin (1), Gerente (2), Auditor (7)
    const id_rol = req.usuario_token.id_rol;
    if (![1, 2, 3, 7].includes(id_rol)) { 
      return res.status(403).json({ error: "No tienes permiso para ver la trazabilidad." });
    }

    const { id } = req.params;
    const idActivo = parseInt(id);

    if (isNaN(idActivo)) {
      return res.status(400).json({ error: "ID de activo inválido." });
    }

    // 1. Buscar los datos básicos del Activo
    const activoFisico = await prisma.activos.findUnique({
      where: { id_activo: idActivo },
      include: {
        estado_maquina: true
      }
    });

    if (!activoFisico) {
      return res.status(404).json({ error: "No se encontró el activo solicitado." });
    }

    // 2. Buscar todas las Solicitudes (Préstamos/Asignaciones)
    const solicitudes = await prisma.solicitudes.findMany({
      where: { id_activo: idActivo },
      include: { solicitante: true },
    });

    // 3. Buscar todos los Mantenimientos
    const mantenimientos = await prisma.mantenimientos_incidencias.findMany({
      where: { id_activo: idActivo },
      include: { reportador: true }
    });

    // 4. Construir la "Línea de Tiempo" (Historial unificado)
    let historialCrudo = [];

    // A. Registrar la fecha de compra/alta original si existe
    if (activoFisico.fecha_compra) {
      historialCrudo.push({
        tipo: 'ADQUISICIÓN',
        detalle: `Registrado en sistema. Marca: ${activoFisico.marca || 'N/A'}`,
        fechaReal: new Date(activoFisico.fecha_compra)
      });
    }

    // B. Mapear las solicitudes
    solicitudes.forEach(sol => {
      historialCrudo.push({
        tipo: `PRÉSTAMO - ${sol.estatus_general.toUpperCase()}`,
        detalle: `A: ${sol.solicitante?.nombre_completo || 'Usuario desconocido'}`,
        fechaReal: new Date(sol.fecha_creacion)
      });
    });

    // C. Mapear los mantenimientos
    mantenimientos.forEach(mant => {
      historialCrudo.push({
        tipo: `MANTENIMIENTO - ${mant.estatus_reparacion.toUpperCase()}`,
        detalle: mant.descripcion,
        fechaReal: new Date(mant.fecha_reporte)
      });
    });

    // 5. Ordenar todo por fecha (De lo más nuevo a lo más viejo)
    historialCrudo.sort((a, b) => b.fechaReal - a.fechaReal);

    // 6. Formatear la fecha a texto amigable para React (DD/MM/YYYY)
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

    // 7. Enviar la respuesta exacta que espera React
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