import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const ScannerCamera = ({ onScanSuccess, onScanError }) => {
  
  const handleScan = (detectedCodes) => {
    // La librería devuelve un arreglo de códigos detectados
    if (detectedCodes && detectedCodes.length > 0) {
      const codigoLeido = detectedCodes[0].rawValue;
      
      // Feedback físico si el celular lo soporta
      if (navigator.vibrate) navigator.vibrate(200); 
      
      onScanSuccess(codigoLeido);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      
      {/* 1. EL MOTOR NUEVO (React QR Scanner) */}
      <Scanner 
        onScan={handleScan}
        onError={(err) => {
          console.error(err);
          if (onScanError) onScanError(err);
        }}
        formats={['qr_code']} // Forzamos que ignore barras y busque solo QR
        components={{
          audio: false,  // Apagamos el "beep" molesto por defecto
          finder: false, // Apagamos su cuadro blanco feo para usar tu diseño ZF
        }}
        styles={{
          container: { width: '100%', height: '100%' },
          video: { objectFit: 'cover' } // Mantiene la proporción perfecta del lente
        }}
      />
      
      {/* 2. TU DISEÑO ZF (Intacto) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        
        {/* El cuadro oscuro con el hueco en el centro */}
        <div className="relative w-64 h-64 rounded-[30px] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-2 ring-white/10">
          
          {/* Esquinas azules */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#0070BC] rounded-tl-[25px]"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#0070BC] rounded-tr-[25px]"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#0070BC] rounded-bl-[25px]"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#0070BC] rounded-br-[25px]"></div>
          
          {/* Láser animado */}
          <div className="absolute w-full h-[2px] bg-[#0070BC] shadow-[0_0_15px_#0070BC] top-0 animate-scan-line"></div>
        </div>
      </div>
    </div>
  );
};

export default ScannerCamera;