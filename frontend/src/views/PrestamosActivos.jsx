import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ArrowLeft, Clock, ChevronRight, User, Loader2, AlertCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrestamosActivos = () => {
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Leemos el rol para saber a qué página mandarlos (por seguridad)
  const rolActivo = parseInt(localStorage.getItem('rol')) || 2;

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        // 📡 Usamos el endpoint master para obtener todo el historial
        const response = await fetch(`${baseUrl}/solicitudes/master`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Error al conectar con el historial maestro');

      const result = await response.json();
      console.log("Estructura de la primera solicitud:", result[0] || result.data?.[0]); // 👈 AGREGA ESTO
        const listaReal = Array.isArray(result) 
          ? result 
          : (result.data || result.solicitudes || []);
        
        const prestamosMapeados = listaReal.map(sol => {
          const idActivoReal = sol.id_activo || sol.activo?.id_activo;

          // 🛡️ Log de seguridad (Solo para que tú lo veas en consola)
          if (!idActivoReal) console.warn("¡Ojo! No se encontró ID para la solicitud:", sol.id_solicitud);

          return {
            id_solicitud: sol.id_solicitud,
            id_activo: idActivoReal, // 👈 Ahora sí llevamos el valor correcto
            nombre_activo: sol.activo?.nombre_maquina || 'Equipo ZF',
            nombre_solicitante: sol.solicitante?.nombre_completo || 'Personal ZF',
            fecha_salida: new Date(sol.fecha_creacion).toLocaleDateString(),
            tag: sol.activo?.tag || 'S/N',
            estatus: sol.estatus_general
          };
        });

        setPrestamos(prestamosMapeados);
      } catch (err) {
        console.error("Error en PrestamosActivos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      {/* HEADER CORPORATIVO ZF */}
      <div className="p-8 pt-12">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-gray-50 rounded-full text-[#0070BC] active:scale-90 transition-transform mb-6"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-2">
            <History size={20} className="text-[#0070BC]" />
            <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-[0.3em] italic">Control de Movimientos</p>
        </div>
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">
          Historial <br />
          <span className="text-[#0070BC]">Préstamos</span>
        </h1>
        <div className="w-12 h-1.5 bg-[#0070BC] mt-4 rounded-full"></div>
      </div>

      {/* LISTADO DE TARJETAS */}
      <main className="px-6 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Sincronizando con ZF Cloud...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-[40px] text-center border-2 border-red-100">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-red-600 font-black text-xs uppercase italic">{error}</p>
          </div>
        ) : prestamos.length > 0 ? (
          prestamos.map((p) => (
            <div 
              key={p.id_solicitud} 
              // 🚀 NAVEGACIÓN DINÁMICA: 
              // Si es Gerente (3) o Auditor (7), va directo a la Trazabilidad del activo.
              onClick={() => {
                if (rolActivo === 1 || rolActivo === 3 || rolActivo === 7) {
                    navigate(`/auditor/trazabilidad/${p.id_activo}`);
                } else {
                    // Si es usuario normal, podrías mandarlo al detalle de la solicitud
                    navigate(`/solicitud/${p.id_solicitud}`);
                }
              }}
              className="group bg-white p-6 rounded-[40px] border-2 border-gray-50 shadow-sm active:scale-[0.98] transition-all hover:border-blue-100 cursor-pointer flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black bg-blue-50 text-[#0070BC] px-3 py-1 rounded-full uppercase tracking-widest">
                    Folio #{p.id_solicitud}
                  </span>
                  {p.estatus && (
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                        p.estatus === 'Aprobada' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {p.estatus}
                    </span>
                  )}
                </div>
                
                <h3 className="font-black text-gray-900 text-lg uppercase italic group-hover:text-[#0070BC] transition-colors leading-tight line-clamp-1">
                  {p.nombre_activo}
                </h3>

                <div className="flex items-center gap-2 mt-3 text-gray-500">
                  <div className="bg-gray-50 p-1.5 rounded-lg">
                    <User size={12} className="text-[#0070BC]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Portador: <span className="text-gray-900">{p.nombre_solicitante}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center text-gray-300 text-[9px] font-black uppercase tracking-[0.2em]">
                  <Clock size={12} className="mr-2" /> Registrado el: {p.fecha_salida}
                </div>
              </div>

              {/* Icono de flecha que se ilumina al pasar el dedo/mouse */}
              <div className="w-12 h-12 rounded-[22px] bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0070BC] group-hover:text-white transition-all shadow-inner">
                <ChevronRight size={22} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="font-black text-gray-400 uppercase italic tracking-widest text-xs">No hay registros en el historial maestro</p>
          </div>
        )}
      </main>

      {/* FOOTER ZF */}
      <div className="mt-12 mb-8 px-10 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-900">
          ZF Assets Control System
        </p>
      </div>
    </div>
  );
};

export default PrestamosActivos;