import React, { useState } from 'react';
import { ArrowLeft, Search, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';

const ValidarSolicitudes = () => {
  const [filtro, setFiltro] = useState('Pendientes');

  const solicitudes = [
    { id: 1, user: 'Ana García', asset: 'GammaTech Modelo B1', date: '14/02/2026', returnDate: '30/05/2026' },
    { id: 2, user: 'Luis Rodriguez', asset: 'BetaWorks Serie X300', date: '15/02/2026', returnDate: '20/05/2026' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="px-6 mt-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Validar solicitud" 
            className="w-full bg-gray-50 rounded-full py-3 pl-12 pr-4 text-sm font-bold outline-none border-2 border-gray-100 focus:border-[#0070BC]" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {['Pendientes', 'Aceptadas', 'Rechazadas'].map(f => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${filtro === f ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {solicitudes.map(sol => (
          <div key={sol.id} className="bg-[#F8FBFF] border-2 border-blue-50 rounded-[30px] p-6 relative">
            <div className="mb-4">
              <h3 className="text-sm font-black text-gray-900 uppercase italic leading-tight">{sol.user}</h3>
              <p className="text-[10px] font-bold text-gray-500">Solicita {sol.asset}</p>
            </div>
            <div className="space-y-1 mb-6 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
              <p>Fecha de solicitud: {sol.date}</p>
              <p>Fecha de devolución: {sol.returnDate}</p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-3 border-2 border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50">Rechazar</button>
              <button className="flex-1 py-3 bg-[#0070BC] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">Aceptar</button>
            </div>
            <span className="absolute top-6 right-8 text-[8px] font-black text-gray-300 uppercase italic">Pendiente</span>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ValidarSolicitudes;