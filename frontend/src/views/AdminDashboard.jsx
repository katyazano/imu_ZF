import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Camera, ChevronRight, CheckCircle, 
  Settings, Users, Bell, User, Home 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- NOTA PARA BACKEND ---
  // Sustituir este estado por el valor real del Contexto de Autenticación o Redux
  const [userRole] = useState('admin'); 

  // Protección de ruta: Si no es admin, no renderiza el dashboard
  if (userRole !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos para ver este panel.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-[#0070BC] text-white px-6 py-2 rounded-xl"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total activos', value: '345', color: 'text-[#0070BC]', bg: 'bg-white' },
    { label: 'Préstamos activos', value: '23', color: 'text-white', bg: 'bg-[#60A5FA]' },
  ];

  const quickActions = [
    { title: 'Reglas de negocio', icon: <CheckCircle className="text-white" size={20} />, path: '/firmas' },
    { title: 'Administrar mantenimiento', icon: <Settings className="text-white" size={20} />, path: '/admin-mantenimiento' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-24">
      <Navbar />

      {/* Título de Sección */}
      <div className="px-6 mt-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">
          Panel de administración
        </h1>
        <div className="w-16 h-1.5 bg-[#0070BC] mt-1"></div>
      </div>

      {/* Grid de Estadísticas */}
        <div className="grid grid-cols-2 gap-4 px-6 mt-6">
        {stats.map((stat, i) => (
            <Link 
            key={i} 
            /* Aquí definimos a dónde va cada botón */
            to={stat.label === 'Total activos' ? '/activos' : '/prestamos-activos'} 
            className={`${stat.bg} p-5 rounded-[25px] shadow-sm border border-gray-100 flex flex-col justify-between relative active:scale-95 transition-transform cursor-pointer`}
            >
            <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
            <span className={`text-xs font-bold mt-1 ${stat.color === 'text-white' ? 'text-blue-50' : 'text-gray-400'}`}>
                {stat.label}
            </span>
            <ChevronRight 
                size={18} 
                className={`absolute top-5 right-4 ${stat.color === 'text-white' ? 'text-white' : 'text-gray-300'}`} 
            />
            </Link>
        ))}
        </div>

     {/* Acciones Rápidas */}
        <div className="px-6 mt-10">
        <h2 className="text-xl font-extrabold text-gray-800 mb-4">Acciones rápidas</h2>
        <div className="space-y-3">
            {quickActions.map((action, i) => (
            <div 
                key={i} 
                onClick={() => navigate(action.path)} 
                className="bg-white border-2 border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-4">
                <div className="bg-[#0070BC] p-2 rounded-lg shadow-md">
                    {action.icon}
                </div>
                <span className="font-bold text-gray-700">{action.title}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
            </div>
            ))}
        </div>
        </div>

    </div>
  );
};

export default AdminDashboard;