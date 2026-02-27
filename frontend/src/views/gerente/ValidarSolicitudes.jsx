import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Package, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const ValidarSolicitudes = () => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/solicitudes/gerente/pendientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendientes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendientes(); }, []);

  const handleDecision = async (id_firma, decision) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:4000/api/solicitudes/gerente/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_firma, decision })
      });
      // Refrescamos la lista
      fetchPendientes();
    } catch (error) {
      alert("Error al procesar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      <Navbar />
      
      <header className="bg-[#0070BC] px-6 pt-10 pb-16 shadow-lg">
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
          Validar Peticiones
        </h1>
        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-2 opacity-80">
          Tienes {pendientes.length} solicitudes esperando tu firma
        </p>
      </header>

      <main className="px-6 -mt-8 flex-1 space-y-4">
        {loading ? (
          <div className="bg-white p-10 rounded-[40px] text-center shadow-sm border border-gray-100">
            <Clock className="animate-spin mx-auto text-[#0070BC] mb-4" size={40} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cargando bandeja...</p>
          </div>
        ) : pendientes.length > 0 ? (
          pendientes.map((p) => (
            <div key={p.id_firma} className="bg-white rounded-[35px] p-6 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl text-[#0070BC]">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Solicitante</p>
                    <h3 className="font-bold text-gray-900 text-sm">{p.solicitud.solicitante.nombre_completo}</h3>
                  </div>
                </div>
                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase italic">
                  ID: #{p.solicitud.id_solicitud}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 mb-6">
                <Package className="text-gray-300" size={24} />
                <div>
                  <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-widest leading-none">Activo a retirar</p>
                  <h4 className="font-black text-gray-800 text-xs uppercase italic">{p.solicitud.activo.nombre_maquina}</h4>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDecision(p.id_firma, 'Rechazado')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-red-50 rounded-2xl text-red-400 hover:bg-red-50 transition-all active:scale-95"
                >
                  <X size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Rechazar</span>
                </button>
                <button 
                  onClick={() => handleDecision(p.id_firma, 'Aprobado')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#28B4AD] text-white rounded-2xl shadow-lg shadow-teal-100 hover:bg-[#229a94] transition-all active:scale-95"
                >
                  <Check size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Aprobar</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-gray-100">
            <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold italic text-sm">No hay firmas pendientes por ahora.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidarSolicitudes;