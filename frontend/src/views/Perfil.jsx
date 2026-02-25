import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, ChevronRight, ClipboardList, 
  Eye, Clock, CheckCircle, UserPlus, XCircle, Package, History
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Perfil = () => {
  const navigate = useNavigate();

  // --- NOTA PARA BACKEND: El rol debe venir de su sistema de Auth ---
  const [userRole] = useState('security'); // Probar con 'admin' o 'gerente'
  const [showModal, setShowModal] = useState(null); // 'historial' o 'prestamos'

  const usuario = {
    nombre: "Pedro Gómez",
    rol: userRole.charAt(0).toUpperCase() + userRole.slice(1),
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
  };

  // --- LÓGICA DE HISTORIAL POR ROL ---
  const historialPorRol = {
    'admin': [
      { text: "Diste acceso a Juan Pérez para aceptar solicitudes", date: "Hoy, 10:00 AM" },
      { text: "Pusiste al activo BetaWorks X300 en mantenimiento", date: "Ayer" },
      { text: "Añadiste un nuevo activo: Laptop Dell G15", date: "22/02/2026" }
    ],
    'gerente': [
      { text: "Aceptaste la solicitud de Ana Pérez (X300)", date: "Hoy, 09:15 AM" },
      { text: "Rechazaste la solicitud de Juan Perez", date: "Ayer" },
      { text: "Firmaste el reporte de mantenimiento mensual", date: "21/02/2026" }
    ],
    'ehs': [
      {text: "Aceptaste la solicitus tipo Scrap de Lolita Ayala", date: "21/02/2026"}
    ],
    'user': [
      { text: "Devolviste el activo GammaTech Model B1", date: "Ayer" },
      { text: "Tu solicitud por el BetaWorks X300 fue aceptada", date: "20/02/2026" },
      { text: "Pediste el activo BetaWorks HIL-1000", date: "18/02/2026" }
    ],
    's&r': [
      {text: "Validaste logística del pedido con folio: SF-9905", date: "Ayer"},
      {text: "Marcaste rechazado el pedido con folio: SF-9904", date: "21/02/2026"}
    ],
    'security': [
      {text: "Validaste salida del activo con ID: 10001", date: "21/02/2026"}
    ]
  };

  // --- DATOS DE PRÉSTAMOS (SOLO USER) ---
  const misPrestamos = [
    { nombre: "BetaWorks Serie X20", id: "206-3-01", status: "Aceptado", color: "text-green-600 bg-green-50" },
    { nombre: "GammaTech B1", id: "100-05", status: "Pendiente", color: "text-orange-600 bg-orange-50" },
    { nombre: "Epsilon RAD-77G", id: "100-23", status: "Pasado", color: "text-gray-400 bg-gray-50" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      {/* Encabezado Azul */}
      <div className="bg-[#0070BC] p-6 pt-10 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white">
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
            Rol: {usuario.rol}
          </p>

          <div className="w-full mt-10 space-y-4">
            {/* BOTÓN HISTORIAL (TODOS) */}
            <button 
              onClick={() => setShowModal('historial')}
              className="w-full bg-gray-50 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm"><History className="text-[#0070BC]" /></div>
                <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Actividad reciente</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            {/* BOTÓN MIS PRÉSTAMOS (SOLO USER) */}
            {userRole === 'user' && (
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

            {/* CONFIGURACIÓN */}
            <button className="w-full bg-white border-2 border-gray-100 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Settings size={22} /></div>
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">Configuración</span>
              </div>
              <ChevronRight size={20} className="text-gray-200" />
            </button>
          </div>
        </div>
      </main>

      {/* MODAL DE HISTORIAL O PRÉSTAMOS */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase">
                {showModal === 'historial' ? 'Tu Actividad' : 'Mis Préstamos'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-gray-100 rounded-full"><XCircle className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              {showModal === 'historial' ? (
                historialPorRol[userRole].map((h, i) => (
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