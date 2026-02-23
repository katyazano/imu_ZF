const { PrismaClient } = require('@prisma/client');
const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// ==========================================
// 1. ENDPOINT: DASHBOARD KPIs
// ==========================================
// Devuelve los totales matemáticos para las gráficas del Auditor
const getDashboardKPIs = async (req, res) => {
  try {
    // 1. Contar el total de activos registrados
    const total_activos = await prisma.activos.count();

    // 2. Contar cuántos están prestados actualmente
    const prestados_actualmente = await prisma.activos.count({
      where: {
        estado_maquina: { nombre: 'Prestada' }
      }
    });

    // 3. Uso por disciplina (Agrupamos activos por ID de disciplina)
    const activosPorDisciplina = await prisma.activos.groupBy({
      by: ['id_disciplina'],
      _count: { id_activo: true },
    });

    // Traemos el catálogo de áreas para mapear el ID al nombre real
    const disciplinas = await prisma.disciplinas_areas.findMany();
    
    const uso_por_disciplina = {};
    activosPorDisciplina.forEach(item => {
      const nombreArea = disciplinas.find(d => d.id_disciplina === item.id_disciplina)?.nombre || 'Desconocida';
      uso_por_disciplina[nombreArea] = item._count.id_activo;
    });

    res.json({
      total_activos,
      prestados_actualmente,
      uso_por_disciplina
    });

  } catch (error) {
    console.error('Error en getDashboardKPIs:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al calcular los KPIs' });
  }
};

// ==========================================
// 2. ENDPOINT: EQUIPOS VENCIDOS
// ==========================================
// Escanea solicitudes vencidas que no han sido devueltas a caseta 
const getVencidos = async (req, res) => {
  try {
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

module.exports = {
  getDashboardKPIs,
  getVencidos,
  getAlertas,
  exportarReportes,
  getHistorialWeb
};