import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const MisSolicitudes = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('Pendientes');

  const solicitudes = [
    { id: '001', activo: 'BetaWorks Serie X300', fecha: '24/02/2026', estado: 'Pendiente', color: 'text-blue-600 bg-blue-50' },
    { id: '002', activo: 'Epsilon Systems RAD-77G', fecha: '20/02/2026', estado: 'Aceptada', color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      <header className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-[#0070BC]"><ArrowLeft size={24} /></button>
          <div className="relative flex-1 ml-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar mis solicitudes..." className="w-full bg-gray-50 rounded-full py-2 pl-10 pr-4 text-xs font-bold outline-none border border-gray-100" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Mis solicitudes</h1>
      </header>

      <div className="flex gap-2 px-6 mt-6 overflow-x-auto no-scrollbar">
        {['Pendientes', 'Aceptadas', 'Rechazadas'].map((f) => (
          <button 
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${filtro === f ? 'bg-[#0070BC] border-[#0070BC] text-white' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="px-6 mt-8 space-y-4">
        {solicitudes.map((s) => (
          <div key={s.id} className="bg-gray-50/50 border-2 border-gray-100 rounded-[30px] p-6 relative">
            <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-tighter mb-1">Solicitud {s.id}</p>
            <h3 className="text-sm font-black text-gray-800 uppercase italic leading-tight mb-4">Solicitas {s.activo}</h3>
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Fecha: {s.fecha}</span>
            </div>
            <div className={`absolute bottom-6 right-6 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.color}`}>
              {s.estado}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default MisSolicitudes;