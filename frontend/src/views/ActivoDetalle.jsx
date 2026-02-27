import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, ClipboardList, 
  Loader2, X, PackageOpen, Settings2 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import Navbar from '../components/Navbar';
import StatusModal from '../components/StatusModal';
import AsignarProyectoModal from '../components/AsignarProyectoModal';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ActivoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- ESTADOS DE DATOS ---
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ESTADOS DE UI / MODALES ---
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  
  const userRole = parseInt(localStorage.getItem('rol')) || 2; 

  // --- 1. CARGA DE DETALLE ---
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/activos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se pudo obtener la información del activo');
        
        const data = await response.json();
        setActivo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  // --- 2. LÓGICA: CAMBIAR ESTADO TÉCNICO (Admin) ---
  const handleUpdateStatus = async (nuevoIdEstado) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/activos/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ id_estado_maquina: nuevoIdEstado })
      });

      if (response.ok) {
        setActivo({ ...activo, id_estado_maquina: nuevoIdEstado });
        setShowStatusModal(false);
      } else {
        alert("Error al actualizar el estado técnico.");
      }
    } catch (err) {
      alert("Error de red.");
    } finally {
      setLoadingAction(false);
    }
  };

  // --- 3. LÓGICA: ASIGNACIÓN DIRECTA A PROYECTO (Admin) ---
  // Reutiliza el endpoint /solicitudes que ya es inteligente
  const handleConfirmAsignar = async (formData) => {
    setLoadingAsignar(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/solicitudes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          id_activo: activo.id_activo,
          id_destino: parseInt(formData.id_proyecto), // Se guarda como proyecto destino
          tipo_salida: 'Asignación Directa',
          metodo_transporte: 'Interno',
          fecha_salida_programada: new Date().toISOString() // Salida inmediata
        })
      });

      if (response.ok) {
        // Actualizamos a estado "Prestada" (ID 3)
        setActivo({ ...activo, id_estado_maquina: 3 });
        setShowAsignarModal(false);
        alert("¡Activo asignado al proyecto exitosamente!");
      } else {
        const data = await response.json();
        alert(data.error || "Error en la asignación.");
      }
    } catch (err) {
      alert("Fallo al conectar con el servidor.");
    } finally {
      setLoadingAsignar(false);
    }
  };

  // --- HELPERS VISUALES ---
  const getEstadoInfo = (idEstado) => {
    switch (idEstado) {
      case 1: return { label: 'Operativa', color: 'bg-[#28B4AD]' };
      case 2: return { label: 'En mantenimiento', color: 'bg-orange-500' };
      case 3: return { label: 'Prestada', color: 'bg-[#0070BC]' };
      case 4: return { label: 'Dada de baja', color: 'bg-gray-900' };
      default: return { label: 'Desconocido', color: 'bg-gray-400' };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-[#0070BC] mb-4" size={48} />
      <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Cargando ZF Cloud...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <X size={60} className="text-red-500 mb-4" />
      <h2 className="text-xl font-black uppercase italic mb-2">Error de Sistema</h2>
      <p className="text-gray-500 text-sm mb-6">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-[#0070BC] text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Regresar</button>
    </div>
  );

  const statusInfo = getEstadoInfo(activo.id_estado_maquina);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-[160px] md:pb-32 relative">
      <Navbar />

      {/* MODALES ADMINISTRATIVOS */}
      <StatusModal 
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={handleUpdateStatus}
        currentStatusId={activo.id_estado_maquina}
        loading={loadingAction}
      />

      <AsignarProyectoModal 
        isOpen={showAsignarModal}
        onClose={() => setShowAsignarModal(false)}
        onConfirm={handleConfirmAsignar}
        assetName={activo.nombre_maquina}
        loading={loadingAsignar}
      />
      
      {/* HEADER DE NAVEGACIÓN */}
      <header className="px-6 py-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0070BC] font-black active:scale-95 transition-transform">
          <ArrowLeft size={24} /> <span className="text-xs uppercase italic tracking-widest">Catálogo</span>
        </button>
        {userRole === 1 && (
          <button onClick={() => navigate(`/editar-activo/${activo.id_activo}`)} className="text-[#0070BC] font-black text-[9px] uppercase tracking-[0.2em] bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-100 transition-colors">
              Editar Equipo
          </button>
        )}
      </header>

      <main className="px-6 flex-1 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* PRESENTACIÓN DEL ACTIVO */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-[45px] shadow-2xl shadow-blue-100/60 border border-blue-50 mb-10 relative group">
            <QRCodeSVG value={activo.qr_codigo || `ZF-${activo.id_activo}`} size={180} level={"H"} />
          </div>

          <div className="bg-gray-100 px-4 py-1.5 rounded-full mb-4">
            <p className="text-gray-400 text-[9px] font-black tracking-[0.4em] uppercase">ID #{activo.id_activo}</p>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tighter mb-4 uppercase italic">
            {activo.nombre_maquina}
          </h1>
          
          <div className={`px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all text-white ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>

        {/* FICHA TÉCNICA */}
        <div className="bg-gray-50 rounded-[40px] p-8 mt-10 border border-gray-100 max-w-lg mx-auto">
          <h3 className="text-gray-400 font-black mb-6 uppercase text-[9px] tracking-[0.3em] flex items-center gap-2 italic">
            <PackageOpen size={16} /> Especificaciones ZF
          </h3>
          <div className="grid grid-cols-2 gap-y-8 text-sm">
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">Modelo</p>
                <p className="font-bold text-gray-800 leading-tight">{activo.modelo || 'N/A'}</p>
            </div>
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">QR / Serie</p>
                <p className="font-bold text-gray-800 leading-tight break-all">{activo.qr_codigo || 'No asignado'}</p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ACTION BAR */}
<div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pb-8 md:pb-12 z-40">
  <div className="max-w-md mx-auto flex gap-4">
    {userRole === 1 ? (
       <>
         {/* BOTÓN ESTADO - ALTURA CORREGIDA */}
         <button 
           onClick={() => setShowStatusModal(true)} 
           className="flex-1 h-[60px] bg-white border-2 border-gray-100 text-gray-900 rounded-[28px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
         >
           <Settings2 size={20} className="text-[#0070BC]" />
           Estado
         </button>

         {/* BOTÓN ASIGNAR - ALTURA CORREGIDA */}
         <button 
           onClick={() => setShowAsignarModal(true)} 
           disabled={activo.id_estado_maquina === 4}
           className="flex-[2] h-[70px] bg-[#0070BC] text-white rounded-[28px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xl shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none"
         >
           <UserPlus size={20} />
           Asignar
         </button>
       </>
     ) : (
       /* Botón para Usuario General también con altura mejorada */
       <button 
         onClick={() => navigate('/nueva-solicitud', { state: { activo } })} 
         disabled={activo.id_estado_maquina !== 1}
         className={`w-full h-[75px] rounded-[30px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl
           ${activo.id_estado_maquina === 1 
             ? 'bg-[#0070BC] text-white shadow-blue-200 active:scale-95' 
             : 'bg-gray-100 text-gray-400 border-2 border-gray-200 shadow-none'}`}
       >
         <ClipboardList size={22} /> 
         {activo.id_estado_maquina === 1 ? 'Solicitar Préstamo' : 'No disponible'}
       </button>
     )}
  </div>
</div>
    </div>
  );
};

export default ActivoDetalle;