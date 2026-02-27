import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, CheckCircle, XCircle, Loader2, Package } from 'lucide-react';
import Navbar from '../../components/Navbar';

const MisSolicitudes = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('Pendiente');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 1. CARGA DE DATOS REALES
  useEffect(() => {
    const fetchMisSolicitudes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/solicitudes/mis-solicitudes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error al cargar tus solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMisSolicitudes();
  }, []);

  // 2. LÓGICA DE FILTRADO Y BÚSQUEDA
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideFiltro = s.estatus_general === filtro;
    const coincideBusqueda = s.activo.nombre_maquina.toLowerCase().includes(busqueda.toLowerCase()) || 
                             s.id_solicitud.toString().includes(busqueda);
    return coincideFiltro && coincideBusqueda;
  });

  // 3. MAPEO DE ESTILOS POR ESTADO
  const getStatusStyles = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'text-green-600 bg-green-50 border-green-100';
      case 'Rechazada': return 'text-red-600 bg-red-50 border-red-100';
      case 'Cancelada': return 'text-gray-500 bg-gray-50 border-gray-200';
      default: return 'text-[#0070BC] bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-[#0070BC] active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="relative flex-1 ml-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID o activo..." 
              className="w-full bg-gray-50 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold outline-none border border-gray-100 focus:border-[#0070BC] transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Mis solicitudes</h1>
      </header>

      {/* Selectores de Filtro */}
      <div className="flex gap-2 px-6 mt-6 overflow-x-auto no-scrollbar">
        {['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'].map((f) => (
          <button 
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
              filtro === f ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
            }`}
          >
            {f}s
          </button>
        ))}
      </div>

      <main className="px-6 mt-8 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando historial...</p>
          </div>
        ) : solicitudesFiltradas.length > 0 ? (
          solicitudesFiltradas.map((s) => (
            <div 
              key={s.id_solicitud} 
              onClick={() => navigate(`/solicitud/${s.id_solicitud}`)}
              className="bg-white border-2 border-gray-50 rounded-[35px] p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-tighter mb-1">Folio #{s.id_solicitud}</p>
                  <h3 className="text-sm font-black text-gray-800 uppercase italic leading-tight group-hover:text-[#0070BC] transition-colors">
                    {s.activo.nombre_maquina}
                  </h3>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(s.estatus_general)}`}>
                  {s.estatus_general}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="text-[9px] font-bold uppercase">
                    Salida: {new Date(s.fecha_salida_programada).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-40">
            <Package size={48} className="mx-auto mb-4" />
            <p className="text-xs font-bold italic">No hay solicitudes en este estado.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MisSolicitudes;