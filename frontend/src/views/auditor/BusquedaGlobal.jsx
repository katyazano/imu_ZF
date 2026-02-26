import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, History, AlertCircle, ScanLine } from 'lucide-react';
import Navbar from '../../components/Navbar';

const BusquedaGlobal = () => {
  const navigate = useNavigate();
  const [idBusqueda, setIdBusqueda] = useState('');
  const [error, setError] = useState(false);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (idBusqueda.trim().length > 3) {
      setError(false);
      navigate(`/auditor/trazabilidad/${idBusqueda}`);
    } else {
      setError(true);
    }
  };

  return (
    /* H-SCREEN + OVERFLOW-HIDDEN: Evita que el fondo se mueva con el Navbar */
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* CONTENEDOR CON SCROLL: El pb-40 asegura que el contenido suba y no se tape */}
      <div className="flex-1 overflow-y-auto">
        <main className="px-8 pt-20 pb-40 flex flex-col items-center justify-center min-h-full">
          
          {/* Icono y Título */}
          <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
            <div className="bg-blue-50 p-6 rounded-[40px] mb-6 shadow-sm">
              <History size={60} className="text-[#0070BC]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter text-center leading-tight">
              Búsqueda Global <br /> <span className="text-[#0070BC]">de Trazabilidad</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4 text-center">
              Ingresa el ID del activo para auditar
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <form onSubmit={handleBuscar} className="w-full max-w-sm space-y-4">
            <div className={`relative transition-all ${error ? 'shake-animation' : ''}`}>
              <div className={`flex items-center bg-gray-100 rounded-[28px] px-6 py-5 border-2 transition-all ${error ? 'border-red-400' : 'border-transparent focus-within:border-[#0070BC] shadow-inner'}`}>
                <Search size={22} className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Ej. 10001, 206-3..."
                  className="bg-transparent outline-none w-full text-lg font-black text-gray-800 placeholder-gray-300"
                  value={idBusqueda}
                  onChange={(e) => {
                      setIdBusqueda(e.target.value);
                      if(error) setError(false);
                  }}
                />
                <button type="button" className="ml-2 p-2 bg-white rounded-xl shadow-sm active:scale-90 transition-transform">
                  <Camera size={20} className="text-[#0070BC]" />
                </button>
              </div>
              
              {error && (
                <p className="text-red-500 text-[9px] font-black uppercase mt-3 ml-4 flex items-center gap-1 animate-bounce">
                  <AlertCircle size={12} /> ID inválido o muy corto
                </p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-[#0070BC] text-white py-5 rounded-[28px] font-black text-base uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <ScanLine size={22} />
              Consultar Historial
            </button>
          </form>

          {/* Tips de Auditoría - Ahora con margen superior para empujarlo hacia arriba */}
          <div className="mt-12 bg-gray-50 p-6 rounded-[35px] border border-gray-100 w-full max-w-sm">
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                💡 Tip de Auditoría
              </h4>
              <p className="text-[11px] text-gray-500 font-bold leading-relaxed italic opacity-80">
                  "Escanea el código QR pegado físicamente en el activo para una consulta inmediata."
              </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusquedaGlobal;