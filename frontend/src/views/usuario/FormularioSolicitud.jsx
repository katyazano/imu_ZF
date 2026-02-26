import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ModalExito from '../../components/ModalExito';

const FormularioSolicitud = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoSalida, setTipoSalida] = useState('retorno');

  // Datos fijos del diseño
  const activo = {
    nombre: "BetaWorks Serie X300",
    tag: "MNR-ADAS-0001",
    gerente: "Juan Perez"
  };

  const handleEnviar = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      {/* Header con flecha de volver */}
      <div className="bg-[#0070BC] p-6 pt-10 pb-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Nueva solicitud</h1>
      </div>

      <main className="px-6 -mt-8 flex-1">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
          
          {/* Ficha técnica del activo (Gris en el diseño) */}
          <div className="bg-gray-50 p-5 rounded-[25px] mb-8 space-y-1">
            <p className="text-[10px] font-bold text-gray-400">Nombre: <span className="text-gray-600">{activo.nombre}</span></p>
            <p className="text-[10px] font-bold text-gray-400">Tag: <span className="text-gray-600">{activo.tag}</span></p>
            <p className="text-[10px] font-bold text-gray-400">Gerente responsable: <span className="text-gray-600">{activo.gerente}</span></p>
          </div>

          <form onSubmit={handleEnviar} className="space-y-8">
            
            {/* Sección: Tipo de salida */}
            <div>
              <h3 className="text-[#0070BC] font-black text-xs uppercase mb-4 italic tracking-widest">Tipo de salida</h3>
              <div className="space-y-3 pl-2">
                {['Con retorno', 'Sin retorno', 'Scrap (chatarra)'].map((opcion) => (
                  <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="tipoSalida"
                      className="w-5 h-5 accent-[#0070BC]"
                      onChange={() => setTipoSalida(opcion.toLowerCase())}
                    />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800">{opcion}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advertencia dinámica para Scrap */}
            {tipoSalida.includes('scrap') && (
              <div className="bg-yellow-50 border-2 border-yellow-100 p-4 rounded-2xl flex gap-3 animate-in fade-in zoom-in duration-300">
                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                <p className="text-[9px] font-black text-yellow-700 uppercase leading-tight">
                  Atención: Esta salida requiere validación adicional del departamento de EHS.
                </p>
              </div>
            )}

            {/* Sección: ¿Sale de la empresa? */}
            <div>
              <h3 className="text-[#0070BC] font-black text-xs uppercase mb-4 italic tracking-widest">¿El equipo sale de la empresa?</h3>
              <div className="flex gap-10 pl-2">
                {['No', 'Si'].map((val) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="saleEmpresa" className="w-5 h-5 accent-[#0070BC]" />
                    <span className="text-sm font-bold text-gray-500">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Inputs de Transporte y Destino */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">Tipo de transporte</label>
                <input type="text" placeholder="DHL" className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC]" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">Destino</label>
                <input type="text" placeholder="Universidad Tecmilenio" className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC]" />
              </div>
            </div>

            {/* Selector de Fechas (Diseño de cápsula azul) */}
            <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100">
              <p className="text-[#0070BC] font-black text-[10px] uppercase mb-4 text-center tracking-[0.2em]">Fechas</p>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase">Sale:</span>
                  <input type="date" className="w-full bg-white border-2 border-gray-50 p-3 pl-14 rounded-xl text-xs font-bold text-gray-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-[11px] font-black uppercase text-gray-400 active:scale-95 transition-all">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-4 bg-[#0070BC] text-white rounded-2xl text-[11px] font-black uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all">
                Enviar
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de Éxito */}
      <ModalExito isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default FormularioSolicitud;