import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, TrendingUp, 
  Info, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// --- PALETA DE COLORES ZF ---
const COLORS = {
  activo: '#0070BC',
  mantenimiento: '#28B4AD',
  baja: '#E5E7EB',
  alerta: '#F87171'
};

const AuditorDashboard = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('7d');
  
  // --- ESTADOS DE DATOS REALES ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({ total: 0, prestamo: 0, alertas: 0 });
  const [dataStock, setDataStock] = useState([]);
  const [dataEstado, setDataEstado] = useState([]);
  const [dataMantenimiento, setDataMantenimiento] = useState([]);

  // --- CARGA DE DATOS DESDE EL BACKEND ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:4000/api/auditoria/dashboard/kpis?periodo=${periodo}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar datos del auditor');
        
        const data = await response.json();

        setKpis({
            total: data.kpis?.total || 0,
            prestamo: data.kpis?.prestados || 0,
            alertas: data.kpis?.alertas || 0
        });

        setDataStock(data.stock_almacen || []);
        
        const estadosConColor = (data.estado_general || []).map(estado => ({
            ...estado,
            color: estado.name === 'ACTIVO' ? COLORS.activo : 
                   estado.name === 'MANTENIMIENTO' ? COLORS.mantenimiento : 
                   COLORS.baja
        }));
        setDataEstado(estadosConColor);
        
        setDataMantenimiento(data.historial_mantenimientos || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [periodo]);

  // --- EXPORTACIÓN A EXCEL (Real, conectada al backend) ---
  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/auditoria/reportes/exportar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al generar el archivo Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Reporte_Auditoria_ZF.xlsx"; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error descargando el Excel:", error);
      alert("Hubo un problema al descargar el reporte Excel.");
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        
        {/* Header Azul ZF */}
        <div className="bg-[#0070BC] p-6 pt-10 pb-16 shadow-lg relative">
          {/* Header Azul ZF (Diseño arreglado para PC y Móvil) */}
        <div className="bg-[#0070BC] px-6 pt-8 pb-20 shadow-lg relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
            
            {/* Lado Izquierdo: Título */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                Auditor Dashboard
              </h1>
              {/* Icono Info solo visible en celulares */}
              <div className="md:hidden bg-white/10 p-2 rounded-full text-white border border-white/20">
                <Info size={20} />
              </div>
            </div>

            {/* Lado Derecho: Filtros compactos e Icono */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              
              {/* Filtros de Tiempo (Ahora con ancho máximo md:w-72 para no estirarse) */}
              <div className="flex w-full md:w-72 gap-1 bg-black/20 p-1.5 rounded-xl backdrop-blur-sm relative z-50">
                {['Hoy', '7d', '30d'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setPeriodo(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all duration-300 relative z-50 cursor-pointer ${
                      periodo === t ? 'bg-[#28B4AD] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Icono Info solo visible en PC */}
              <div className="hidden md:flex bg-white/10 p-2.5 rounded-full text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <Info size={22} />
              </div>

            </div>
          </div>
        </div>
        </div>

        {/* MANEJO DE ESTADOS: CARGA Y ERROR */}
        {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 relative z-10">
                <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sincronizando métricas...</p>
            </div>
        ) : error ? (
            <div className="mx-6 -mt-8 bg-red-50 border border-red-200 p-6 rounded-[30px] flex flex-col items-center text-center shadow-md relative z-10">
                <AlertCircle size={40} className="text-red-400 mb-2" />
                <p className="text-red-500 font-bold text-sm">No se pudo cargar el dashboard</p>
                <p className="text-red-400 text-xs mt-1">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-[#0070BC] text-xs font-black uppercase tracking-widest">Reintentar</button>
            </div>
        ) : (
            /* CONTENIDO DE GRÁFICOS REALES */
            <main className="px-6 -mt-12 relative z-10 flex flex-col gap-6 pb-40">
            
                {/* KPIs Interactivos (Drill-down) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div 
                        onClick={() => navigate('/activos')}
                        className="bg-white p-5 md:p-6 rounded-[25px] md:rounded-[35px] shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer hover:shadow-lg hover:border-[#0070BC] hover:-translate-y-1 transition-all group"
                    >
                        <p className="text-[10px] md:text-xs font-black text-[#0070BC] uppercase tracking-widest mb-2 group-hover:text-blue-700">Total Activos</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl md:text-5xl font-black text-gray-900 leading-none">{kpis.total}</h3>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-[#0070BC] group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    <div 
                        onClick={() => navigate('/prestamos-activos')}
                        className="bg-white p-5 md:p-6 rounded-[25px] md:rounded-[35px] shadow-sm border border-gray-100 border-b-4 border-b-[#28B4AD] flex flex-col justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                        <p className="text-[10px] md:text-xs font-black text-[#28B4AD] uppercase tracking-widest mb-2 group-hover:text-teal-600">En Préstamo</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl md:text-5xl font-black text-gray-900 leading-none">{kpis.prestamo}</h3>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-[#28B4AD] group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    <div 
                        onClick={() => navigate('/notificaciones')}
                        className="bg-white p-5 md:p-6 rounded-[25px] md:rounded-[35px] shadow-sm border border-gray-100 border-b-4 border-b-red-400 flex flex-col justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
                    >
                        <p className="text-[10px] md:text-xs font-black text-red-400 uppercase tracking-widest mb-2 group-hover:text-red-600">Alertas Mnt.</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl md:text-5xl font-black text-gray-900 leading-none">{kpis.alertas}</h3>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* IA INSIGHTS */}
                <div className="bg-gradient-to-br from-[#0070BC] to-[#28B4AD] p-6 rounded-[35px] shadow-xl text-white relative overflow-hidden group mt-2">
                    <Sparkles className="absolute right-[-10px] top-[-10px] text-white/20" size={100} />
                    <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={18} />
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">IA Insights</h4>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed opacity-95 italic">
                      "Funcion en desarrollo: Próximamente, esta sección mostrará insights generados por IA sobre patrones de mantenimiento, predicciones de fallas y recomendaciones para optimizar la gestión de activos."
                    </p>
                    </div>
                </div>

                {/* ACCIONES DE AUDITORÍA CONECTADO A EXCEL */}
                <div className="px-1 flex flex-col gap-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Acciones Rápidas</p>
                    <button 
                        onClick={handleExportExcel} 
                        className="w-full bg-white border-2 border-gray-100 p-5 rounded-[30px] flex items-center justify-between hover:border-red-400 transition-all shadow-sm active:scale-95 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-3 rounded-2xl group-hover:bg-red-200 transition-colors">
                                <FileText size={24} className="text-red-500" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-sm text-gray-900 leading-none">Generar Reporte</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Exportar historial (Excel)</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-red-500" />
                    </button>
                </div>

                {/* STOCK POR ALMACÉN */}
                {dataStock.length > 0 && (
                    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-2">
                            Stock por almacén
                        </h4>
                        <ResponsiveContainer width="100%" height={dataStock.length * 50}>
                        <BarChart data={dataStock} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#9ca3af'}} width={70} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="stock" fill="#0070BC" radius={[0, 10, 10, 0]} barSize={12} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ESTADO GENERAL (Sin los botones extra) */}
                {dataEstado.length > 0 && (
                    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Estado Global</h4>
                        </div>
                        
                        <div className="flex items-center">
                        <ResponsiveContainer width="55%" height={150}>
                            <PieChart>
                            <Pie data={dataEstado} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                                {dataEstado.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '10px', fontSize: '12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-3 ml-2">
                            {dataEstado.map(e => (
                            <div key={e.name} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: e.color}}></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">{e.name}</span>
                                    <span className="text-[10px] font-bold text-gray-800">{e.value} Und.</span>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                )}

                {/* HISTORIAL MANTENIMIENTO */}
                {dataMantenimiento.length > 0 && (
                    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Mantenimientos</h4>
                        <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={dataMantenimiento}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#9ca3af'}} />
                            <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                            <Line type="monotone" dataKey="mant" stroke="#28B4AD" strokeWidth={4} dot={{ r: 4, fill: '#28B4AD', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </main>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;