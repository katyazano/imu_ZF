import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Loader2, Info } from 'lucide-react';

const ConfigurarReglasActivo = ({ isOpen, onClose, activoId, nombreActivo }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reglas, setReglas] = useState([]);

  // Roles que pueden ser parte del flujo de firmas
  const rolesFirmantes = [
    { id: 1, nombre: 'Administrador' },
    { id: 3, nombre: 'Gerente de Área' },
    { id: 4, nombre: 'Ingeniería' },
    { id: 7, nombre: 'Auditoría / Finanzas' }
  ];

  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Aquí harías un fetch a tu backend para traer las reglas actuales de este activoId
      // Por ahora simulamos que no tiene reglas especiales
      console.log("Cargando reglas para activo:", activoId);
    }
  }, [isOpen, activoId]);

  const toggleRol = (id) => {
    setRolesSeleccionados(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleGuardarReglas = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // Endpoint sugerido: POST o PUT /api/activos/:id/reglas
      const response = await fetch(`${baseUrl}/activos/${activoId}/reglas`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ roles: rolesSeleccionados })
      });

      if (response.ok) {
        onClose();
      } else {
        alert("Error al guardar las reglas de negocio");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header del Modal */}
        <div className="bg-[#0070BC] p-8 text-white">
          <div className="flex justify-between items-start mb-4">
            <ShieldCheck size={40} className="text-blue-200" />
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Reglas de Negocio</h2>
          <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
            Activo: {nombreActivo}
          </p>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
            <Info className="text-[#0070BC] shrink-0" size={18} />
            <p className="text-[10px] font-bold text-gray-500 leading-tight uppercase">
              Selecciona el orden de los departamentos que deben autorizar la salida física de este activo.
            </p>
          </div>

          <div className="space-y-3">
            {rolesFirmantes.map((rol) => (
              <button
                key={rol.id}
                onClick={() => toggleRol(rol.id)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-95 ${
                  rolesSeleccionados.includes(rol.id)
                    ? 'border-[#0070BC] bg-blue-50 text-[#0070BC]'
                    : 'border-gray-50 bg-gray-50/50 text-gray-400'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest">{rol.nombre}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  rolesSeleccionados.includes(rol.id) ? 'bg-[#0070BC] border-[#0070BC]' : 'border-gray-200'
                }`}>
                  {rolesSeleccionados.includes(rol.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleGuardarReglas}
            disabled={saving}
            className="w-full bg-[#0070BC] text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : 'Aplicar Restricciones'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurarReglasActivo;