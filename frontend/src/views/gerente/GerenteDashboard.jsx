import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

const GerenteDashboard = () => {
  const navigate = useNavigate();
  
  // 1. ESTADOS PARA DATOS REALES
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    pendientes: 0,
    totalActivos: 0,
    alertas: 0
  });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);

  // 2. FETCH CON LAS RUTAS QUE YA SABEMOS QUE FUNCIONAN
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        // ✅ Usamos tu ruta de aprobaciones y la de activos (con el filtro de gerente)
        const [resPendientes, resActivos] = await Promise.all([
          fetch(`${baseUrl}/aprobaciones/pendientes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${baseUrl}/activos?mis_activos=true`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (resPendientes.ok && resActivos.ok) {
          const dataPendientes = await resPendientes.json();
          const dataActivos = await resActivos.json();
          
          setMetricas({
            pendientes: dataPendientes.length, // Conteo exacto de firmas
            totalActivos: dataActivos.length || 0,
            alertas: 0 
          });

          // Tomamos solo las últimas 3 para la previsualización rápida
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
      
      <main className="px-6 mt-8 flex-1">
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center uppercase tracking-tighter italic">Resumen</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#0070BC]">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="text-xs font-black uppercase tracking-widest">Calculando métricas...</span>
          </div>
        ) : (
          <>
            {/* Card Principal: Solicitudes Pendientes */}
            <button 
              onClick={() => navigate('/validar-solicitudes')}
              className="w-full bg-[#EBF5FF] p-6 rounded-[30px] flex items-center justify-between mb-6 shadow-sm active:scale-95 transition-all border border-blue-100"
            >
              <div className="text-left">
                <span className="text-4xl font-black text-[#0070BC]">{metricas.pendientes}</span>
                <p className="text-[10px] font-bold text-[#0070BC]/60 uppercase tracking-widest mt-1">Solicitudes pendientes</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ChevronRight size={24} className="text-[#0070BC]" />
              </div>
            </button>

            {/* Grid de Activos y Alertas */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => navigate('/activos')}
                className="border-2 border-gray-100 bg-gray-50/50 rounded-[25px] p-5 text-center active:scale-95 transition-all hover:border-blue-200 hover:bg-blue-50/30 group"
              >
                <span className="text-3xl font-black text-gray-800 group-hover:text-[#0070BC] transition-colors">
                  {metricas.totalActivos}
                </span>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 group-hover:text-[#0070BC]/60">
                  Total Activos
                </p>
              </button>

              {/* Este se queda estático o puedes hacerlo botón si tienes una ruta de alertas */}
              <div className="border-2 border-red-50 bg-red-50/30 rounded-[25px] p-5 text-center">
                <span className="text-3xl font-black text-red-500">{metricas.alertas}</span>
                <p className="text-[9px] font-black text-red-400 uppercase tracking-tighter mt-1">Alertas / Retrasos</p>
              </div>
            </div>

            {/* Sección de Solicitudes Recientes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0070BC] font-black text-xs uppercase tracking-widest">Requieren Atención</h3>
              </div>
              
              <div className="space-y-3">
                {solicitudesRecientes.length > 0 ? (
                  solicitudesRecientes.map(firma => (
                    <div key={firma.id_firma} className="border-2 border-gray-50 rounded-2xl p-4 flex items-center gap-4 bg-white shadow-sm">
                      <AlertCircle className="text-orange-500 shrink-0" size={24} />
                      <div className="text-left flex-1">
                        <p className="text-[11px] font-bold text-gray-800 leading-tight">
                          <span className="text-[#0070BC]">{firma.solicitud?.solicitante?.nombre_completo || 'Usuario'}</span> solicitó salida de activo
                        </p>
                        <span className="text-[9px] font-black text-orange-500 uppercase italic mt-1 inline-block">
                          ID Solicitud: #{firma.solicitud?.id_solicitud}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm font-bold text-gray-400 italic py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                    ¡Todo al día! No hay firmas pendientes.
                  </p>
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