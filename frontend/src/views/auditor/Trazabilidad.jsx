import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, History, Package, User, 
  Settings, Truck, Info, CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const Trazabilidad = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- ESTADOS DINÁMICOS ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activoInfo, setActivoInfo] = useState(null);
  const [historialActivo, setHistorialActivo] = useState([]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchTrazabilidad = async () => {
      if (!id || id === 'undefined') {
        setLoading(false);
        setError("ID de activo no válido.");
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        const response = await fetch(`${baseUrl}/activos/${id}/trazabilidad`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('No se encontró el historial de este activo');
        
        const data = await response.json();
        
        // Guardamos la info basándonos en la estructura que manda tu backend
        setActivoInfo({
          id_activo: data.id_activo,
          nombre_maquina: data.nombre,
          numero_serie: data.serial
        });
        
        setHistorialActivo(data.historial || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrazabilidad();
  }, [id]);

  // --- DICCIONARIO VISUAL (Mapea el texto del backend a Iconos/Colores) ---
  const getEventUI = (tipoEvento) => {
    if (!tipoEvento) return { icon: <Info size={20} className="text-gray-400" />, color: 'border-gray-300', text: 'text-gray-500' };
    
    const tipo = tipoEvento.toUpperCase();
    
    if (tipo.includes('ADQUISICIÓN') || tipo.includes('ALTA')) {
      return { icon: <Package size={20} className="text-blue-500" />, color: 'border-blue-500', text: 'text-blue-500' };
    }
    if (tipo.includes('MANTENIMIENTO') || tipo.includes('INCIDENCIA')) {
      return { icon: <Settings size={20} className="text-orange-500" />, color: 'border-orange-500', text: 'text-orange-500' };
    }
    if (tipo.includes('SOLICITUD') || tipo.includes('PRÉSTAMO')) {
      return { icon: <User size={20} className="text-[#28B4AD]" />, color: 'border-[#28B4AD]', text: 'text-[#28B4AD]' };
    }
    if (tipo.includes('MOVIMIENTO') || tipo.includes('CASETA')) {
      return { icon: <Truck size={20} className="text-purple-500" />, color: 'border-purple-500', text: 'text-purple-500' };
    }
    if (tipo.includes('DEVOLUCIÓN')) {
      return { icon: <CheckCircle2 size={20} className="text-green-500" />, color: 'border-green-500', text: 'text-green-500' };
    }
    
    // Por defecto
    return { icon: <Info size={20} className="text-gray-400" />, color: 'border-gray-300', text: 'text-gray-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
      <Navbar />

      {/* --- HEADER --- */}
      <header className="px-6 mt-8 flex items-center justify-between relative">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-[#0070BC] font-bold active:scale-95 transition-transform z-10 hover:underline"
        >
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>

        <div className="absolute left-0 right-0 text-center pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-none uppercase italic tracking-tight">Trazabilidad</h1>
          <div className="w-12 h-1.5 bg-[#0070BC] mx-auto mt-1.5 rounded-full"></div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="px-6 mt-10 flex-1 relative z-10">
        
        {/* MANEJO DE ESTADOS (Loader y Errores) */}
        {loading ? (
           <div className="bg-white rounded-[35px] p-12 shadow-xl flex flex-col items-center justify-center mt-4">
              <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Reconstruyendo historial...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50 rounded-[35px] p-8 shadow-xl border border-red-100 text-center mt-4">
              <AlertTriangle className="text-red-500 mx-auto mb-3" size={40} />
              <p className="text-red-600 font-bold">{error}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-[#0070BC] font-black uppercase text-[10px] tracking-widest underline">Regresar</button>
           </div>
        ) : (
          <>
            {/* 📋 Card Informativa del Activo */}
            <div className="bg-white rounded-[35px] p-6 shadow-xl shadow-blue-900/5 mb-8 border border-blue-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">ACTIVO ID: {activoInfo?.id_activo || id}</h2>
                  <p className="text-sm font-bold text-gray-400 mt-2">{activoInfo?.nombre_maquina || 'Equipo sin nombre'}</p>
                </div>
                {/* Etiqueta decorativa ZF */}
                <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase italic bg-blue-50 text-blue-600">
                  S/N: {activoInfo?.numero_serie || 'N/A'}
                </span>
              </div>
            </div>

            {/* ⏱️ Línea de Tiempo */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                <History size={18} className="text-[#0070BC]" /> Historial completo
              </h3>

              <div className="relative">
                {historialActivo && historialActivo.length > 0 ? (
                  historialActivo.map((evento, index) => {
                    // Generamos el color y el icono del evento actual
                    const ui = getEventUI(evento.tipo_evento); 
                    
                    return (
                      <div key={index} className="flex gap-6 mb-10 last:mb-0 relative animate-in slide-in-from-bottom-5 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        
                        {/* Conector vertical (se oculta en el último elemento) */}
                        {index !== historialActivo.length - 1 && (
                          <div className={`absolute left-[19px] top-10 w-[2px] h-full border-l-2 border-dashed ${ui.color}`}></div>
                        )}
                        
                        {/* Círculo con Icono */}
                        <div className={`z-10 w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center shadow-sm ${ui.color}`}>
                          {ui.icon}
                        </div>

                        {/* Texto Descriptivo */}
                        <div className="flex-1 pt-1">
                          <div className="flex flex-col">
                            <h4 className={`font-black text-[11px] uppercase tracking-widest leading-none mb-1 ${ui.text}`}>
                              {evento.tipo_evento}: <span className="text-gray-500 font-bold lowercase tracking-normal italic text-xs ml-1">{evento.descripcion}</span>
                            </h4>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">
                              {/* Formateamos la fecha si existe */}
                              {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'Fecha desconocida'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 font-bold italic text-sm">Este activo no tiene historial registrado aún.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Trazabilidad;