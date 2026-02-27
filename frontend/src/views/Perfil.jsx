import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, ChevronRight, ClipboardList, 
  XCircle, Package, History, LogOut, Bell, Loader2 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Perfil = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(null);

  // 1. ESTADOS PARA DATOS REALES
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [rolID, setRolID] = useState(2);
  const [actividad, setActividad] = useState([]); // Historial real
  const [tieneNotificaciones, setTieneNotificaciones] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const roleNames = {
    1: 'ADMINISTRADOR', 2: 'USUARIO', 3: 'GERENTE', 
    4: 'LOGÍSTICA (S&R)', 5: 'EHS', 6: 'SECURITY', 7: 'AUDITOR'
  };

  // 2. CARGA INICIAL Y CONEXIÓN AL BACKEND
  useEffect(() => {
    const savedRole = parseInt(localStorage.getItem('rol')) || 2;
    const savedName = localStorage.getItem('nombre') || "Usuario ZF"; 
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    setRolID(savedRole);
    setNombreUsuario(savedName);

    const fetchData = async () => {
      if (!token) return;
      setLoadingHistorial(true);
      try {
        // Consultamos el endpoint maestro de notificaciones para el historial y el badge
        const response = await fetch(`${baseUrl}/notificaciones`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Punto rojo si hay pendientes
          setTieneNotificaciones(data.length > 0);
          
          // Formateamos para el historial del modal
          const formateada = data.map(item => ({
            text: item.mensaje,
            date: new Date(item.fecha_creacion || Date.now()).toLocaleDateString('es-MX', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })
          }));
          setActividad(formateada);
        }
      } catch (e) {
        console.error("Error en perfil:", e);
      } finally {
        setLoadingHistorial(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true }); 
  };

  // Préstamos (Ejemplo estático, podrías conectarlo igual que el historial)
  const misPrestamos = [
    { nombre: "BetaWorks Serie X20", id: "1", status: "Aceptado", color: "text-green-600 bg-green-50" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      {/* HEADER AZUL ZF */}
      <div className="bg-[#0070BC] p-6 pt-10 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Mi perfil</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 flex flex-col items-center border border-gray-100">
          
          {/* AVATAR */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 -mt-24 shadow-xl">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombreUsuario}`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mt-4 tracking-tight">{nombreUsuario}</h2>
          <p className="text-[#0070BC] font-black text-xs uppercase tracking-widest mt-1 italic">
            {roleNames[rolID]}
          </p>

          {/* MENÚ DE OPCIONES (Textos más grandes) */}
          <div className="w-full mt-10 space-y-4">
            
            {/* Actividad */}
            <button 
              onClick={() => setShowModal('historial')}
              className="w-full bg-gray-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400 group-hover:bg-[#0070BC] group-hover:text-white transition-colors">
                  <History size={22} />
                </div>
                <span className="font-bold text-gray-800 uppercase text-sm tracking-wider">Actividad reciente</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            {/* Notificaciones */}
            <button 
              onClick={() => navigate('/notificaciones')}
              className="w-full bg-gray-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all group relative"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400 group-hover:bg-[#0070BC] group-hover:text-white transition-colors">
                  <Bell size={22} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 uppercase text-sm tracking-wider">Notificaciones</span>
                    {tieneNotificaciones && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            {/* Préstamos (Solo roles relevantes) */}
            {[1, 2, 3].includes(rolID) && (
              <button 
                onClick={() => setShowModal('prestamos')}
                className="w-full bg-blue-50/50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border border-blue-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-[#0070BC]"><Package size={22} /></div>
                  <span className="font-bold text-[#0070BC] uppercase text-sm tracking-wider">Mis préstamos</span>
                </div>
                <ChevronRight size={20} className="text-[#0070BC]/30" />
              </button>
            )}

            {/* Cerrar Sesión */}
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50/50 border-2 border-red-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all mt-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                  <LogOut size={24} />
                </div>
                <span className="font-bold text-red-600 uppercase text-sm tracking-wider">
                  Cerrar Sesión
                </span>
              </div>
              <ChevronRight size={20} className="text-red-200" />
            </button>

          </div>
        </div>
      </main>

      {/* MODAL UNIFICADO */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                {showModal === 'historial' ? 'Tu Actividad' : 'Mis Préstamos'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
                <XCircle className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {showModal === 'historial' ? (
                loadingHistorial ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0070BC]" /></div>
                ) : actividad.length > 0 ? (
                    actividad.map((h, i) => (
                        <div key={i} className="border-l-4 border-[#0070BC] pl-4 py-2 bg-gray-50/50 rounded-r-xl">
                            <p className="text-sm font-bold text-gray-800 leading-tight">"{h.text}"</p>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">{h.date}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 italic py-10">No hay registros recientes.</p>
                )
              ) : (
                misPrestamos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{p.nombre}</p>
                      <span className="text-[10px] text-gray-400 font-bold">ID: {p.id}</span>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${p.color}`}>{p.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;