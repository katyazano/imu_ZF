import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';

const HistorialActivo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [filtro, setFiltro] = useState('Todos');

  const historial = [
    { id: 1, user: 'Ana García', fecha: 'Hace 3 días', estado: 'Aceptada', msg: 'Devolvió el activo' },
    { id: 2, user: 'Pedro Martínez', fecha: '07/02/2026', estado: 'Rechazada', msg: 'Venció su fecha de devolución' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="px-6 mt-8">
        <button onClick={() => navigate(-1)} className="text-[#0070BC] mb-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center italic uppercase tracking-tighter">Historial</h1>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 justify-center">
          {['Todos', 'Aceptadas', 'Rechazadas'].map(f => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 transition-all ${
                filtro === f ? 'bg-[#0070BC] border-[#0070BC] text-white' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {historial.map(item => (
          <div key={item.id} className="border-2 border-gray-100 rounded-[30px] p-6 flex items-start gap-4">
            <div className={`p-2 rounded-xl ${item.estado === 'Aceptada' ? 'bg-green-50' : 'bg-orange-50'}`}>
              {item.estado === 'Aceptada' ? 
                <CheckCircle size={20} className="text-green-500" /> : 
                <AlertTriangle size={20} className="text-orange-400" />
              }
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-black text-gray-800">{item.user}</h3>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{item.fecha}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 leading-tight">
                {item.msg} <br />
                <span className="text-gray-400 italic">BetaWorks Serie X300</span>
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default HistorialActivo;