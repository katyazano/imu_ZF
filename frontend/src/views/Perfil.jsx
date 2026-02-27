import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, ChevronRight, ClipboardList, 
  Eye, Clock, CheckCircle, UserPlus, XCircle, Package, History, LogOut
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Perfil = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(null);

  // 1. ESTADO PARA LOS DATOS REALES
  const [userRole, setUserRole] = useState('user'); // Fallback por defecto
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [rolID, setRolID] = useState(3);

  // 2. MAPEO DE ID A NOMBRE DE ROL
  const roleNames = {
    1: 'admin',
    2: 'user',      // ID 2 = Usuario General
    3: 'gerente',   // ID 3 = Gerente
    4: 's&r',
    5: 'ehs',
    6: 'security',
    7: 'auditor'
  };

  useEffect(() => {
    // Recuperamos el rol y el nombre guardados en el login
    const savedRole = parseInt(localStorage.getItem('rol')) || 3;
    const savedName = localStorage.getItem('nombre') || "Kathe"; 

    setRolID(savedRole);
    setUserRole(roleNames[savedRole] || 'user');
    setNombreUsuario(savedName);
  }, []);

  const usuario = {
    nombre: nombreUsuario,
    rolTexto: userRole === 's&r' ? 'Logística (S&R)' : userRole.toUpperCase(),
    foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombreUsuario}`
  };

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    // Reemplazamos la historia para que el usuario no pueda volver atrás con el navegador
    navigate('/', { replace: true }); 
  };

  // --- TU LÓGICA DE HISTORIAL ---
  const historialPorRol = {
    'admin': [
      { text: "Diste acceso a Juan Pérez para aceptar solicitudes", date: "Hoy, 10:00 AM" },
      { text: "Pusiste al activo BetaWorks X300 en mantenimiento", date: "Ayer" }
    ],
    'gerente': [
      { text: "Aceptaste la solicitud de Ana Pérez (X300)", date: "Hoy, 09:15 AM" },
      { text: "Rechazaste la solicitud de Juan Perez", date: "Ayer" }
    ],
    'ehs': [
      {text: "Aceptaste la solicitud tipo Scrap de Lolita Ayala", date: "21/02/2026"}
    ],
    'user': [
      { text: "Tu solicitud por el BetaWorks X300 fue aceptada", date: "20/02/2026" },
      { text: "Pediste el activo BetaWorks HIL-1000", date: "18/02/2026" }
    ],
    's&r': [
      {text: "Validaste logística del pedido con folio: SF-9905", date: "Ayer"},
      {text: "Marcaste rechazado el pedido con folio: SF-9904", date: "21/02/2026"}
    ],
    'security': [
      {text: "Validaste salida del activo con ID: 1", date: "Hoy"}
    ],
    'auditor': [
      {text: "Consultaste reporte de trazabilidad ID: 1", date: "Hoy"},
      {text: "Exportaste KPI mensual a PDF", date: "Ayer"}
    ]
  };

  // --- DATOS DE PRÉSTAMOS ---
  const misPrestamos = [
    { nombre: "BetaWorks Serie X20", id: "1", status: "Aceptado", color: "text-green-600 bg-green-50" },
    { nombre: "GammaTech B1", id: "5", status: "Pendiente", color: "text-orange-600 bg-orange-50" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      <div className="bg-[#0070BC] p-6 pt-10 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Mi perfil</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 flex flex-col items-center border border-gray-100">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 -mt-24 shadow-xl">
            <img src={usuario.foto} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mt-4 tracking-tight">{usuario.nombre}</h2>
          <p className="text-[#0070BC] font-black text-xs uppercase tracking-widest mt-1 italic">
            {usuario.rolTexto}
          </p>

          <div className="w-full mt-10 space-y-4">
            {/* Actividad Reciente */}
            <button 
              onClick={() => setShowModal('historial')}
              className="w-full bg-gray-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-[#0070BC] group-hover:text-white transition-colors">
                  <History size={20} />
                </div>
                <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Actividad reciente</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            {/* Mis Préstamos */}
            {(rolID === 3 || rolID === 1) && (
              <button 
                onClick={() => setShowModal('prestamos')}
                className="w-full bg-blue-50/50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all border border-blue-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Package className="text-[#0070BC]" /></div>
                  <span className="font-bold text-[#0070BC] uppercase text-xs tracking-wider">Mis préstamos</span>
                </div>
                <ChevronRight size={20} className="text-[#0070BC]/30" />
              </button>
            )}

            {/* Configuración */}
            <button className="w-full bg-white border-2 border-gray-100 p-5 rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                  <Settings size={22} />
                </div>
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">
                  Configuración
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-200" />
            </button>

            {/* BOTÓN DE CERRAR SESIÓN */}
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50/50 border-2 border-red-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all mt-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                  <LogOut size={22} />
                </div>
                <span className="font-bold text-red-600 uppercase text-xs tracking-wider">
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
              <h2 className="text-2xl font-black text-gray-900 uppercase">
                {showModal === 'historial' ? 'Tu Actividad' : 'Mis Préstamos'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
                <XCircle className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {showModal === 'historial' ? (
                historialPorRol[userRole]?.map((h, i) => (
                  <div key={i} className="border-l-4 border-[#0070BC] pl-4 py-1">
                    <p className="text-sm font-bold text-gray-800 italic">"{h.text}"</p>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{h.date}</span>
                  </div>
                ))
              ) : (
                misPrestamos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-black text-gray-800 text-sm leading-none">{p.nombre}</p>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {p.id}</span>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${p.color}`}>
                      {p.status}
                    </span>
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