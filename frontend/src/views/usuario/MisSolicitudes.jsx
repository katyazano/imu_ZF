import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, Package, X } from 'lucide-react';
import Navbar from '../../components/Navbar';

const MisSolicitudes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; // Leemos la búsqueda del Navbar

  const [filtro, setFiltro] = useState('Pendiente');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMisSolicitudes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${baseUrl}/solicitudes/mis`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al obtener el historial');
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMisSolicitudes();
  }, []);

  // FILTRADO: Ahora considera el estado Y la búsqueda del Navbar
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideFiltro = s.estatus_general === filtro;
    const coincideBusqueda = 
      s.activo?.nombre_maquina?.toLowerCase().includes(query.toLowerCase()) || 
      s.id_solicitud.toString().includes(query);
    
    return coincideFiltro && coincideBusqueda;
  });

  const getStatusStyles = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'text-green-600 bg-green-50 border-green-100';
      case 'Rechazada': return 'text-red-600 bg-red-50 border-red-100';
      case 'Cancelada': return 'text-gray-400 bg-gray-50 border-gray-200';
      default: return 'text-[#0070BC] bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="px-6 mt-10">
        <button 
          onClick={() => navigate('/categorias')} // Volver a categorías
          className="p-2 bg-gray-50 rounded-full text-[#0070BC] mb-6 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
          Mis <br /> <span className="text-[#0070BC]">Solicitudes</span>
        </h1>
      </header>

      {/* --- INDICADOR DE BÚSQUEDA ACTIVA --- */}
      {query && (
        <div className="mx-6 mt-6 flex items-center justify-between bg-blue-50/50 border border-blue-100 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#0070BC] rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-widest">
              Mostrando: <span className="italic text-gray-600">"{query}"</span>
            </p>
          </div>
          <button 
            onClick={() => navigate('/mis-solicitudes')} // Limpia la URL
            className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl shadow-sm text-[9px] font-black text-red-500 uppercase hover:bg-red-50 transition-colors"
          >
            <X size={12} /> Limpiar
          </button>
        </div>
      )}

      <div className="flex gap-2 px-6 mt-6 overflow-x-auto no-scrollbar pb-2">
        {['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'].map((f) => (
          <button 
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
              filtro === f 
                ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-xl shadow-blue-100' 
                : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
            }`}
          >
            {f}s
          </button>
        ))}
      </div>

      <main className="px-6 mt-6 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando...</p>
          </div>
        ) : solicitudesFiltradas.length > 0 ? (
          solicitudesFiltradas.map((s) => (
            <div 
              key={s.id_solicitud} 
              onClick={() => navigate(`/solicitud/${s.id_solicitud}`)}
              className="bg-white border-2 border-gray-50 rounded-[35px] p-6 shadow-sm active:scale-[0.98] transition-all cursor-pointer group hover:border-blue-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="max-w-[65%]">
                  <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-tighter mb-1">Folio #{s.id_solicitud}</p>
                  <h3 className="text-sm font-black text-gray-800 uppercase italic leading-tight group-hover:text-[#0070BC] transition-colors line-clamp-2">
                    {s.activo?.nombre_maquina || 'Equipo sin nombre'}
                  </h3>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(s.estatus_general)}`}>
                  {s.estatus_general}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-[9px] font-bold uppercase">
                    Salida: {new Date(s.fecha_salida_programada).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0070BC] group-hover:text-white transition-all">
                   <ArrowLeft size={16} className="rotate-180" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
            <Package size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
              No hay coincidencias para <br /> "{query || filtro}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MisSolicitudes;