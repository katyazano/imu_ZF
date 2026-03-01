import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, X, ShieldCheck, Loader2, Save, Check, Settings2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const GestionarFirmas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados alineados a la BD
  const [reglas, setReglas] = useState([]);
  const [reglaSeleccionada, setReglaSeleccionada] = useState(null);
  
  // Toggles booleanos que espera tu backend
  const [toggles, setToggles] = useState({
    requiere_gerente: false,
    requiere_syr: false,
    requiere_ehs: false
  });

  const fetchReglas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      // ✅ Usamos el endpoint oficial del Módulo 6
      const response = await fetch(`${baseUrl}/reglas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setReglas(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar reglas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReglas();
  }, []);

  const abrirModalConfiguracion = (regla) => {
    setReglaSeleccionada(regla);
    // Cargamos la configuración actual de la BD
    setToggles({
      requiere_gerente: regla.requiere_gerente || false,
      requiere_syr: regla.requiere_syr || false,
      requiere_ehs: regla.requiere_ehs || false
    });
    setShowModal(true);
  };

  const handleToggle = (campo) => {
    setToggles(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleConfirmarRegla = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // ✅ Usamos PATCH y mandamos los booleanos como pide el manual
      const res = await fetch(`${baseUrl}/reglas/${reglaSeleccionada.id_categoria}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(toggles)
      });

      if (res.ok) {
        setShowModal(false);
        fetchReglas(); // Recargamos para ver los cambios aplicados
      } else {
        alert("Hubo un problema al actualizar la regla.");
      }
    } catch (e) { 
      console.error(e); 
      alert("Error de conexión al servidor.");
    } finally {
      setSaving(false);
    }
  };

  // Componente visual para los interruptores
  const ToggleRow = ({ label, campo, description }) => {
    const isActive = toggles[campo];
    return (
      <div 
        onClick={() => handleToggle(campo)}
        className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 cursor-pointer transition-all ${
          isActive ? 'border-[#0070BC] bg-blue-50/50' : 'border-gray-100 bg-gray-50'
        }`}
      >
        <div>
          <p className={`font-black uppercase text-sm ${isActive ? 'text-[#0070BC]' : 'text-gray-800'}`}>
            {label}
          </p>
          <p className="text-[10px] font-bold text-gray-400 italic mt-1">{description}</p>
        </div>
        <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${isActive ? 'bg-[#0070BC]' : 'bg-gray-300'}`}>
          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-28">
      <Navbar />

      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
            Reglas de Aprobación
          </h1>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">
            Módulo de Configuración
          </p>
        </div>
      </div>

      <main className="px-6 -mt-10 flex-1">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-[40px] shadow-sm">
            <Loader2 className="animate-spin text-[#0070BC]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reglas.map((regla) => (
              <div key={regla.id_categoria} className="bg-white border border-gray-100 rounded-[30px] p-6 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 group-hover:text-[#0070BC] transition-colors">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase italic leading-tight">
                      {regla.nombre || `Categoría #${regla.id_categoria}`}
                    </h3>
                    
                    {/* Indicadores visuales de firmas activas */}
                    <div className="flex gap-2 mt-2">
                      {regla.requiere_gerente && <span className="text-[8px] bg-blue-100 text-[#0070BC] font-black uppercase px-2 py-1 rounded-md">Gerente</span>}
                      {regla.requiere_syr && <span className="text-[8px] bg-orange-100 text-orange-600 font-black uppercase px-2 py-1 rounded-md">Logística</span>}
                      {regla.requiere_ehs && <span className="text-[8px] bg-green-100 text-green-600 font-black uppercase px-2 py-1 rounded-md">EHS</span>}
                      {(!regla.requiere_gerente && !regla.requiere_syr && !regla.requiere_ehs) && (
                        <span className="text-[8px] bg-gray-100 text-gray-400 font-black uppercase px-2 py-1 rounded-md">Asignación Directa</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => abrirModalConfiguracion(regla)}
                  className="p-3 bg-gray-50 text-[#0070BC] rounded-xl active:scale-90 hover:bg-[#0070BC] hover:text-white transition-all shadow-sm"
                >
                  <Settings2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL CONFIGURADOR */}
      {showModal && reglaSeleccionada && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                  Firmas Obligatorias
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase italic">
                  {reglaSeleccionada.nombre}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <ToggleRow 
                label="Firma de Gerente" 
                campo="requiere_gerente" 
                description="Obliga al gerente del área a autorizar el préstamo." 
              />
              <ToggleRow 
                label="Firma de S&R (Logística)" 
                campo="requiere_syr" 
                description="Requiere liberación de almacén para control de tránsito." 
              />
              <ToggleRow 
                label="Firma de EHS" 
                campo="requiere_ehs" 
                description="Obligatorio para equipos que requieran validación ambiental." 
              />
            </div>

            <button 
              onClick={handleConfirmarRegla}
              disabled={saving}
              className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Configuración</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarFirmas;