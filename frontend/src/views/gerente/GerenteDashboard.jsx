import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader2, PlusCircle, PenTool } from 'lucide-react';
import Navbar from '../../components/Navbar';

const GerenteDashboard = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    pendientes: 0,
    totalActivos: 0,
    alertas: 0
  });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        const [resPendientes, resActivos] = await Promise.all([
          fetch(`${baseUrl}/aprobaciones/pendientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${baseUrl}/activos?mis_activos=true`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (resPendientes.ok && resActivos.ok) {
          const dataPendientes = await resPendientes.json();
          const dataActivos = await resActivos.json();
          
          setMetricas({
            pendientes: dataPendientes.length,
            totalActivos: dataActivos.length || 0,
            alertas: 0 
          });

          setSolicitudesRecientes(dataPendientes.slice(0, 3));
        }
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      {/* HEADER TIPO ZF */}
      <div className="px-6 mt-10 mb-6">
        <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-[0.3em] mb-1 italic">
          Panel de Control
        </p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter uppercase italic">
          Área Gerencial
        </h1>
        <div className="w-12 h-1.5 bg-[#0070BC] mt-2 rounded-full"></div>
      </div>

      <main className="px-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#0070BC]">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando datos...</span>
          </div>
        ) : (
          <>
            {/* --- ACCIONES PRINCIPALES --- */}
            <div className="space-y-4 mb-8">
              
              {/* Botón: Firmas Pendientes */}
              <button 
                onClick={() => navigate('/validar-solicitudes')}
                className="w-full bg-[#EBF5FF] p-6 rounded-[30px] flex items-center justify-between shadow-sm active:scale-95 transition-all border border-blue-100 group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <span className="text-5xl font-black text-[#0070BC] tracking-tighter leading-none block mb-1">
                      {metricas.pendientes}
                    </span>
                    <p className="text-[10px] font-black text-[#0070BC]/60 uppercase tracking-widest mt-1">
                      Firmas Pendientes
                    </p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <PenTool size={24} className="text-[#0070BC]" />
                </div>
              </button>

              {/* Botón: Nuevo Registro (El que le agregamos para el Gerente) */}
              <button 
                onClick={() => navigate('/nuevo-activo')}
                className="w-full bg-[#0070BC] text-white p-6 rounded-[30px] flex items-center justify-between shadow-lg shadow-blue-200 active:scale-95 transition-all group"
              >
                <div className="text-left flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-12 transition-transform">
                    <PlusCircle size={28} className="text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-black uppercase italic tracking-tighter block leading-tight">
                      Nuevo Equipo
                    </span>
                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                      Dar de alta en área
                    </span>
                  </div>
                </div>
                <ChevronRight size={24} className="text-white/50" />
              </button>

            </div>

            {/* --- GRID DE MÉTRICAS SECUNDARIAS --- */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => navigate('/activos')}
                className="border-2 border-gray-100 bg-white rounded-[25px] p-6 text-center active:scale-95 transition-all hover:border-blue-200 hover:bg-blue-50/30 group shadow-sm"
              >
                <span className="text-3xl font-black text-gray-800 group-hover:text-[#0070BC] transition-colors tracking-tighter block mb-1">
                  {metricas.totalActivos}
                </span>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 group-hover:text-[#0070BC]/60">
                  Total Equipos
                </p>
              </button>

              <div className="border-2 border-red-50 bg-red-50/50 rounded-[25px] p-6 text-center shadow-sm">
                <span className="text-3xl font-black text-red-500 tracking-tighter block mb-1">
                  {metricas.alertas}
                </span>
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">
                  Alertas / Retrasos
                </p>
              </div>
            </div>

            {/* --- SECCIÓN: REQUIEREN ATENCIÓN --- */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[#0070BC] font-black text-xs uppercase tracking-widest italic">
                  Requieren Atención
                </h3>
                <div className="h-px bg-gray-100 flex-1 ml-4"></div>
              </div>
              
              <div className="space-y-3">
                {solicitudesRecientes.length > 0 ? (
                  solicitudesRecientes.map(firma => (
                    <div key={firma.id_firma} className="border-2 border-gray-100 rounded-3xl p-5 flex items-center gap-4 bg-white shadow-sm active:bg-gray-50 transition-colors">
                      <div className="bg-orange-50 p-3 rounded-xl">
                        <AlertCircle className="text-orange-500 shrink-0" size={24} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-[11px] font-bold text-gray-800 leading-tight uppercase">
                          <span className="text-[#0070BC] font-black">
                            {firma.solicitud?.solicitante?.nombre_completo || 'Usuario'}
                          </span> solicitó activo
                        </p>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 inline-block">
                          Folio: #{firma.solicitud?.id_solicitud || 'N/A'}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">
                      ¡Todo al día! Sin pendientes.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default GerenteDashboard;