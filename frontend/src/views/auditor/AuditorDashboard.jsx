import React, { useState, useEffect } from 'react';
import { 
  FileText, MapPin, Clock, AlertTriangle, UserX,
  Loader2, AlertCircle, Download, ChevronRight, Package 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AuditorDashboard = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE CONTROL DE TRAZABILIDAD ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // KPIs enfocados en salidas y retrasos
  const [kpis, setKpis] = useState({ equiposFuera: 0, devolucionesVencidas: 0, usuariosInfractores: 0 });
  
  // Gráficos e Información
  const [dataDestinos, setDataDestinos] = useState([]); 
  const [dataEstatusSalidas, setDataEstatusSalidas] = useState([]); 
  const [listaVencidos, setListaVencidos] = useState([]); 

  useEffect(() => {
    const fetchTrazabilidadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // 🚀 CORRECCIÓN AQUÍ: Apunta a /auditor/dashboard/kpis para que coincida con tu backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auditor/dashboard/kpis`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar datos de trazabilidad');
        const data = await response.json();

        setKpis({
            equiposFuera: data.kpis?.equipos_fuera || 0,
            devolucionesVencidas: data.kpis?.devoluciones_vencidas || 0,
            usuariosInfractores: data.kpis?.usuarios_infractores || 0
        });

        setDataDestinos(data.equipos_por_destino || []);
        
        setDataEstatusSalidas([
            { name: 'En Tiempo', value: data.estatus?.en_tiempo || 0, color: '#28B4AD' },
            { name: 'Vencidos', value: data.estatus?.vencidos || 0, color: '#F87171' }
        ]);

        setListaVencidos(data.lista_vencidos || []);
        setError(null); // Limpiamos cualquier error previo

      } catch (err) {
        // 🚀 CORRECCIÓN AQUÍ: Restauramos el setError para que la pantalla de error funcione
        console.error("Error cargando el dashboard:", err);
        setError("Hubo un problema de conexión con el servidor. Verifica que esté en línea.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrazabilidadData();
  }, []);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auditor/reportes/exportar`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al generar el archivo Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Trazabilidad_ZF_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Error descargando el Excel:", error);
      alert("Hubo un problema al descargar el reporte Excel. Revisa tu conexión.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Header Azul ZF */}
        <div className="bg-[#0070BC] px-6 pt-10 pb-20 shadow-lg relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                Control de <br className="md:hidden" /> Trazabilidad
              </h1>
              <div className="bg-white/10 p-2.5 rounded-full text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                <MapPin size={22} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 relative z-30">
                <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Verificando ubicaciones...</p>
            </div>
        ) : error ? (
            <div className="mx-6 -mt-8 bg-red-50 border border-red-200 p-6 rounded-[30px] flex flex-col items-center text-center shadow-md relative z-30 max-w-7xl mx-auto">
                <AlertCircle size={40} className="text-red-400 mb-2" />
                <p className="text-red-500 font-bold text-sm">No se pudo cargar el control</p>
                <p className="text-red-400 text-xs mt-1">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-[#0070BC] text-xs font-black uppercase tracking-widest">Reintentar</button>
            </div>
        ) : (
            <main className="px-6 -mt-12 relative z-30 flex flex-col gap-6 pb-40 max-w-7xl mx-auto">
            
                {/* 🚨 KPIs CRÍTICOS DE CONTROL 🚨 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Equipos Fuera */}
                    <div onClick={() => navigate('/prestamos-activos')} className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-[#0070BC]" />
                            <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-widest">Equipos Fuera</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-gray-900 leading-none">{kpis.equiposFuera}</h3>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-[#0070BC] transition-transform" />
                        </div>
                    </div>
                    
                    {/* Vencidos (ALERTA ROJA) */}
                    <div onClick={() => navigate('/prestamos-activos?estatus=Vencido')} className="bg-red-50 p-5 rounded-[25px] shadow-sm border border-red-100 flex flex-col justify-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} className="text-red-600 animate-pulse" />
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Devoluciones Vencidas</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-red-600 leading-none">{kpis.devolucionesVencidas}</h3>
                            <ChevronRight size={24} className="text-red-300 group-hover:text-red-600 transition-transform" />
                        </div>
                    </div>

                    {/* Usuarios Infractores */}
                    <div className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <UserX size={16} className="text-orange-500" />
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Equipos con Retraso</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black text-gray-900 leading-none">{kpis.usuariosInfractores}</h3>
                        </div>
                    </div>
                </div>

                {/* 🛠️ BOTONES DE ACCIÓN (INVENTARIO Y REPORTE) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Botón 1: Ir a Inventario / Activos */}
                    <button 
                        onClick={() => navigate('/activos')} 
                        className="w-full bg-white border-2 border-gray-100 p-4 rounded-[25px] flex items-center justify-between transition-all shadow-sm group hover:border-[#0070BC] active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl transition-colors group-hover:bg-blue-100">
                                <Package size={24} className="text-[#0070BC]" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-sm text-gray-900 leading-none">Inventario de Activos</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Ver y gestionar todo el catálogo</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0070BC] transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Botón 2: Exportar Excel (El que ya tenías, ajustado) */}
                    <button 
                        onClick={handleExportExcel} 
                        disabled={isExporting} 
                        className={`w-full bg-white border-2 border-gray-100 p-4 rounded-[25px] flex items-center justify-between transition-all shadow-sm group ${isExporting ? 'opacity-70 cursor-wait' : 'hover:border-[#0070BC] active:scale-95'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`bg-blue-50 p-3 rounded-2xl transition-colors ${!isExporting && 'group-hover:bg-blue-100'}`}>
                                {isExporting ? <Loader2 size={24} className="text-[#0070BC] animate-spin" /> : <Download size={24} className="text-[#0070BC]" />}
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-sm text-gray-900 leading-none">{isExporting ? 'Generando Reporte...' : 'Descargar Reporte de Salidas'}</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Excel detallado con fechas y responsables</p>
                            </div>
                        </div>
                    </button>
                    
                </div>

                {/* 📊 SECCIÓN: ¿DÓNDE ESTÁN LOS EQUIPOS? */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Gráfica 1: Ubicaciones Exactas (Con nombres largos solucionado) */}
                    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-[#0070BC]"/> Destinos Actuales
                        </h4>
                        <div className="overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                            <ResponsiveContainer width="100%" height={Math.max(200, dataDestinos.length * 45)}>
                            <BarChart data={dataDestinos} layout="vertical" margin={{ left: 30, right: 30 }}>
                                <defs>
                                    <linearGradient id="colorDestino" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#0070BC" stopOpacity={0.7}/>
                                        <stop offset="100%" stopColor="#0070BC" stopOpacity={1}/>
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#6b7280'}} width={110} />
                                <Tooltip cursor={{fill: 'rgba(0,112,188,0.05)'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="cantidad" fill="url(#colorDestino)" radius={[0, 10, 10, 0]} barSize={16}>
                                    <LabelList dataKey="cantidad" position="right" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#0070BC' }} />
                                </Bar>
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfica 2: Estatus de los Préstamos */}
                    <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-gray-400"/> Estatus de Entregas
                        </h4>
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="60%" height={180}>
                                <PieChart>
                                <Pie data={dataEstatusSalidas} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {dataEstatusSalidas.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-4 ml-2">
                                {dataEstatusSalidas.map(e => (
                                <div key={e.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: e.color}}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{e.name}</span>
                                        <span className="text-xs font-bold text-gray-900">{e.value} Equipos</span>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* 🛑 MURO DE LA VERGÜENZA: SIEMPRE VISIBLE */}
                <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 mt-2">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} /> Requerir Devolución Inmediata
                        </h4>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${listaVencidos.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {listaVencidos.length} Casos
                        </span>
                    </div>
                    
                    {listaVencidos.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {listaVencidos.map((infractor) => (
                                <div key={infractor.id} onClick={() => navigate(`/solicitud/${infractor.id}`)} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-[20px] transition-colors cursor-pointer group border border-transparent hover:border-red-100 gap-4 md:gap-0">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            <UserX size={18} className="text-red-400 group-hover:text-red-600 transition-colors" />
                                        </div>
                                        <div>
                                            <h5 className="font-black text-sm text-gray-900 uppercase italic leading-tight">{infractor.solicitante}</h5>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1">{infractor.equipo} • <span className="text-gray-400">{infractor.destino}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end bg-red-100/50 md:bg-transparent px-4 py-2 md:p-0 rounded-xl">
                                        <span className="text-red-600 font-black text-lg leading-none">{infractor.dias_retraso}</span>
                                        <span className="text-[9px] md:text-[8px] font-black text-red-400 uppercase tracking-widest md:mt-1">Días Vencido</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Muestra esto si no hay nadie vencido
                        <div className="text-center py-10 bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                No hay equipos con retraso
                            </p>
                        </div>
                    )}
                </div>
            </main>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;