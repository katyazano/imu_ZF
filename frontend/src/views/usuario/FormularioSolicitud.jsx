import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ModalExito from '../../components/ModalExito';

const FormularioSolicitud = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Datos del activo con fallback seguro
  const activo = location.state?.activo || { 
    id_activo: 0, 
    nombre_maquina: "Desconocido", 
    tag: "N/A"
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. Estado unificado (Aseguramos que coincida exactamente con las opciones del Radio)
  const [formData, setFormData] = useState({
    tipo_salida: 'Con retorno', 
    transporte: '',
    destino: '',
    fecha_salida: '',
    fecha_devolucion: ''
  });

  // 3. Obtener la fecha de hoy para bloquear fechas pasadas en el calendario
  const hoy = new Date().toISOString().split('T')[0];

  // 4. Manejador centralizado de cambios (Best Practice en React)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL;
      
      const payload = {
        id_activo: activo.id_activo,
        tipo_salida: formData.tipo_salida,
        metodo_transporte: formData.transporte,
        fecha_salida_programada: formData.fecha_salida,
        // Si no es "Con retorno", enviamos null explícitamente
        fecha_devolucion_programada: formData.tipo_salida === 'Con retorno' ? formData.fecha_devolucion : null,
        id_destino: parseInt(formData.destino, 10) || null
      };

      const response = await fetch(`${baseUrl}/solicitudes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Hubo un error al procesar tu solicitud.");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      {/* Header */}
      <header className="bg-[#0070BC] p-6 pt-10 pb-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform hover:opacity-80">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Nueva solicitud</h1>
      </header>

      <main className="px-6 -mt-8 flex-1">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100 relative z-10">
          
          {/* Ficha del Activo */}
          <div className="bg-gray-50 p-5 rounded-[25px] mb-8 space-y-1 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Nombre: <span className="text-gray-600">{activo.nombre_maquina}</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Tag: <span className="text-gray-600">{activo.tag || 'N/A'}</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">ID Sistema: <span className="text-gray-600">#{activo.id_activo}</span></p>
          </div>

          <form onSubmit={handleEnviar} className="space-y-8">
            
            {/* Tipo de salida */}
            <fieldset>
              <legend className="text-[#0070BC] font-black text-xs uppercase mb-4 italic tracking-widest">Tipo de salida</legend>
              <div className="space-y-3 pl-2">
                {['Con retorno', 'Sin retorno', 'Scrap (chatarra)'].map((opcion) => (
                  <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="tipo_salida"
                      value={opcion}
                      checked={formData.tipo_salida === opcion}
                      onChange={handleChange}
                      className="w-5 h-5 accent-[#0070BC]"
                    />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors">{opcion}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Advertencia EHS (Dinámica) */}
            {formData.tipo_salida === 'Scrap (chatarra)' && (
              <div className="bg-yellow-50 border-2 border-yellow-100 p-4 rounded-2xl flex gap-3 animate-in fade-in zoom-in duration-300">
                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                <p className="text-[9px] font-black text-yellow-700 uppercase leading-tight">
                  Atención: Esta salida requiere validación adicional del departamento de EHS.
                </p>
              </div>
            )}

            {/* Inputs de Texto/Número */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="transporte" className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">Transporte</label>
                <input 
                  id="transporte"
                  name="transporte"
                  required
                  type="text" 
                  placeholder="Ej. DHL o Auto"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC] transition-colors"
                  value={formData.transporte}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="destino" className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest ml-2">ID Destino</label>
                <input 
                  id="destino"
                  name="destino"
                  required
                  min="1"
                  type="number" 
                  placeholder="Ej. 1"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#0070BC] transition-colors"
                  value={formData.destino}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Calendarios */}
            <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100 space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#0070BC] uppercase">Salida:</span>
                <input 
                  name="fecha_salida"
                  required
                  type="date" 
                  min={hoy} // Previene fechas pasadas
                  className="w-full bg-white border-2 border-transparent focus:border-[#0070BC] p-3 pl-16 rounded-xl text-xs font-bold text-gray-500 outline-none shadow-sm transition-colors"
                  value={formData.fecha_salida}
                  onChange={handleChange}
                />
              </div>

              {/* Devolución Condicional */}
              {formData.tipo_salida === 'Con retorno' && (
                <div className="relative animate-in slide-in-from-top-2 fade-in duration-300">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#0070BC] uppercase">Retorno:</span>
                  <input 
                    name="fecha_devolucion"
                    required
                    type="date" 
                    min={formData.fecha_salida || hoy} // La devolución no puede ser antes de la salida
                    className="w-full bg-white border-2 border-transparent focus:border-[#0070BC] p-3 pl-16 rounded-xl text-xs font-bold text-gray-500 outline-none shadow-sm transition-colors"
                    value={formData.fecha_devolucion}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* Botón de Envío */}
            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${
                  loading ? 'bg-blue-300 text-white cursor-not-allowed shadow-none' : 'bg-[#0070BC] text-white shadow-blue-200 active:scale-95 hover:bg-blue-700'
                }`}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Procesando...' : 'Confirmar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ModalExito 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/mis-solicitudes');
        }} 
      />
    </div>
  );
};

export default FormularioSolicitud;