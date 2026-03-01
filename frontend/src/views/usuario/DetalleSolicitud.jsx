import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, 
  Truck, Calendar, MapPin, ShieldAlert, 
  Loader2, Ban, Info 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ModalConfirmacion from '../../components/ModalConfirmacion';

const DetalleSolicitud = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados de datos
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para el Modal de Cancelación
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. CARGA DE DATOS DESDE EL BACKEND
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${baseUrl}/solicitudes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error('La solicitud no existe.');
          throw new Error('Error al conectar con el servidor.');
        }
        
        const data = await response.json();
        setSolicitud(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  // 2. FUNCIÓN PARA PROCESAR LA CANCELACIÓN
  const handleConfirmarCancelacion = async () => {
    try {
      setCancelLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${baseUrl}/solicitudes/${id}/cancelar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Recargamos los datos para mostrar el estatus "Cancelada"
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "No se pudo procesar la cancelación.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error de conexión.");
    } finally {
      setCancelLoading(false);
      setIsModalOpen(false);
    }
  };

  // --- LÓGICA DE ESTILOS DINÁMICOS ---
  const getBadgeColor = (estatus) => {
    switch(estatus) {
      case 'Aprobada': return 'bg-green-500 shadow-green-100';
      case 'Rechazada': return 'bg-red-500 shadow-red-100';
      case 'Cancelada': return 'bg-gray-400 shadow-gray-100';
      default: return 'bg-[#0070BC] shadow-blue-100'; // Pendiente
    }
  };

  const renderStepIcon = (estadoFirma) => {
    if (estadoFirma === 'Aprobado') return <CheckCircle2 size={24} className="text-green-500 bg-white rounded-full" />;
    if (estadoFirma === 'Rechazado') return <XCircle size={24} className="text-red-500 bg-white rounded-full" />;
    return <Clock size={24} className="text-gray-300 bg-white rounded-full" />; 
  };

  // Pantalla de Carga
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#0070BC] mb-4" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Consultando ZF Cloud...</p>
      </div>
    </div>
  );

  // Pantalla de Error
  if (error || !solicitud) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-red-50 max-w-sm">
          <XCircle size={60} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 uppercase italic mb-2 tracking-tighter">Oops...</h2>
          <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8">{error || "No encontramos los datos."}</p>
          <button onClick={() => navigate(-1)} className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
            Volver
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
      <Navbar />

      {/* HEADER DE LA SOLICITUD */}
      <div className="bg-white px-6 py-10 rounded-b-[45px] shadow-sm border-b border-gray-100 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-6 p-2 bg-gray-50 rounded-full text-[#0070BC] active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        
        <div className="text-center mt-6">
          <div className="bg-blue-50 text-[#0070BC] w-fit mx-auto px-4 py-1 rounded-full mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Folio #{solicitud.id_solicitud}</p>
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter mb-4 px-4">
            {solicitud.activo?.nombre_maquina || 'Equipo Desconocido'}
          </h1>
          <div className={`mx-auto w-fit px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${getBadgeColor(solicitud.estatus_general)}`}>
            {solicitud.estatus_general}
          </div>
        </div>
      </div>

      <main className="px-6 mt-8 space-y-6">
        
        {/* CARD: DETALLES LOGÍSTICOS */}
        <div className="bg-white rounded-[35px] p-7 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 italic">
            <Info size={16} className="text-[#0070BC]" /> Información de Salida
          </h3>
          
          <div className="grid grid-cols-2 gap-y-8 text-sm">
            <div>
              <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Calendar size={12}/> Fecha Salida
              </p>
              <p className="font-bold text-gray-800">{new Date(solicitud.fecha_salida_programada).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Calendar size={12}/> Fecha Retorno
              </p>
              <p className="font-bold text-gray-800">
                {solicitud.fecha_devolucion_programada 
                  ? new Date(solicitud.fecha_devolucion_programada).toLocaleDateString() 
                  : 'Sin retorno'}
              </p>
            </div>
            <div className="col-span-2">
              <div className="h-px bg-gray-50 w-full mb-6"></div>
              <div className="flex justify-between items-center">
                <div>
                    <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest mb-1 flex items-center gap-1"><Truck size={12}/> Transporte</p>
                    <p className="font-bold text-gray-800 capitalize">{solicitud.metodo_transporte || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={12}/> ID Destino</p>
                    <p className="font-bold text-gray-800 text-right">{solicitud.id_destino || 'Interno'}</p>
                </div>
              </div>
            </div>
          </div>

          {solicitud.tipo_salida?.toLowerCase().includes('Scrap') && (
            <div className="mt-8 bg-orange-50/50 border border-orange-100 p-5 rounded-[25px] flex gap-4">
              <ShieldAlert className="text-orange-500 shrink-0" size={24} />
              <p className="text-[10px] font-bold text-orange-800 uppercase leading-relaxed">
                Advertencia EHS: Este activo es catalogado como chatarra. Su salida requiere aprobación ambiental.
              </p>
            </div>
          )}
        </div>

        {/* CARD: LÍNEA DE TIEMPO (FIRMAS) */}
        <div className="bg-white rounded-[35px] p-7 shadow-sm border border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 italic">Progreso de Firmas</h3>

          <div className="relative pl-4 space-y-10 before:absolute before:inset-y-2 before:left-[27px] before:w-[2.5px] before:bg-gray-50">
            
            {/* Paso 1: Gerencia */}
            <div className="relative flex items-start gap-5">
              <div className="z-10 mt-1 shadow-xl shadow-gray-100 rounded-full">
                {renderStepIcon(solicitud.firmas?.gerente || 'Pendiente')}
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase italic leading-none">Aprobación Gerente</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-2">
                  {solicitud.firmas?.gerente === 'Aprobado' ? 'Autorizado correctamente' : 'Esperando revisión del Gerente'}
                </p>
              </div>
            </div>

            {/* Paso 2: Final / Seguridad */}
            <div className="relative flex items-start gap-5">
              <div className="z-10 mt-1 shadow-xl shadow-gray-100 rounded-full">
                {renderStepIcon(solicitud.estatus_general === 'Aprobada' ? 'Aprobado' : (solicitud.estatus_general === 'Cancelada' ? 'Rechazado' : 'Pendiente'))}
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase italic leading-none">Liberación de Activo</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-2">
                  {solicitud.estatus_general === 'Aprobada' ? 'Equipo listo para entrega' : (solicitud.estatus_general === 'Cancelada' ? 'Solicitud cancelada por usuario' : 'En espera de validaciones')}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* BOTÓN DE CANCELAR DINÁMICO */}
        {solicitud.estatus_general === 'Pendiente' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-5 bg-white border-2 border-red-50 text-red-500 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all hover:bg-red-50/50 mt-4"
          >
            <Ban size={18} /> Cancelar Solicitud
          </button>
        )}
      </main>

      {/* MODAL REUTILIZABLE */}
      <ModalConfirmacion 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarCancelacion}
        loading={cancelLoading}
        titulo="¿Cancelar Solicitud?"
        mensaje="Esta acción detendrá el proceso de firmas de forma permanente. ¿Deseas continuar?"
      />
    </div>
  );
};

export default DetalleSolicitud;