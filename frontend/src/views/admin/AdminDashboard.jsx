import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Users, Loader2, ShieldCheck, Settings 
} from 'lucide-react'; 
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalActivos, setTotalActivos] = useState(0);
  const [totalPrestamos, setTotalPrestamos] = useState(0);

  const rolID = parseInt(localStorage.getItem('rol'));
  const nombreAdmin = localStorage.getItem('nombre') || "Admin";

  useEffect(() => {
    if (rolID !== 1) { navigate('/', { replace: true }); return; }

    const cargarMétricasDesdeBD = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        // 🚀 Consultamos el endpoint unificado de KPIs
        const response = await fetch(`${baseUrl}/auditor/dashboard/kpis`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Asignamos las métricas reales que vienen del backend
          setTotalActivos(data.kpis.total_activos || 0);
          setTotalPrestamos(data.kpis.equipos_fuera || 0);
        }

      } catch (error) {
        console.error("Error sincronizando el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMétricasDesdeBD();
  }, [rolID, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-28">
      <Navbar />

      <div className="px-6 mt-10">
        <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-[0.3em] mb-1 italic">ZF System Root</p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter uppercase italic">
          Control Panel
        </h1>
        <div className="w-12 h-1.5 bg-[#0070BC] mt-1 rounded-full"></div>
      </div>

      {/* 📊 MÉTRICAS */}
      <div className="grid grid-cols-2 gap-4 px-6 mt-8">
        {loading ? (
          <div className="col-span-2 flex justify-center py-10">
            <Loader2 className="animate-spin text-[#0070BC]" size={32} />
          </div>
        ) : (
          <>
            {/* 🛠️ TARJETA CORREGIDA: Cambiamos {3} por {totalActivos} */}
            <button 
              onClick={() => navigate('/activos')} 
              className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 flex flex-col justify-between relative active:scale-95 transition-transform text-left h-36"
            >
              <span className="text-4xl font-black text-[#0070BC] tracking-tighter">{totalActivos}</span> 
              <span className="text-sm font-black uppercase tracking-tight text-gray-400">Total activos</span>
              <ChevronRight size={20} className="absolute top-6 right-6 text-gray-200" />
            </button>

            <button 
              onClick={() => navigate('/prestamos-activos')} 
              className="bg-[#3d83d9] p-6 rounded-[30px] shadow-sm border border-blue-400 flex flex-col justify-between relative active:scale-95 transition-transform text-left h-36"
            >
              <span className="text-4xl font-black text-white tracking-tighter">{totalPrestamos}</span>
              <span className="text-sm font-black uppercase tracking-tight text-blue-50">Préstamos</span>
              <ChevronRight size={20} className="absolute top-6 right-6 text-white/50" />
            </button>
          </>
        )}
      </div>

      {/* ACCIONES (Ahora con Mantenimiento) */}
      <div className="px-6 mt-10">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 italic">Gestión Avanzada</h2>
        <div className="space-y-4">
          
          {/* Usuarios */}
          <button onClick={() => navigate('/admin-usuarios')} className="w-full bg-white border border-gray-100 p-5 rounded-[25px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="bg-[#0070BC] p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
                <Users className="text-white" size={22} />
              </div>
              <div>
                <span className="font-black text-gray-800 uppercase text-sm block">Usuarios</span>
                <span className="text-[10px] text-gray-400 font-bold italic">Control de accesos y roles</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-200" />
          </button>

          {/* Reglas de Negocio */}
          <button onClick={() => navigate('/firmas')} className="w-full bg-white border border-gray-100 p-5 rounded-[25px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="bg-[#0070BC] p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <div>
                <span className="font-black text-gray-800 uppercase text-sm block">Reglas de Negocio</span>
                <span className="text-[10px] text-gray-400 font-bold italic">Configurar aprobaciones</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-200" />
          </button>

          {/* Módulo de Mantenimiento */}
          <button 
            onClick={() => navigate('/admin-mantenimiento')} 
            className="w-full bg-white border border-gray-100 p-5 rounded-[25px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#0070BC] p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
                <Settings className="text-white" size={22} />
              </div>
              <div>
                <span className="font-black text-gray-800 uppercase text-sm block">Mantenimiento</span>
                <span className="text-[10px] text-gray-400 font-bold italic">Liberar activos en reparación</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-200" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;