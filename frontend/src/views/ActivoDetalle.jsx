import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, ClipboardList, 
  Loader2, X, PackageOpen, Settings2,
  Info, MapPin, BadgeDollarSign, FileText, Calendar, Tag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import Navbar from '../components/Navbar';
import StatusModal from '../components/StatusModal';
import AsignarProyectoModal from '../components/AsignarProyectoModal';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ActivoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  
  const userRole = parseInt(localStorage.getItem('rol')) || 2; 

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

  const handleUpdateStatus = async (nuevoIdEstado) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/activos/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_estado_maquina: nuevoIdEstado })
      });
      if (response.ok) {
        setActivo({ ...activo, id_estado_maquina: nuevoIdEstado });
        setShowStatusModal(false);
      }
    } catch (err) { alert("Error de red."); } finally { setLoadingAction(false); }
  };

  const handleConfirmAsignar = async (formData) => {
    setLoadingAsignar(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/solicitudes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_activo: activo.id_activo,
          id_destino: parseInt(formData.id_proyecto),
          tipo_salida: 'Asignación Directa',
          metodo_transporte: 'Interno',
          fecha_salida_programada: new Date().toISOString()
        })
      });
      if (response.ok) {
        setActivo({ ...activo, id_estado_maquina: 3 });
        setShowAsignarModal(false);
        alert("¡Activo asignado exitosamente!");
      }
    } catch (err) { alert("Fallo al conectar."); } finally { setLoadingAsignar(false); }
  };

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
      <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando ZF Cloud...</p>
    </div>
  );

  const statusInfo = getEstadoInfo(activo.id_estado_maquina);

  // Helper para renderizar filas de datos
  const DataRow = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col border-b border-gray-100 pb-3 last:border-0 pt-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={12} className="text-[#0070BC]" />}
        <p className="font-black text-[#0070BC] uppercase text-[8px] tracking-widest">{label}</p>
      </div>
      <p className="font-bold text-gray-800 text-xs leading-tight break-all">
        {value || <span className="text-gray-300 italic font-normal">No registrado</span>}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-[180px] md:pb-32 relative">
      <Navbar />

      <StatusModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} onUpdate={handleUpdateStatus} currentStatusId={activo.id_estado_maquina} loading={loadingAction} />
      <AsignarProyectoModal isOpen={showAsignarModal} onClose={() => setShowAsignarModal(false)} onConfirm={handleConfirmAsignar} assetName={activo.nombre_maquina} loading={loadingAsignar} />
      
      <header className="px-6 py-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0070BC] font-black active:scale-95 transition-transform">
          <ArrowLeft size={24} /> <span className="text-xs uppercase italic tracking-widest">Atrás</span>
        </button>
        {userRole === 1 && (
          <button onClick={() => navigate(`/editar-activo/${activo.id_activo}`)} className="text-[#0070BC] font-black text-[9px] uppercase tracking-[0.2em] bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-100">
              Editar Equipo
          </button>
        )}
      </header>

      <main className="px-6 flex-1 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
        {/* PRESENTACIÓN */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-white p-6 rounded-[45px] shadow-2xl shadow-blue-100/60 border border-blue-50 mb-10">
            <QRCodeSVG value={activo.qr_codigo} size={160} level={"H"} />
          </div>
          <div className="bg-gray-100 px-4 py-1.5 rounded-full mb-4">
            <p className="text-gray-400 text-[9px] font-black tracking-[0.4em] uppercase">TAG: {activo.tag || 'S/N'}</p>
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tighter mb-4 uppercase italic">
            {activo.nombre_maquina}
          </h1>
          <div className={`px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>

        {/* --- SECCIÓN 1: DATOS TÉCNICOS --- */}
        <div className="bg-gray-50 rounded-[35px] p-8 mt-12 border border-gray-100">
          <h3 className="text-gray-400 font-black mb-6 uppercase text-[9px] tracking-[0.3em] flex items-center gap-2 italic border-b border-gray-200 pb-2">
            <PackageOpen size={16} /> Identificación Técnica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <DataRow label="Marca" value={activo.marca} icon={Tag} />
            <DataRow label="Modelo" value={activo.modelo} icon={Tag} />
            <DataRow label="Número de Serie" value={activo.numero_serie} icon={FileText} />
            <DataRow label="Número de Parte" value={activo.numero_parte} icon={FileText} />
            <DataRow label="Año" value={activo.anio} icon={Calendar} />
            <DataRow label="Categoría" value={activo.categoria?.nombre} icon={Info} />
            <DataRow label="Disciplina" value={activo.disciplina?.nombre} icon={Info} />
          </div>
        </div>

        {/* --- SECCIÓN 2: UBICACIÓN Y RESPONSABLE --- */}
        <div className="bg-gray-50 rounded-[35px] p-8 mt-6 border border-gray-100">
          <h3 className="text-gray-400 font-black mb-6 uppercase text-[9px] tracking-[0.3em] flex items-center gap-2 italic border-b border-gray-200 pb-2">
            <MapPin size={16} /> Ubicación en Planta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <DataRow label="Edificio / Planta" value={activo.ubicacion?.nombre} />
            <DataRow label="Subárea" value={activo.subarea} />
            <DataRow label="Gerente Responsable" value={activo.gerente?.nombre_completo} />
            <DataRow label="Proyecto Actual" value={activo.proyecto?.nombre} />
          </div>
        </div>

        {/* --- SECCIÓN 3: DATOS COMERCIALES (CRÍTICO EHS) --- */}
        <div className="bg-[#D1E9FF]/20 rounded-[35px] p-8 mt-6 border border-blue-100">
          <h3 className="text-[#0070BC] font-black mb-6 uppercase text-[9px] tracking-[0.3em] flex items-center gap-2 italic border-b border-blue-100 pb-2">
            <BadgeDollarSign size={16} /> Información Aduanera y Comercial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <DataRow label="Factura" value={activo.factura} icon={FileText} />
            <DataRow label="Pedimento" value={activo.pedimento} icon={FileText} />
            <DataRow label="Valor Comercial" value={activo.valor_comercial ? `$${activo.valor_comercial} USD` : null} icon={BadgeDollarSign} />
            <DataRow label="Fecha de Compra" value={activo.fecha_compra ? new Date(activo.fecha_compra).toLocaleDateString() : null} icon={Calendar} />
            <DataRow label="Nacionalidad" value={activo.tipo_nacionalidad?.nombre} />
            <DataRow label="Tipo de Compra" value={activo.tipo_compra?.nombre} />
          </div>
        </div>

        {/* --- SECCIÓN 4: DESCRIPCIÓN --- */}
        <div className="bg-[#0070BC] rounded-[35px] p-8 mt-6 text-white">
          <h3 className="text-white-500 font-black mb-4 uppercase text-[9px] tracking-[0.3em] italic">
            Notas y Descripción
          </h3>
          <p className="text-sm font-medium leading-relaxed italic opacity-90 mb-6">
            "{activo.descripcion || 'Sin descripción técnica registrada.'}"
          </p>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-white">
             <p className="font-black uppercase tracking-widest mb-2">Comentarios Internos:</p>
             <p>{activo.comentarios || 'Ninguno'}</p>
          </div>
        </div>
      </main>

      {/* ACTION BAR PARA ROLES */}
      <div className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pb-8 lg:pb-12 z-40">
        <div className="max-w-md mx-auto flex gap-4">
          {userRole === 1 ? (
             <>
               <button onClick={() => setShowStatusModal(true)} className="flex-1 h-[65px] bg-white border-2 border-gray-100 text-gray-900 rounded-[28px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 shadow-sm">
                 <Settings2 size={20} className="text-[#0070BC]" /> Estado
               </button>
               <button onClick={() => setShowAsignarModal(true)} className="flex-[2] h-[65px] bg-[#0070BC] text-white rounded-[28px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 shadow-xl shadow-blue-200">
                 <UserPlus size={20} /> Asignar
               </button>
             </>
           ) : userRole === 5 ? (
             /* Botón informativo para EHS */
             <div className="w-full bg-[#0070BC] text-white p-5 rounded-[30px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
               <Info size={20} /> Revisión EHS Activa
             </div>
           ) : (
             <button onClick={() => navigate('/nueva-solicitud', { state: { activo } })} disabled={activo.id_estado_maquina !== 1}
               className={`w-full h-[65px] rounded-[30px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl ${activo.id_estado_maquina === 1 ? 'bg-[#0070BC] text-white' : 'bg-gray-100 text-gray-400'}`}>
               <ClipboardList size={22} /> Solicitar Préstamo
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default ActivoDetalle;