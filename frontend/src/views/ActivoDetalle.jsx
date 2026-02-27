import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Wrench, ClipboardList, 
  Loader2, X, PackageOpen
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import Navbar from '../components/Navbar';

const baseUrl = import.meta.env.VITE_API_URL;

const ActivoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. ESTADOS DINÁMICOS
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Recuerda: 1=Admin, 2=Usuario General
  const [userRole] = useState(parseInt(localStorage.getItem('rol')) || 2); 

  // 2. CARGA DE DATOS DESDE EL BACKEND
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${baseUrl}/activos/${id}`, {
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

  // 3. LÓGICA DE NAVEGACIÓN PARA EL PRÉSTAMO
  const handleSolicitarPrestamo = () => {
    // Si el equipo no está disponible (ID 1), no dejamos que pase al formulario
    if (activo.id_estado_maquina !== 1) {
      alert("Este equipo se encuentra actualmente prestado o en mantenimiento.");
      return;
    }

    // Navegamos al formulario pasándole los datos del activo por el estado de React Router
    navigate('/nueva-solicitud', { state: { activo: activo } });
  };

  // --- ESTADOS DE CARGA Y ERROR ---
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#0070BC] mb-4" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Consultando ZF Cloud...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white border border-red-100 p-10 rounded-[40px] shadow-xl text-center max-w-sm w-full">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={40} className="text-red-500" />
            </div>
            <h2 className="font-black text-gray-900 text-2xl uppercase tracking-tighter italic mb-2">Error 404</h2>
            <p className="text-gray-500 text-sm font-bold leading-relaxed mb-8">{error}</p>
            <button onClick={() => navigate(-1)} className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform">
              Volver al catálogo
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-32">
      <Navbar />
      
      {/* HEADER DINÁMICO */}
      <header className="px-6 py-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#0070BC] font-bold active:scale-95 transition-transform">
          <ArrowLeft size={24} /> <span className="text-sm">Catálogo</span>
        </button>
        {userRole === 1 && (
          <button onClick={() => navigate(`/editar-activo/${activo.id_activo}`)} className="text-[#0070BC] font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full">
              Editar
          </button>
        )}
      </header>

      <main className="px-6 flex-1 mt-6">
        
        {/* IDENTIDAD DEL ACTIVO */}
        <div className="flex flex-col items-center text-center">
          
          {/* Contenedor del QR Limpio */}
          <div className="bg-white p-6 rounded-[40px] shadow-xl shadow-blue-100/50 border border-blue-50 mb-8 relative group">
            <div className="absolute inset-0 border-4 border-[#0070BC]/10 rounded-[40px] transform scale-105 group-hover:scale-110 transition-transform"></div>
            {activo && (
              <QRCodeSVG 
                value={activo.qr_codigo || `ZF-ASSET-${activo.id_activo}`} 
                size={160}
                level={"M"}
                includeMargin={false}
              />
            )}
          </div>

          <div className="bg-gray-100 px-4 py-1.5 rounded-full mb-4">
            <p className="text-gray-500 text-[9px] font-black tracking-[0.3em] uppercase">
              ID: {activo.id_activo}
            </p>
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 leading-none tracking-tight mb-4">
            {activo.nombre_maquina}
          </h1>
          
          <div className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm
            ${activo.id_estado_maquina === 1 ? 'bg-[#28B4AD] text-white shadow-teal-200' : 'bg-orange-500 text-white shadow-orange-200'}`}>
            {activo.estado_maquina?.nombre || 'Estado desconocido'}
          </div>
        </div>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <div className="bg-gray-50 rounded-[35px] p-8 mt-10 border border-gray-100">
          <h3 className="text-gray-400 font-black mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <PackageOpen size={16} /> Detalles Técnicos
          </h3>
          <div className="grid grid-cols-2 gap-y-6 text-sm">
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">Modelo</p>
                <p className="font-bold text-gray-800 leading-tight">{activo.modelo || 'N/A'}</p>
            </div>
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">Categoría</p>
                <p className="font-bold text-gray-800 leading-tight">{activo.disciplina?.nombre || 'General'}</p>
            </div>
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">No. Serie</p>
                <p className="font-bold text-gray-800 leading-tight">{activo.numero_serie || 'No registrado'}</p>
            </div>
            <div>
                <p className="font-black text-[#0070BC] uppercase text-[9px] tracking-widest mb-1">Ubicación</p>
                <p className="font-bold text-gray-800 leading-tight">Planta ZF</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- ACTION BAR INFERIOR FIJA --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pb-10">
        <div className="max-w-md mx-auto flex gap-4">
          {userRole === 1 ? (
             <>
               <button className="flex-1 bg-white border-2 border-orange-200 text-orange-500 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                 <Wrench size={18} /> Fallo
               </button>
               <button className="flex-[2] bg-[#0070BC] text-white py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-xl shadow-blue-200">
                 <UserPlus size={18} /> Asignar
               </button>
             </>
           ) : (
             <button 
               onClick={handleSolicitarPrestamo} 
               disabled={activo?.id_estado_maquina !== 1}
               className={`w-full py-5 rounded-[25px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl
                 ${activo?.id_estado_maquina === 1 
                   ? 'bg-[#0070BC] text-white shadow-blue-200 active:scale-95 cursor-pointer' 
                   : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed border-2 border-gray-200'}`}
             >
               <ClipboardList size={22} /> 
               {activo?.id_estado_maquina === 1 ? 'Solicitar Préstamo' : 'Equipo no disponible'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default ActivoDetalle;