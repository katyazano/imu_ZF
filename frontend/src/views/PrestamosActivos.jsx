import React from 'react';
import Navbar from '../components/Navbar';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrestamosActivos = () => {
  const navigate = useNavigate();

  const prestamos = [
    { id: 'P-9901', activo: 'Laptop Dell Latitude', usuario: 'Juan Pérez', fecha: '2024-02-20' },
    { id: 'P-9902', activo: 'Multímetro Fluke', usuario: 'Ana García', fecha: '2024-02-21' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold mb-4">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>
        
        <h1 className="text-3xl font-black text-gray-900">Préstamos Activos</h1>
        <div className="w-16 h-1.5 bg-[#0070BC] mt-1 mb-8"></div>

        <div className="space-y-4">
          {prestamos.map((p) => (
            <div key={p.id} className="bg-gray-50 p-5 rounded-[20px] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{p.activo}</h3>
                  <p className="text-sm text-gray-500">Solicitante: {p.usuario}</p>
                </div>
                <span className="text-xs font-mono bg-blue-100 text-[#0070BC] px-2 py-1 rounded-md">{p.id}</span>
              </div>
              <div className="mt-4 flex items-center text-gray-400 text-xs font-bold">
                <Clock size={14} className="mr-1" /> PRESTADO EL: {p.fecha}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrestamosActivos;