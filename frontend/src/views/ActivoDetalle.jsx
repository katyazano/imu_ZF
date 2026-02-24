import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Wrench, Trash2, ClipboardList, 
  History, Loader2, CheckCircle2, X 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // La librería que acabamos de arreglar
import Navbar from '../components/Navbar';

const ActivoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. ESTADOS DINÁMICOS
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Roles de la DB: 1=Admin, 2=Gerente, 3=Auditor (ajusta según tus IDs)
  const [userRole] = useState(parseInt(localStorage.getItem('rol')) || 0); 
  
  const [showModal, setShowModal] = useState(null); 
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [proyectoAsignado, setProyectoAsignado] = useState('');
  const [motivoAccion, setMotivoAccion] = useState('');

  // 2. CARGA DE DATOS DESDE EL BACKEND
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Petición al endpoint específico que creamos en Node
        const response = await fetch(`http://localhost:4000/api/activos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se encontró el activo en la base de datos');
        
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

  // 3. PROCESAR ACCIONES (MANTENIMIENTO / ASIGNACIÓN)
  const handleConfirmAction = async () => {
    const token = localStorage.getItem('token');
    let endpoint = '';
    let body = {};

    try {
      if (showModal === 'mantenimiento') {
        endpoint = 'http://localhost:4000/api/mantenimientos';
        body = {
          id_activo: activo.id_activo,
          tipo_mantenimiento: 'Correctivo',
          descripcion: motivoAccion
        };
      } 
      // Aquí puedes agregar más lógica para 'asignar' o 'baja'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error al procesar la solicitud en el servidor');

      setShowModal(null);
      setMotivoAccion('');
      setShowSuccess(true);
      
      // Recargar para ver el cambio de estado (ej: de Disponible a Mantenimiento)
      setTimeout(() => window.location.reload(), 2500);

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0070BC] mb-4" size={48} />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Consultando ZF Cloud...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-red-50 p-8 rounded-[30px]">
            <X size={48} className="text-red-500 mx-auto mb-4" />
            <p className="font-black text-red-600 uppercase italic mb-2">Error de Sistema</p>
            <p className="text-red-400 text-sm font-bold">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-6 text-[#0070BC] font-bold underline">Volver al inventario</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />
      
      <main className="p-6 flex-1">
        {/* Header de Acción */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full text-[#0070BC] active:scale-90 transition-transform">
            <ArrowLeft size={28} />
          </button>
          {userRole === 1 && (
            <button 
                onClick={() => navigate(`/editar-activo/${activo.id_activo}`)} 
                className="border-2 border-[#0070BC] text-[#0070BC] px-6 py-1.5 rounded-full font-black text-xs uppercase tracking-widest"
            >
                Editar
            </button>
          )}
        </div>

        {/* Sección de Identidad y QR */}
        <div className="flex flex-col items-center">
          {/* TARJETA DEL QR */}
          <div className="bg-white p-5 rounded-[40px] shadow-2xl shadow-blue-100 border-2 border-gray-50 mb-8 animate-in zoom-in duration-500">
            {activo && (
              <QRCodeSVG 
                value={activo.qr_codigo || `ZF-ASSET-${activo.id_activo}`} 
                size={180}
                level={"H"} // Alta resistencia a daños
                includeMargin={false}
              />
            )}
          </div>

          <p className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase mb-1">
            Property ID: {activo.id_activo}
          </p>
          <h2 className="text-3xl font-black text-gray-900 mt-1 text-center leading-tight px-4">
            {activo.nombre_maquina}
          </h2>
          
          <div className={`mt-4 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm
            ${activo.id_estado_maquina === 1 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
            {activo.estado_maquina?.nombre || 'Estado desconocido'}
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="bg-[#D1E9FF]/30 rounded-[35px] p-8 mt-10 border border-white">
          <h3 className="text-[#0070BC] font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Especificaciones Técnicas</h3>
          <div className="grid grid-cols-2 gap-y-5 text-xs">
            <div>
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Modelo</p>
                <p className="font-bold text-gray-800">{activo.modelo || 'N/A'}</p>
            </div>
            <div>
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Categoría</p>
                <p className="font-bold text-gray-800">{activo.disciplina?.nombre || 'General'}</p>
            </div>
            <div>
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Serie</p>
                <p className="font-bold text-gray-800">{activo.numero_serie || 'No reg.'}</p>
            </div>
            <div>
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Ubicación</p>
                <p className="font-bold text-gray-800">Planta ZF - Sector {activo.id_disciplina}</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción según ROL */}
        <div className="flex flex-col gap-4 mt-10">
           {userRole === 1 ? (
             <>
               <button onClick={() => setShowModal('asignar')} className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-blue-100">
                 <UserPlus size={20} /> Asignar a Proyecto
               </button>
               <button onClick={() => setShowModal('mantenimiento')} className="w-full bg-white border-2 border-orange-200 text-orange-500 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
                 <Wrench size={20} /> Reportar Falla
               </button>
             </>
           ) : (
             <button onClick={() => setShowModal('solicitar')} className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
               <ClipboardList size={20} /> Solicitar Préstamo
             </button>
           )}
        </div>
      </main>

      {/* OVERLAY DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0070BC] p-6 text-white text-center animate-in fade-in duration-300">
            <div className="animate-in zoom-in slide-in-from-bottom-10 duration-500">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={60} className="text-white" />
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-2">¡Sincronizado!</h2>
                <p className="font-bold opacity-80 text-sm tracking-widest">La bitácora de ZF ha sido actualizada con éxito.</p>
            </div>
        </div>
      )}

      {/* MODAL PARA ACCIONES (Mantenimiento / Asignación) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-200">
            <h2 className={`text-xl font-black mb-6 uppercase text-center ${showModal === 'mantenimiento' ? 'text-orange-500' : 'text-[#0070BC]'}`}>
                {showModal === 'mantenimiento' ? 'Reporte de Falla' : 'Asignar Equipo'}
            </h2>
            
            <textarea 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 mb-6 outline-none focus:border-blue-300 font-bold text-gray-700 resize-none text-sm"
                placeholder={showModal === 'mantenimiento' ? "Describe el problema técnico detectado..." : "Nombre del proyecto o responsable..."}
                rows="4"
                value={motivoAccion}
                onChange={(e) => setMotivoAccion(e.target.value)}
            />

            <div className="flex gap-4">
              <button onClick={() => { setShowModal(null); setMotivoAccion(''); }} className="flex-1 py-3 font-black text-gray-300 uppercase text-xs tracking-widest">Cancelar</button>
              <button 
                onClick={handleConfirmAction} 
                disabled={!motivoAccion}
                className={`flex-1 py-4 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-md transition-all ${!motivoAccion ? 'bg-gray-200' : 'bg-[#0070BC] active:scale-95'}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivoDetalle;