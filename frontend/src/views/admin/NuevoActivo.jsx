import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Camera } from 'lucide-react';
import Navbar from '../../components/Navbar';

const NuevoActivo = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // --- NOTA PARA BACKEND: Este objeto se enviará en el POST ---
  const [formData, setFormData] = useState({
    Nombre: '',
    Tag: '',
    Modelo: '',
    Marca: '',
    área: '',
    subárea: '',
    categoria: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // --- NOTA PARA BACKEND: Aquí va la petición POST /activos ---
    console.log("Creando nuevo activo:", formData);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />
      <main className="p-8 flex-1">
        <button onClick={() => navigate(-1)} className="text-[#0070BC] mb-4 flex items-center font-bold">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>
        
        <h1 className="text-3xl font-black text-gray-900 leading-none">Nuevo Activo</h1>
        <div className="w-12 h-1.5 bg-[#0070BC] mt-2 mb-8"></div>

        <div className="flex flex-col items-center mb-8">
           <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
              <Camera size={32} />
              <span className="text-xs font-bold mt-2">Subir fotografía del equipo</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-gray-400 uppercase ml-1">{key}:</label>
              <input 
                required
                type="text"
                placeholder={`Ingresa ${key}...`}
                value={formData[key]}
                onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-[#0070BC] transition-all"
              />
            </div>
          ))}
          
          <button 
            type="submit" 
            className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black text-lg shadow-lg mt-6 active:scale-95 transition-transform"
          >
            REGISTRAR EQUIPO
          </button>
        </form>
      </main>

      {/* MODAL DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in slide-in-from-bottom duration-300">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <CheckCircle size={60} className="text-[#0070BC]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center">Se agregó con éxito</h2>
            <p className="text-gray-400 text-sm text-center mt-2 font-medium">El activo ya está disponible en el catálogo.</p>
            <button 
              onClick={() => navigate('/activos')} 
              className="mt-8 bg-[#0070BC] text-white px-8 py-3 rounded-2xl font-bold w-full"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoActivo;