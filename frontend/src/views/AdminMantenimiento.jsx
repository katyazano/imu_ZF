import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminMantenimiento = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // --- NOTA PARA BACKEND: Este array vendrá de un fetch(GET) a la tabla de mantenimientos ---
  const [mantenimientos, setMantenimientos] = useState([
    { 
      id: '100001', 
      nombre: 'GammaTech Modelo B1', 
      motivo: 'Falla de calibración.', 
      fecha: '18/02/2026', 
      dias: '4 días en mantenimiento' 
    },
    { 
      id: '100023', 
      nombre: 'BetaWorks HIL-1000', 
      motivo: 'Sobrecalentamiento.', 
      fecha: '02/02/2026', 
      dias: '20 días en mantenimiento' 
    }
  ]);

  const handleLiberar = (id) => {
    // --- NOTA PARA BACKEND: Aquí se debe hacer un fetch(PATCH/PUT) para cambiar el estado del activo a 'Disponible' ---
    console.log("Liberando activo con ID:", id);
    
    // Simulación: Quitamos el activo de la lista local
    setMantenimientos(mantenimientos.filter(item => item.id !== id));
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />
      
      <main className="p-6 flex-1">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold mb-4">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>

        <h1 className="text-3xl font-black text-gray-900 leading-none">Mantenimientos activos</h1>
        <div className="w-12 h-1.5 bg-[#0070BC] mt-2 mb-8"></div>

        {/* Banner de Total de Incidencias */}
        <div className="bg-[#D1E9FF]/50 rounded-[20px] p-6 mb-8 shadow-sm flex flex-col items-center">
          <span className="text-5xl font-black text-gray-900">{mantenimientos.length}</span>
          <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter mt-1">Total de incidencias</span>
        </div>

        {/* Lista de Activos en Mantenimiento */}
        <div className="space-y-5">
          {mantenimientos.map((item) => (
            <div key={item.id} className="border-2 border-gray-100 rounded-[25px] p-5 shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div className="w-3/4">
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{item.nombre}</h3>
                  <p className="text-gray-400 text-xs font-bold mt-1 uppercase">ID: {item.id}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xs font-bold text-gray-800"><span className="text-gray-400 uppercase">Motivo:</span> {item.motivo}</p>
                <p className="text-xs font-bold text-gray-800"><span className="text-gray-400 uppercase">Fecha de reporte:</span> {item.fecha}</p>
                <p className="text-[10px] font-bold text-orange-400 italic mt-1 uppercase tracking-wider">{item.dias}</p>
              </div>

              <button 
                onClick={() => handleLiberar(item.id)}
                className="w-full mt-4 bg-[#0070BC] text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
              >
                Liberar Activo
              </button>
            </div>
          ))}

          {mantenimientos.length === 0 && (
            <div className="text-center py-10">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-2" />
              <p className="text-gray-400 font-bold italic">No hay mantenimientos pendientes.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle size={60} className="text-[#0070BC] mb-4" />
            <h2 className="text-2xl font-black text-gray-900 text-center leading-tight">Activo Liberado</h2>
            <p className="text-gray-400 text-xs text-center mt-2">El equipo ahora aparece como "Disponible" en el inventario.</p>
            <button 
              onClick={() => setShowSuccess(false)} 
              className="mt-8 bg-[#0070BC] text-white px-8 py-3 rounded-2xl font-bold w-full"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMantenimiento;