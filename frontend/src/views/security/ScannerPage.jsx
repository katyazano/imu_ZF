import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Loader2, Beaker, ArrowLeft, LogOut, LogIn } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ScannerCamera from '../../components/ScannerCamera'; // Asumo que creaste este componente aparte

const ScannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Recuperamos useLocation
  
  const [status, setStatus] = useState('scanning'); 
  const [errorDetail, setErrorDetail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('checkout'); // 'checkout' | 'checkin'

  const rolActivo = parseInt(localStorage.getItem('rol')) || 2;
  
  // 👈 Recuperamos la ruta inteligente que manda el Navbar
  const targetPath = location.state?.targetPath || '/activos';

  const handleScanLogic = async (scannedQr) => {
    if (rolActivo === 6) {
      // 1. Seguridad (Rol 6) - Ejecuta el registro en bitácora
      await procesarEscaneoGuardia(scannedQr);
    } else {
      // 2. Usuarios, Gerentes, S&R, Auditores
      // Usamos el buscador inteligente para redirigir a la tabla correcta
      navigate(`${targetPath}?q=${encodeURIComponent(scannedQr)}`);
    }
  };

  const procesarEscaneoGuardia = async (qrCodigo) => {
    setLoading(true);
    setStatus('verifying');

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const endpoint = scanMode === 'checkout' ? '/bitacora/checkout' : '/bitacora/checkin';

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qr_codigo: qrCodigo })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.mensaje); 
        setStatus('approved');
      } else {
        setErrorDetail(data.error || 'Operación denegada por el servidor');
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

      <main className="flex-1 relative flex flex-col w-full h-full">
        
        {status === 'scanning' && (
          <>
            {/* 1. EL MOTOR DEL SCANNER */}
            <div className="absolute inset-0 z-0">
              <ScannerCamera onScanSuccess={handleScanLogic} />
            </div>

            {/* 2. HEADER FLOTANTE: Ajustado con justify-center para el Guardia */}
            <div className={`absolute top-20 md:top-24 left-0 right-0 px-6 z-20 flex items-center ${rolActivo === 6 ? 'justify-center' : 'justify-start'}`}>
              
              {rolActivo !== 6 && (
                <button 
                  onClick={() => navigate(-1)} 
                  className="bg-black/40 backdrop-blur-xl p-4 rounded-full text-white border border-white/10 active:scale-90 transition-transform shadow-2xl"
                >
                  <ArrowLeft size={24} />
                </button>
              )}

              {/* SELECTOR DE MODO (SOLO PARA GUARDIA) */}
              {rolActivo === 6 && (
                <div className="flex bg-black/50 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl">
                  <button 
                    onClick={() => setScanMode('checkout')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === 'checkout' ? 'bg-[#0070BC] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    <LogOut size={16} /> Salida
                  </button>
                  <button 
                    onClick={() => setScanMode('checkin')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === 'checkin' ? 'bg-[#28B4AD] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    <LogIn size={16} /> Entrada
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 z-10 pointer-events-none"></div>

            {/* 4. CONTENEDOR INFERIOR */}
            <div className="z-30 flex flex-col items-center gap-4 px-4 w-full pb-[110px] lg:pb-12 pointer-events-none">
              <div className="w-full flex justify-center">
                <p className="text-white text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] bg-black/60 px-6 md:px-8 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-xl text-center max-w-[90%]">
                  {rolActivo === 6 
                    ? (scanMode === 'checkout' ? 'Escanea QR para Salida' : 'Escanea QR para Entrada') 
                    : 'Enfoque el código ZF'}
                </p>
              </div>

              {/* BOTÓN DE SIMULACIÓN */}
              <button 
                onClick={() => handleScanLogic('ZF-001')} // Puedes cambiar este ID simulado según tu BD
                className={`pointer-events-auto flex items-center justify-center gap-2 backdrop-blur-xl border border-white/20 px-6 py-4 md:py-5 rounded-[25px] text-white transition-all active:scale-95 shadow-2xl w-[80%] max-w-[320px]
                  ${scanMode === 'checkin' ? 'bg-[#28B4AD]/80 hover:bg-[#28B4AD]' : 'bg-[#0070BC]/80 hover:bg-[#0070BC]'}`}
              >
                <Beaker size={18} className="animate-pulse" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                  Simular {scanMode === 'checkout' ? 'Salida' : 'Entrada'}
                </span>
              </button>
            </div>
          </>
        )}

        {/* --- PANTALLAS DE ESTADO --- */}
        {status === 'verifying' && loading && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-[100] backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={50} />
            <p className="font-black uppercase tracking-widest text-[10px] opacity-60 italic">
              Procesando {scanMode === 'checkout' ? 'Salida' : 'Entrada'}...
            </p>
          </div>
        )}

        {status === 'denied' && (
          <div className="absolute inset-0 bg-red-600 z-[100] flex flex-col items-center justify-center p-12 text-white text-center">
            <ShieldAlert size={80} className="mb-6" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Acceso Denegado</h2>
            <p className="mt-4 font-bold opacity-90 text-sm leading-relaxed">{errorDetail}</p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-red-600 rounded-[30px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">
              Escanear de nuevo
            </button>
          </div>
        )}

        {status === 'approved' && (
          <div className="absolute inset-0 bg-[#28B4AD] z-[110] flex flex-col items-center justify-center p-12 text-white text-center">
            <CheckCircle size={90} className="mb-6 animate-pulse" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              {scanMode === 'checkout' ? 'Buen Viaje' : 'Bienvenido'}
            </h2>
            <p className="mt-4 font-black uppercase tracking-widest text-xs opacity-90">
              {successMsg}
            </p>
            <button onClick={() => setStatus('scanning')} className="mt-12 w-full max-w-xs py-5 bg-white text-[#28B4AD] rounded-[30px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">
              Finalizar
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ScannerPage;