import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

const AdminMantenimiento = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mantenimientos, setMantenimientos] = useState([]);

  // 1. CARGA DE DATOS REALES
  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        // Consultamos las incidencias que están en estatus 'Pendiente' o 'En Reparación'
        const response = await fetch(`${baseUrl}/mantenimientos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMantenimientos(data);
        }
      } catch (error) {
        console.error("Error cargando mantenimientos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMantenimientos();
  }, []);

  const handleLiberar = async (id_mantenimiento, id_activo) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${baseUrl}/mantenimientos/${id_mantenimiento}`, {
        method: 'PATCH', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_activo, estatus_reparacion: 'Resuelto' })
      });

      if (response.ok) {
        setMantenimientos(mantenimientos.filter(item => item.id_mantenimiento !== id_mantenimiento));
        setShowSuccess(true);
      } else {
        alert("Hubo un error al intentar liberar el equipo.");
      }
    } catch (error) {
      console.error("Error al liberar activo:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      {/* Header Estilo ZF */}
      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Mantenimiento</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        {/* Banner de Total (Letras Grandes) */}
        <div className="bg-white rounded-[30px] shadow-xl p-8 mb-8 border border-gray-100 flex flex-col items-center">
          <span className="text-6xl font-black text-[#0070BC] tracking-tighter">
            {loading ? <Loader2 className="animate-spin" /> : mantenimientos.length}
          </span>
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2">Incidencias Activas</span>
        </div>

        {/* Lista de Activos */}
        <div className="space-y-5">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0070BC]" size={40} /></div>
          ) : (
            mantenimientos.map((item) => (
              <div key={item.id_mantenimiento} className="bg-gray-50 border-2 border-gray-100 rounded-[30px] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg uppercase leading-tight italic">
                      {item.activo?.nombre_maquina || "Equipo ZF"}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest">
                      ID ACTIVO: {item.id_activo}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <Clock size={20} />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm font-bold text-gray-700">
                    <span className="text-gray-400 uppercase text-[10px] mr-1 block">Problema Reportado:</span>
                    {item.descripcion}
                  </p>
                  <p className="text-xs font-black text-[#0070BC] uppercase italic">
                    Reportado el: {new Date(item.fecha_reporte).toLocaleDateString()}
                  </p>
                </div>

                <button 
                  onClick={() => handleLiberar(item.id_mantenimiento, item.id_activo)}
                  className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  Liberar para Producción
                </button>
              </div>
            ))
          )}

          {!loading && mantenimientos.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              <CheckCircle size={50} className="text-green-500 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">Líneas operando al 100%</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center leading-tight uppercase italic">¡Liberado!</h2>
            <p className="text-gray-400 text-xs text-center mt-3 font-bold uppercase tracking-tight">El activo ha vuelto al inventario general.</p>
            <button 
              onClick={() => setShowSuccess(false)} 
              className="mt-8 bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm w-full uppercase tracking-widest shadow-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMantenimiento;