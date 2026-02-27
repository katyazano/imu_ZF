import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, User, Package, AlertCircle, Calendar, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const ValidarSolicitudes = () => {
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${baseUrl}/aprobaciones/pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendientes(data);
      } else {
        console.error("Error al obtener la bandeja de firmas");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPendientes(); 
  }, []);

  const handleDecision = async (id_firma, estatus_firma) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${baseUrl}/aprobaciones/dictaminar/${id_firma}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          estatus_firma: estatus_firma, 
          comentarios: `Dictaminado vía App (${estatus_firma})`
        })
      });

      if (response.ok) {
        fetchPendientes(); // Recarga la lista para quitar la que ya firmaste
      } else {
        const errorData = await response.json();
        alert(`No se pudo procesar: ${errorData.error || errorData.mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión al procesar la firma");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      {/* HEADER TIPO ZF */}
      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform self-start">
          <ArrowLeft size={32} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
            Bandeja de Firmas
          </h1>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">
            {pendientes.length} Solicitudes Pendientes
          </p>
        </div>
      </div>

      <main className="px-6 -mt-12 flex-1 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] shadow-xl border border-gray-100">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actualizando Bandeja...</span>
          </div>
        ) : pendientes.length > 0 ? (
          pendientes.map((p) => (
            <div key={p.id_firma} className="bg-white rounded-[40px] p-6 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* ENCABEZADO DE LA TARJETA */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-2xl text-[#0070BC]">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Solicitante</p>
                    <h3 className="font-black text-gray-900 text-sm uppercase italic leading-tight">
                      {p.solicitud?.solicitante?.nombre_completo || 'Usuario'}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl uppercase tracking-tighter block mb-1">
                    ID: #{p.solicitud?.id_solicitud}
                  </span>
                </div>
              </div>

              {/* DETALLES DE LA SOLICITUD */}
              <div className="bg-gray-50 rounded-[25px] p-5 space-y-4 mb-6">
                
                {/* Activo */}
                <div className="flex items-start gap-4">
                  <Package className="text-[#0070BC] shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Equipo Solicitado</p>
                    <h4 className="font-black text-gray-800 text-sm uppercase">
                      {p.solicitud?.activo?.nombre_maquina || 'Activo no especificado'}
                    </h4>
                    <span className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest italic">
                      TAG: {p.solicitud?.activo?.tag || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-200/50 w-full"></div>

                {/* Fechas / Tipo Salida */}
                <div className="flex items-start gap-4">
                  <Calendar className="text-orange-400 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Destino / Tipo</p>
                    <h4 className="font-bold text-gray-800 text-xs">
                      {p.solicitud?.tipo_salida || 'Préstamo Interno'}
                    </h4>
                    {p.solicitud?.fecha_retorno && (
                      <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest italic mt-1 block">
                        Retorno: {new Date(p.solicitud.fecha_retorno).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* BOTONES DE DECISIÓN */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if(window.confirm('¿Seguro que deseas RECHAZAR esta solicitud?')) {
                      handleDecision(p.id_firma, 'Rechazada');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-red-50 bg-red-50/50 rounded-2xl text-red-500 hover:bg-red-100 transition-all active:scale-95 shadow-sm"
                >
                  <X size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Rechazar</span>
                </button>
                <button 
                  onClick={() => handleDecision(p.id_firma, 'Aprobada')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0070BC] text-white rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Check size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Aprobar</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <CheckCircle size={50} className="mx-auto text-green-400 mb-4 opacity-50" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Bandeja Vacía</p>
            <p className="text-gray-300 text-[10px] font-bold mt-2">No tienes firmas pendientes</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidarSolicitudes;