import React, { useState, useEffect } from 'react';
import { X, Briefcase, Loader2, CheckCircle } from 'lucide-react';

const AsignarProyectoModal = ({ isOpen, onClose, onConfirm, assetName, loading }) => {
  const [proyectos, setProyectos] = useState([]);
  const [formData, setFormData] = useState({ id_proyecto: '' });

  useEffect(() => {
    if (isOpen) {
      const fetchProyectos = async () => {
        try {
          const token = localStorage.getItem('token');
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
          
          const response = await fetch(`${baseUrl}/proyectos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          const projectsList = Array.isArray(data) ? data : (data.data || []);
          setProyectos(projectsList);
        } catch (err) {
          console.error("Error al cargar centros de costo", err);
        }
      };
      fetchProyectos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6 bg-gray-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Asignar Proyecto</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Equipo: {assetName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 active:scale-90 transition-transform">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6">
          {/* SELECT DE PROYECTO / CENTRO DE COSTO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#0070BC] ml-4 italic tracking-widest">
              Seleccionar Destino
            </label>
            <div className="relative">
              <Briefcase className="absolute left-5 top-4 text-gray-300" size={20} />
              <select 
                className="w-full bg-gray-50 border-2 border-transparent rounded-[25px] py-4 pl-14 pr-6 font-bold text-sm text-gray-700 outline-none focus:border-blue-100 transition-all appearance-none"
                value={formData.id_proyecto}
                onChange={(e) => setFormData({ id_proyecto: e.target.value })}
              >
                <option value="">Buscar proyecto o CC...</option>
                {proyectos.map(p => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            disabled={loading || !formData.id_proyecto}
            onClick={() => onConfirm(formData)}
            className="w-full bg-[#0070BC] text-white py-5 mt-4 rounded-[28px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-100 disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            Confirmar Asignación
          </button>
        </div>

        <p className="mt-8 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
          ZF Logistics • Internal Use Only
        </p>
      </div>
    </div>
  );
};

export default AsignarProyectoModal;