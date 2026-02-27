import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Loader2, Beaker, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ScannerCamera from '../../components/ScannerCamera';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('scanning'); 
  const [errorDetail, setErrorDetail] = useState('');
  const [loading, setLoading] = useState(false);

  const rolActivo = parseInt(localStorage.getItem('rol')) || 2;

  const handleScanLogic = async (scannedId) => {
    // 1. Usuarios normales, Gerentes y Auditores
    if (rolActivo !== 6) {
      // Si es Auditor (7) o Gerente (3), van al expediente completo
      if (rolActivo === 7 || rolActivo === 3) {
        navigate(`/auditor/trazabilidad/${scannedId}`);
      } else {
        // Cualquier otro rol (Usuario General, Admin, etc.) va al detalle normal
        navigate(`/activo/${scannedId}`);
      }
      return;
    }

    // 2. Seguridad (Rol 6) - Ejecuta la verificación de salida
    await verificarPaseSeguridad(scannedId);
  };

  const verificarPaseSeguridad = async (activoId) => {
    setLoading(true);
    setStatus('verifying');

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const response = await fetch(`${baseUrl}/solicitudes/verificar-salida/${activoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      // NOTA: Si aún no tienes este endpoint, el botón de simulación 
      // te mandará a "Acceso Denegado" por ahora. ¡Es normal!
      if (response.ok && data.autorizado) {
        setStatus('approved');
      } else {
        setErrorDetail(data.error || 'Sin solicitud de salida vigente');
        setStatus('denied');
      }
    } catch (err) {
      setErrorDetail('Error de conexión con el servidor de ZF');
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden">
      {status === 'scanning' && (
        <div className="z-50">
          <Navbar />
        </div>
      )}

      <main className="flex-1 relative flex flex-col items-center justify-center">
        
        {status === 'scanning' && (
          <div className="w-full h-full relative flex items-center justify-center">
            
            {/* 1. EL MOTOR DEL SCANNER (Z-0) */}
            <div className="absolute inset-0 z-0">
               <ScannerCamera 
                 onScanSuccess={handleScanLogic} 
                 onScanError={(err) => console.log(err)} 
               />
            </div>

            {/* 2. BOTÓN DE RETROCESO FLOTANTE (Z-20) */}
            <div className="absolute top-20 left-6 z-20 md:top-24">
               <button 
                 onClick={() => navigate(-1)} 
                 className="bg-black/40 backdrop-blur-xl p-4 rounded-full text-white border border-white/10 active:scale-90 transition-transform shadow-2xl"
               >
                 <ArrowLeft size={24} />
               </button>
            </div>

            {/* 3. LEYENDA CENTRAL */}
            <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center z-20 pointer-events-none">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.4em] bg-black/60 px-8 py-3 rounded-full backdrop-blur-md border border-white/5">
                Enfoque el código ZF
              </p>
            </div>

            {/* 🧪 4. BOTÓN DE SIMULACIÓN (TEST) */}
            <div className="absolute bottom-28 md:bottom-10 left-0 right-0 flex justify-center z-30 pointer-events-auto">
              <button 
                // Aquí le pasamos un ID que sepas que existe en tu BD (ej. '1')
                onClick={() => handleScanLogic('1')}
                className="flex items-center gap-2 bg-[#0070BC]/80 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl text-white hover:bg-[#0070BC] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,112,188,0.4)]"
              >
                <Beaker size={18} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Simular Escaneo (ID: 1)</span>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLAS DE ESTADO PARA SEGURIDAD */}
        {status === 'verifying' && loading && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-[100]">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={50} />
            <p className="font-black uppercase tracking-widest text-xs opacity-60 italic">Consultando ZF Cloud...</p>
          </div>
        )}

        {status === 'denied' && (
          <div className="absolute inset-0 bg-red-600 z-[100] flex flex-col items-center justify-center p-12 text-white text-center">
            <ShieldAlert size={80} className="mb-6" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Acceso Denegado</h2>
            <p className="mt-4 font-bold opacity-80">{errorDetail}</p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-red-600 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">Reintentar</button>
          </div>
        )}

        {status === 'approved' && (
          <div className="absolute inset-0 bg-[#28B4AD] z-[110] flex flex-col items-center justify-center p-12 text-white text-center">
            <CheckCircle size={90} className="mb-6 animate-pulse" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Pase Válido</h2>
            <p className="mt-2 font-black uppercase tracking-widest text-[10px] opacity-80">Activo liberado para salida</p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-[#28B4AD] rounded-[30px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">Listo</button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ScannerPage;