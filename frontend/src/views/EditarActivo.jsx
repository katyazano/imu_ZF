import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, X, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const EditarActivo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // --- NOTA PARA BACKEND: Inicializar estos datos con el GET del activo por ID ---
  const [formData, setFormData] = useState({
    nombre: 'BetaWorks Serie X300',
    marca: 'BetaWorks',
    modelo: 'Serie X300',
    serie: 'SN41116573584',
    parte: '-----',
    ubicacion: 'Validación HIL - A0001',
    categoria: 'Línea de producción'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // --- NOTA PARA BACKEND: Aquí va la petición PUT/PATCH ---
    console.log("Enviando actualización:", formData);
    
    // Simulamos respuesta exitosa del servidor
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />
      <form onSubmit={handleSubmit} className="p-8 flex flex-col flex-1">
        <button onClick={() => navigate(-1)} className="text-[#0070BC] mb-4 flex items-center font-bold">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>
        <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Editar Activo</h1>
        
        <div className="w-full space-y-5">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">{key}:</label>
              <input 
                type="text"
                value={formData[key]}
                onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 font-bold outline-none focus:border-[#0070BC] transition-all"
              />
            </div>
          ))}
        </div>

        <div className="flex w-full gap-4 mt-10">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 font-bold text-gray-400">Cancelar</button>
          <button type="submit" className="flex-1 bg-[#0070BC] text-white py-3 rounded-xl font-bold shadow-lg">Guardar</button>
        </div>
      </form>

      {/* MODAL DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle size={60} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center">Registro exitoso</h2>
            <button 
              onClick={() => navigate('/activos')} 
              className="mt-8 bg-[#0070BC] text-white px-8 py-3 rounded-2xl font-bold w-full"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarActivo;