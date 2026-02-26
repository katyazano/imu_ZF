import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, ShieldAlert, CheckCircle, X} from 'lucide-react';
import Navbar from '../../components/Navbar';

const Scanner = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('scanning'); 
  const [errorDetail, setErrorDetail] = useState('');
  const [userRole] = useState('security'); 

  // --- LÓGICA DE ESCANEO REAL ---
  useEffect(() => {
    // Solo inicializamos el scanner si estamos en modo 'scanning'
    if (status === 'scanning') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 // Mantiene el video cuadrado
      });

      scanner.render((decodedText) => {
        // Al detectar cualquier QR, ejecutamos tu lógica de roles
        handleScanLogic(decodedText); 
        scanner.clear(); // Detenemos la cámara tras leer con éxito
      }, (error) => {
        // Error silencioso mientras busca el QR
      });

      // Limpieza al desmontar el componente
      return () => {
        scanner.clear().catch(error => console.error("Error al limpiar scanner", error));
      };
    }
  }, [status]);

  const handleScanLogic = (scannedId) => {
    // 1. Redirección por roles
    if (userRole === 'auditor') {
      navigate(`/auditor/trazabilidad/${scannedId}`);
      return;
    } else if (userRole === 'admin' || userRole === 'gerente' || userRole === 'user') {
      navigate(`/activo/${scannedId}`);
      return;
    }

    // 2. Lógica de Seguridad (Aprobación/Bloqueo)
    if (userRole === 'security') {
      if (scannedId === 'ERROR') {
        setErrorDetail('Falta la firma del Gerente de Planta');
        setStatus('denied');
      } else {
        setStatus('approved');
      }
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col font-sans overflow-hidden">
      <Navbar />

      <main className="flex-1 relative flex flex-col items-center justify-center">
        
        {status === 'scanning' && (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            
            {/* CONTENEDOR DE CÁMARA REAL */}
            <div className="absolute inset-0 z-0">
               <div id="reader" className="w-full h-full object-cover"></div>
            </div>

            {/* Frame de Escaneo (Capa Superior) */}
            <div className="relative z-10 w-72 h-72 border-2 border-white/20 rounded-[40px] flex items-center justify-center overflow-hidden pointer-events-none">
              <div className="absolute inset-0 border-[4px] border-[#0070BC] animate-pulse opacity-30"></div>
              
              {/* Esquinas de enfoque */}
              <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#0070BC] rounded-tl-xl"></div>
              <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#0070BC] rounded-tr-xl"></div>
              <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#0070BC] rounded-bl-xl"></div>
              <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#0070BC] rounded-br-xl"></div>
            </div>

            <p className="z-10 mt-10 bg-black/60 backdrop-blur-md px-8 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/10">
              Señala código QR para escanear
            </p>

            {/* Botones de Prueba (Siguen aquí por si no tienes un QR a la mano) */}
            <div className="z-10 absolute bottom-12 flex gap-6">
              <button onClick={() => handleScanLogic('ERROR')} className="px-6 py-2 bg-red-500/40 backdrop-blur-md border border-red-500 text-white text-[8px] font-black rounded-xl uppercase">Simular Bloqueo</button>
              <button onClick={() => handleScanLogic('ACTIVO-123')} className="px-6 py-2 bg-green-500/40 backdrop-blur-md border border-green-500 text-white text-[8px] font-black rounded-xl uppercase">Simular Éxito</button>
            </div>
          </div>
        )}

        {/* PANTALLA ROJA: RECHAZADO */}
        {status === 'denied' && (
          <div className="absolute inset-0 bg-red-600/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300 text-white">
            <ShieldAlert size={100} className="mb-6 animate-bounce" />
            <div className="text-center">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Faltan Firmas</h2>
               <div className="mt-4 bg-black/20 py-3 px-6 rounded-2xl">
                  <p className="text-sm font-bold uppercase tracking-widest">{errorDetail}</p>
               </div>
            </div>
            <button 
              onClick={() => setStatus('scanning')}
              className="mt-16 w-full max-w-xs py-5 bg-white text-red-600 rounded-[25px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* PANTALLA VERDE: APROBADO */}
        {status === 'approved' && (
          <div className="absolute inset-0 bg-[#28B4AD]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300 text-white">
            <CheckCircle size={100} className="mb-6" />
            <div className="text-center">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Aprobado</h2>
               <p className="font-black uppercase tracking-widest mt-2">Puede Salir</p>
               <div className="mt-6 opacity-80 font-bold italic text-xs">
                  Salida: {new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}
               </div>
            </div>
            <button 
              onClick={() => setStatus('scanning')}
              className="mt-16 w-full max-w-xs py-5 bg-white text-[#28B4AD] rounded-[25px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
            >
              Confirmar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scanner;