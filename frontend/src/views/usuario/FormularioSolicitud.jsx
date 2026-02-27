import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ModalExito from '../../components/ModalExito';

const FormularioSolicitud = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Recibimos los datos del activo desde la navegación
  const activo = location.state?.activo || { 
    id_activo: 0, 
    nombre_maquina: "Desconocido", 
    tag: "N/A", 
    gerente: "No asignado" 
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    tipo_salida: 'con retorno',
    sale_empresa: 'No',
    transporte: '',
    destino: '',
    fecha_salida: ''
  });

  const handleEnviar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/solicitudes/crear', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_activo: activo.id_activo,
          ...formData
        })
      });

      if (response.ok) {
        setIsModalOpen(true);
      } else {
        alert("Hubo un error al procesar tu solicitud.");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      <div className="bg-[#0070BC] p-6 pt-10 pb-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Nueva solicitud</h1>
      </div>

      <main className="px-6 -mt-8 flex-1">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
          
          <div className="bg-gray-50 p-5 rounded-[25px] mb-8 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Nombre: <span className="text-gray-600">{activo.nombre_maquina}</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Tag: <span className="text-gray-600">{activo.tag || 'N/A'}</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">ID Sistema: <span className="text-gray-600">#{activo.id_activo}</span></p>
          </div>

          <form onSubmit={handleEnviar} className="space-y-8">
            {/* Tipo de salida */}
            <div>
              <h3 className="text-[#0070BC] font-black text-xs uppercase mb-4 italic tracking-widest">Tipo de salida</h3>
              <div className="space-y-3 pl-2">
                {['Con retorno', 'Sin retorno', 'Scrap (chatarra)'].map((opcion) => (
                  <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="tipo_salida"
                      checked={formData.tipo_salida === opcion.toLowerCase()}
                      className="w-5 h-5 accent-[#0070BC]"
                      onChange={() => setFormData({...formData, tipo_salida: opcion.toLowerCase()})}
                    />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800">{opcion}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advertencia EHS */}
            {formData.tipo_salida.includes('scrap') && (
              <div className="bg-yellow-50 border-2 border-yellow-100 p-4 rounded-2xl flex gap-3 animate-in fade-in zoom-in duration-300">
                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                <p className="text-[9px] font-black text-yellow-700 uppercase leading-tight">
                  Atención: Requiere validación de EHS.
                </p>
              </div>
            )}

            {/* Inputs dinámicos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">Transporte</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC]"
                  value={formData.transporte}
                  onChange={(e) => setFormData({...formData, transporte: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">Destino</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC]"
                  value={formData.destino}
                  onChange={(e) => setFormData({...formData, destino: e.target.value})}
                />
              </div>
            </div>

            {/* Fecha */}
            <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#0070BC] uppercase">Fecha Salida:</span>
                <input 
                  required
                  type="date" 
                  className="w-full bg-white border-2 border-transparent focus:border-[#0070BC] p-3 pl-24 rounded-xl text-xs font-bold text-gray-500 outline-none"
                  onChange={(e) => setFormData({...formData, fecha_salida: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button disabled={loading} type="submit" className="flex-1 py-4 bg-[#0070BC] text-white rounded-2xl text-[11px] font-black uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Enviando...' : 'Confirmar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ModalExito 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/categorias');
        }} 
      />
    </div>
  );
};

export default FormularioSolicitud;