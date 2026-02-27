import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Loader2, Info } from 'lucide-react';
import Navbar from '../../components/Navbar';

const HistorialActivo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [filtro, setFiltro] = useState('Todos');
  const [historialOriginal, setHistorialOriginal] = useState([]);
  const [activoInfo, setActivoInfo] = useState({ nombre: 'Cargando...', serial: '' });
  const [loading, setLoading] = useState(true);

  // 1. OBTENER DATOS DEL BACKEND
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        // Reutilizamos la ruta "inteligente" de trazabilidad
        const response = await fetch(`${baseUrl}/activos/${id}/trazabilidad`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setActivoInfo({ nombre: data.nombre, serial: data.serial });
          setHistorialOriginal(data.historial || []);
        } else {
          console.error("No se pudo cargar el historial");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [id]);

  // 2. LÓGICA DE DICCIONARIO VISUAL Y FILTRADO
  // Analizamos el texto que viene de la BD para darle un estatus visual
  const getStatusInfo = (tipoEvento) => {
    const texto = (tipoEvento || '').toUpperCase();
    if (texto.includes('APROBADA') || texto.includes('DEVOLUCIÓN') || texto.includes('ALTA')) {
      return { estado: 'Aceptada', color: 'bg-green-50', icon: <CheckCircle size={20} className="text-green-500" /> };
    }
    if (texto.includes('RECHAZADA') || texto.includes('CANCELADA') || texto.includes('MANTENIMIENTO')) {
      return { estado: 'Rechazada', color: 'bg-orange-50', icon: <AlertTriangle size={20} className="text-orange-400" /> };
    }
    if (texto.includes('PENDIENTE')) {
      return { estado: 'Pendiente', color: 'bg-yellow-50', icon: <Clock size={20} className="text-yellow-500" /> };
    }
    return { estado: 'Informativo', color: 'bg-blue-50', icon: <Info size={20} className="text-blue-500" /> };
  };

  // 3. APLICAR EL FILTRO SELECCIONADO
  const historialFiltrado = historialOriginal.filter(item => {
    if (filtro === 'Todos') return true;
    const { estado } = getStatusInfo(item.tipo_evento);
    if (filtro === 'Aceptadas') return estado === 'Aceptada';
    if (filtro === 'Rechazadas') return estado === 'Rechazada';
    return true;
  });

  // 4. FORMATEADOR DE FECHAS
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Fecha desconocida';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="px-6 mt-8">
        <button onClick={() => navigate(-1)} className="text-[#0070BC] mb-4 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center italic uppercase tracking-tighter">Historial</h1>

        {/* Pestañas de Filtro */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 justify-center">
          {['Todos', 'Aceptadas', 'Rechazadas'].map(f => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all active:scale-95 ${
                filtro === f ? 'bg-[#0070BC] border-[#0070BC] text-white' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#0070BC]">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Consultando bitácora...</span>
          </div>
        ) : historialFiltrado.length > 0 ? (
          historialFiltrado.map((item, index) => {
            const ui = getStatusInfo(item.tipo_evento);
            
            return (
              <div key={index} className="border-2 border-gray-100 rounded-[30px] p-6 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className={`p-2 rounded-xl shrink-0 ${ui.color}`}>
                  {ui.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-widest leading-tight">
                      {item.tipo_evento}
                    </h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase text-right shrink-0">
                      {formatearFecha(item.fecha)}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 leading-relaxed mt-2">
                    {item.descripcion} <br />
                    <span className="text-[#0070BC] italic mt-1 block font-black uppercase tracking-tighter">
                      {activoInfo.nombre} {activoInfo.serial && `(S/N: ${activoInfo.serial})`}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[30px]">
            <p className="text-gray-400 font-bold italic text-sm">
              No hay registros para el filtro seleccionado.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistorialActivo;