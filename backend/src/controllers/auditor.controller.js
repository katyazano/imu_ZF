const { PrismaClient } = require('@prisma/client');
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
// 4. ENDPOINT: EXPORTAR REPORTES (EXCEL/PDF)
// ==========================================
// Genera archivo con el historial (POST para recibir JSON seguro) 
const exportarReportes = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, id_disciplina } = req.body;

    console.log(`Generando reporte filtrado del ${fecha_inicio} al ${fecha_fin} para el área ${id_disciplina}`);
    
    // MOCK: Respuesta estática para que React pueda probar el botón
    res.json({ 
      status: "success",
      download_url: "https://api.zf-inventario.com/downloads/reporte_auditoria_123.xlsx" 
    });

  } catch (error) {
    console.error('Error en exportarReportes:', error);
    res.status(500).json({ status: 'error', mensaje: 'Error al generar el reporte' });
  }
};

module.exports = {
  getDashboardKPIs,
  getVencidos,
  getAlertas,
  exportarReportes
};