import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';

const GerenteDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <main className="px-6 mt-8 flex-1">
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center">Pendientes</h1>

        {/* Card Principal: Solicitudes Pendientes */}
        <button 
          onClick={() => navigate('/validar-solicitudes')}
          className="w-full bg-[#EBF5FF] p-6 rounded-[30px] flex items-center justify-between mb-6 shadow-sm active:scale-95 transition-all"
        >
          <div className="text-left">
            <span className="text-4xl font-black text-[#0070BC]">16</span>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Solicitudes pendientes</p>
          </div>
          <ChevronRight size={32} className="text-[#0070BC]" />
        </button>

        {/* Grid de Activos y Alertas */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-gray-100 rounded-[25px] p-5 text-center">
            <span className="text-3xl font-black text-gray-800">132</span>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">Activos</p>
          </div>
          <div className="border-2 border-gray-100 rounded-[25px] p-5 text-center">
            <span className="text-3xl font-black text-gray-800">4</span>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">Alertas</p>
          </div>
        </div>

        {/* Sección de Solicitudes Recientes */}
        <section>
          <h3 className="text-[#0070BC] font-black text-xs uppercase mb-4 tracking-widest">Solicitudes recientes</h3>
          <div className="space-y-3">
            {[
              { id: 1, user: 'Maria Aguilar', asset: 'BetaWorks Serie X300', status: 'Urgente' },
              { id: 2, user: 'Jorge Ramos', asset: 'Delta Instruments', status: 'Vence en 2 días' }
            ].map(sol => (
              <div key={sol.id} className="border-2 border-gray-50 rounded-2xl p-4 flex items-center gap-4">
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-gray-800">
                    <span className="text-[#0070BC]">{sol.user}</span> solicitó el activo <span className="font-black">{sol.asset}</span>
                  </p>
                  <span className="text-[9px] font-black text-red-500 uppercase italic">{sol.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botón Historial */}
                <button 
        onClick={() => navigate('/historial-activo/100001')} 
        className="w-full mt-8 flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-gray-100"
        >
        <div className="flex items-center gap-3">
            <FileText className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Ver historial del equipo</span>
        </div>
        <ChevronRight size={20} className="text-gray-300" />
        </button>
      </main>
    </div>
  );
};

export default GerenteDashboard;