import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, ArrowLeft, Loader2, Beaker } from 'lucide-react';
import Navbar from '../../components/Navbar';

const Scanner = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('scanning'); 
  const [errorDetail, setErrorDetail] = useState('');
  const [loading, setLoading] = useState(false);

  const rolActivo = parseInt(localStorage.getItem('rol')) || 3; 

  useEffect(() => {
    let html5QrCode;
    if (status === 'scanning') {
      html5QrCode = new Html5Qrcode("reader");
      const config = { 
        fps: 25, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          html5QrCode.stop().then(() => {
            handleScanLogic(decodedText);
          }).catch(err => console.error(err));
        },
        () => {} 
      ).catch(err => console.error("Error cámara:", err));
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [status]);

  const handleScanLogic = (scannedId) => {
    if (rolActivo === 7) return navigate(`/auditor/trazabilidad/${scannedId}`);
    if ([1, 2, 3].includes(rolActivo)) return navigate(`/activo/${scannedId}`);
    if (rolActivo === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (scannedId === 'ERROR') {
          setErrorDetail('Falta autorización del Gerente de Planta');
          setStatus('denied');
        } else {
          setStatus('approved');
        }
      }, 800);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col font-sans overflow-hidden">
      {status === 'scanning' && <Navbar />}

      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        
        {status === 'scanning' && (
          <div className="w-full h-full relative">
            
            {/* 1. CÁMARA (FONDO TOTAL) */}
            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
               <div id="reader" className="w-full h-full"></div>
            </div>

            {/* 2. OVERLAY DE ENFOQUE (EL "DIM" CON HUECO) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
              
              {/* Contenedor del target con sombra gigante para el DIM */}
              <div className="relative w-72 h-72 rounded-[40px] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-[2px] ring-white/10">
                
                {/* ESQUINAS LÁSER (Sin líneas blancas) */}
                <div className="absolute top-0 left-0 w-14 h-14 border-t-[4px] border-l-[4px] border-[#0070BC] rounded-tl-[35px]"></div>
                <div className="absolute top-0 right-0 w-14 h-14 border-t-[4px] border-r-[4px] border-[#0070BC] rounded-tr-[35px]"></div>
                <div className="absolute bottom-0 left-0 w-14 h-14 border-b-[4px] border-l-[4px] border-[#0070BC] rounded-bl-[35px]"></div>
                <div className="absolute bottom-0 right-0 w-14 h-14 border-b-[4px] border-r-[4px] border-[#0070BC] rounded-br-[35px]"></div>
                
                {/* LÁSER DINÁMICO RESPONSIVE */}
                <div className="absolute w-full h-[2px] bg-[#0070BC] shadow-[0_0_15px_#0070BC] top-0 animate-scan-line"></div>
              </div>

              {/* Texto flotante debajo del cuadro */}
              <p className="mt-12 text-white/70 text-[10px] font-black uppercase tracking-[0.3em] bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                Escaneando Activo ZF
              </p>
            </div>

            {/* 3. CONTROLES (BOTÓN ATRÁS) */}
            <div className="absolute top-6 left-6 z-20">
               <button onClick={() => navigate(-1)} className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white border border-white/10 active:scale-90 transition-transform">
                  <ArrowLeft size={24} />
               </button>
            </div>

            {/* 4. BOTÓN DE PRUEBA */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-auto">
              <button 
                onClick={() => handleScanLogic('1')}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-white/40 hover:text-white transition-all active:scale-95"
              >
                <Beaker size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Simular Escaneo</span>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLAS DE CARGA / ÉXITO / ERROR (Sin cambios) */}
        {loading && (
           <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin text-[#0070BC] mb-4" size={50} />
              <p className="font-black uppercase tracking-widest text-xs opacity-60">Sincronizando...</p>
           </div>
        )}

        {status === 'denied' && (
          <div className="absolute inset-0 bg-red-600 z-[110] flex flex-col items-center justify-center p-12 text-white text-center">
            <ShieldAlert size={90} className="mb-6" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Bloqueado</h2>
            <p className="mt-4 font-bold opacity-90">{errorDetail}</p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-red-600 rounded-[30px] font-black uppercase tracking-widest shadow-2xl">Reintentar</button>
          </div>
        )}

        {status === 'approved' && (
          <div className="absolute inset-0 bg-[#28B4AD] z-[110] flex flex-col items-center justify-center p-12 text-white text-center">
            <CheckCircle size={90} className="mb-6" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Pase Válido</h2>
            <p className="mt-2 font-black uppercase tracking-widest text-[10px]">Salida Autorizada</p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-[#28B4AD] rounded-[30px] font-black uppercase tracking-widest shadow-2xl">Confirmar</button>
          </div>
        )}
      </main>

      <style>{`
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        #reader canvas { display: none !important; }

        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Scanner;