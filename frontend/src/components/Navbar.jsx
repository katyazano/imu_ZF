import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Menu, X, Bell, User, Search, Camera, Home, LogOut } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 1. OBTENCIÓN DEL ROL DESDE EL LOGIN
  const rolActivo = parseInt(localStorage.getItem('rol')) || 3; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setIsOpen(false);
    navigate('/', { replace: true }); 
  };

  // 2. RUTEO DINÁMICO DEL HOME
  const getHomePath = () => {
    switch (rolActivo) {
      case 1: return '/adminDashboard';
      case 2: return '/gerenteDashboard';
      case 3: return '/categorias'; // Usuario General -> Categorías
      case 6: return '/scanner';    // Seguridad -> Directo al Scanner
      case 7: return '/auditorDashboard';
      default: return '/categorias';
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(getHomePath());
  };

  // 3. ENLACES DINÁMICOS POR ROL
  const getNavLinks = () => {
    switch (rolActivo) {
      case 1: 
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Prestamos', path: '/prestamos-activos' }
        ];
      case 2: 
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Validar Peticiones', path: '/validar-solicitudes' }
        ];
      case 3: 
        return [
          { name: 'Categorías', path: '/categorias' },
          { name: 'Mis Solicitudes', path: '/mis-solicitudes' }
        ];
      case 7: 
        return [{ name: 'Inventario', path: '/activos' }];
      case 6: // Seguridad
        return []; // Solo tiene el Scanner como Home, no necesita más links
      default: 
        return [];
    }
  };

  return (
    <nav className="bg-[#0070BC] text-white relative font-sans shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          {/* Menú hamburguesa solo si hay links que mostrar */}
          {getNavLinks().length > 0 && (
            <button onClick={() => setIsOpen(true)} className="md:hidden p-1 active:scale-90 transition-transform">
              <Menu size={32} />
            </button>
          )}
          <button onClick={handleHomeClick}>
            <img src={zfLogo} alt="ZF" className="h-8 hidden md:block brightness-0 invert" />
          </button>
        </div>

        {/* 🔍 BUSCADOR: Oculto para Seguridad (Rol 6) para evitar distracciones */}
        {rolActivo !== 6 && (
          <div className="flex-1 max-w-md mx-4">
            <div className="bg-white rounded-lg flex items-center px-3 py-1.5 text-gray-500 shadow-inner">
              <Search size={18} className="mr-2" />
              <input 
                type="text" 
                className="w-full bg-transparent outline-none text-black text-sm" 
                placeholder={rolActivo === 7 ? "Rastrear trazabilidad..." : "Buscar activos..."} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                      navigate(rolActivo === 7 ? `/auditor/trazabilidad/${e.target.value}` : `/activos?q=${e.target.value}`);
                  }
                }}
              />
              <div className="w-px h-5 bg-gray-300 mx-2"></div>
              <button 
                onClick={() => navigate('/scanner')}
                className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-md transition-colors text-[#0070BC]"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>
        )}

        {/* 📋 LINKS Y ACCIONES FINALES */}
        <div className="flex items-center gap-6 font-medium">
          <div className="hidden md:flex items-center gap-6">
            <button onClick={handleHomeClick} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px]">
              {rolActivo === 6 ? 'Scanner' : 'Home'}
            </button>
            
            {getNavLinks().map((link) => (
              <Link key={link.name} to={link.path} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px]">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            {/* Ocultamos notificaciones para el guardia */}
            {rolActivo !== 6 && (
              <Link to="/notificaciones">
                <Bell size={22} className="cursor-pointer hover:text-blue-200 transition-colors" />
              </Link>
            )}
            <Link to="/perfil">
              <User size={22} className="cursor-pointer hover:text-blue-200 transition-colors" />
            </Link>
            <button onClick={handleLogout} className="text-red-300 hover:text-red-400 transition-colors" title="Cerrar sesión">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* --- DRAWER MÓVIL --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-[80%] max-w-sm h-full bg-[#0070BC] p-8 flex flex-col shadow-2xl">
            <button onClick={() => setIsOpen(false)} className="self-end text-white/70 p-2"><X size={24} /></button>
            <div className="flex flex-col gap-4 mt-8">
              <button onClick={handleHomeClick} className="text-white font-bold text-left px-4 py-3 hover:bg-white/10 rounded-xl">Inicio</button>
              {getNavLinks().map((link) => (
                <Link key={link.name} to={link.path} className="text-white font-bold text-left px-4 py-3 hover:bg-white/10 rounded-xl" onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <button onClick={handleLogout} className="mt-8 bg-red-500 text-white font-bold py-3 rounded-xl">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;