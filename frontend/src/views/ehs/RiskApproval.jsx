import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, ShieldAlert, Loader2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const RiskApproval = () => {
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]); // Cambié el nombre a "pendientes" para que tenga más sentido
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para Modales
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentFirmaId, setCurrentFirmaId] = useState(null); // Ahora guardamos el ID_FIRMA
  const [rejectComment, setRejectComment] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // 1. CARGAR PENDIENTES DE EHS
  const fetchPendientesEHS = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${baseUrl}/aprobaciones/pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al obtener las firmas pendientes");

      const data = await response.json();
      setPendientes(data);
    } catch (err) {
      setError("No se pudieron cargar las firmas pendientes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientesEHS();
  }, []);

  // 2. FUNCIÓN PARA DICTAMINAR FIRMA (Aprobar o Rechazar)
  const enviarFirma = async (decision, comentarios = null) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ CORRECCIÓN 1: Usamos la ruta PATCH correcta de tu backend
      const response = await fetch(`${baseUrl}/aprobaciones/dictaminar/${currentFirmaId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        // ✅ CORRECCIÓN 2: Mandamos el body tal como lo pide tu dictaminarFirma
        body: JSON.stringify({
          estatus_firma: decision, 
          comentarios: comentarios
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el dictamen");
      }

      // Quitamos la firma procesada de la lista
      setPendientes(pendientes.filter(p => p.id_firma !== currentFirmaId));
      
      // Cerramos los modales
      setShowApproveModal(false);
      setShowRejectModal(false);
      setRejectComment('');

      alert(`Firma ${decision.toLowerCase()} exitosamente.`);

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingAction(false);
      setCurrentFirmaId(null);
    }
  };

  const confirmApprove = () => enviarFirma('Aprobada');

  const confirmReject = () => {
    if (!rejectComment.trim()) return alert("El motivo de rechazo es obligatorio.");
    enviarFirma('Rechazada', rejectComment);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
      <Navbar />

      <main className="px-6 pt-10 flex-1">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-8 italic uppercase tracking-tighter">
          Validación EHS
        </h2>

        {/* MANEJO DE ESTADOS DE CARGA/ERROR */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
             <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cargando pendientes...</p>
           </div>
        ) : error ? (
           <div className="text-center py-10">
             <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
             <p className="text-red-500 font-bold">{error}</p>
             <button onClick={fetchPendientesEHS} className="mt-4 text-[#0070BC] font-bold text-xs underline">Reintentar</button>
           </div>
        ) : pendientes.length > 0 ? (
          
          /* ✅ CORRECCIÓN 3: Mapeamos la estructura real del Backend */
          pendientes.map((item) => (
            <div key={item.id_firma} className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 mb-6 relative">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col pr-12"> {/* pr-12 para que no choque con la etiqueta */}
                  <h3 className="text-xl font-black text-[#0070BC] flex items-center gap-3">
                    {item.solicitud?.activo?.nombre_maquina || 'Equipo Desconocido'}
                    
                    {/* ✅ NUEVO BOTÓN PARA VER DETALLE DEL ACTIVO */}
                    {item.solicitud?.activo?.id_activo && (
                      <button 
                        onClick={() => navigate(`/activo/${item.solicitud.activo.id_activo}`)}
                        className="bg-blue-50 p-2 rounded-full text-[#0070BC] hover:bg-[#0070BC] hover:text-white transition-colors active:scale-90"
                        title="Ver ficha técnica del equipo"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </h3>
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                    Solicitud #{item.solicitud?.id_solicitud}
                  </span>
                </div>
                
                {/* Etiqueta EHS */}
                <span className="absolute top-8 right-8 bg-blue-100 text-[#0070BC] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Firma Pendiente
                </span>
              </div>

              <div className="text-xs space-y-2 mb-8 text-gray-600 bg-gray-50 p-4 rounded-2xl">
                <p><span className="font-black uppercase text-gray-800">Solicitante:</span> {item.solicitud?.solicitante?.nombre_completo}</p>
                {/* 💡 Nota: Tipo y Comentarios de la solicitud no vienen en tu backend actual, añadiremos un fallback */}
                <p><span className="font-black uppercase text-gray-800">Tipo:</span> {item.solicitud?.tipo_salida || 'Por definir'}</p>
                <p><span className="font-black uppercase text-gray-800">Notas:</span> {item.solicitud?.comentarios || 'Sin notas'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  // Guardamos el ID de la firma, no de la solicitud
                  onClick={() => { setCurrentFirmaId(item.id_firma); setShowRejectModal(true); }}
                  className="py-3 rounded-2xl border-2 border-red-400 text-red-500 font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  Rechazar
                </button>

                <button 
                  onClick={() => { setCurrentFirmaId(item.id_firma); setShowApproveModal(true); }}
                  className="py-3 rounded-2xl bg-[#0070BC] text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-transform" 
                >
                  Aprobar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <ShieldAlert size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] italic">
              Sin firmas pendientes
            </p>
          </div>
        )}

        {/* MODAL DE APROBACIÓN */}
        {showApproveModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
              <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">¿Aplicar Firma?</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">Al aprobar, confirmas que esta salida cumple con las normativas de EHS de ZF.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmApprove} 
                  disabled={loadingAction}
                  className="w-full py-4 bg-[#0070BC] text-white rounded-2xl font-black uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl shadow-blue-100 disabled:bg-blue-300"
                >
                  {loadingAction ? <Loader2 size={18} className="animate-spin" /> : 'Sí, Aprobar'}
                </button>
                <button 
                  onClick={() => setShowApproveModal(false)} 
                  disabled={loadingAction}
                  className="w-full py-4 text-gray-400 font-bold uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RECHAZO CON COMENTARIO */}
        {showRejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-center gap-3 mb-6 text-red-500">
                <AlertCircle size={28} />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Rechazar</h3>
              </div>
              
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Motivo del rechazo (Obligatorio)</label>
              <textarea 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-red-400 transition-colors mb-6"
                placeholder="Indica la razón por la que no se autoriza..."
                rows="4"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmReject} 
                  disabled={loadingAction || !rejectComment.trim()}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 disabled:bg-red-300 flex justify-center items-center gap-2"
                >
                  {loadingAction ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Rechazo'}
                </button>
                <button 
                  onClick={() => { setShowRejectModal(false); setRejectComment(''); }} 
                  disabled={loadingAction}
                  className="w-full py-4 text-gray-400 font-bold uppercase text-xs tracking-widest"
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RiskApproval;