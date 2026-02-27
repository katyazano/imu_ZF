import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bell, User, Search, Camera, LogOut } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ESTADOS
  const [isOpen, setIsOpen] = useState(false); // Para el menú móvil
  const [busqueda, setBusqueda] = useState(''); // Para el texto del buscador

  // 1. OBTENCIÓN DEL ROL
  const rolActivo = parseInt(localStorage.getItem('rol')) || 2; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setIsOpen(false);
    navigate('/', { replace: true }); 
  };

  // 2. 🧠 CONFIGURACIÓN CONTEXTUAL DEL BUSCADOR
  const getSearchConfig = () => {
    const path = location.pathname;

    // Si estamos en secciones de SOLICITUDES
    if (path.includes('/mis-solicitudes') || path.includes('/solicitud/')) {
      return {
        placeholder: "Buscar folio o equipo...",
        targetPath: "/mis-solicitudes"
      };
    }

    // Por defecto (Activos, Categorías, Home)
    return {
      placeholder: rolActivo === 7 ? "Rastrear trazabilidad..." : "Buscar activos o IDs...",
      targetPath: "/activos"
    };
  };

  const searchConfig = getSearchConfig();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && busqueda.trim() !== '') {
      // Navegamos a la ruta objetivo con el parámetro de búsqueda ?q=
      navigate(`${searchConfig.targetPath}?q=${busqueda}`);
      setBusqueda(''); // Limpiamos el input
      setIsOpen(false);
    }
  };

  // 3. RUTEO DINÁMICO DEL HOME
  const getHomePath = () => {
    switch (rolActivo) {
      case 1: return '/adminDashboard';
      case 2: return '/categorias'; // Usuario General -> Categorías
      case 3: return '/gerenteDashboard';
      case 6: return '/scanner';
      case 7: return '/auditorDashboard';
      default: return '/categorias';
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(getHomePath());
  };

  // 4. ENLACES DINÁMICOS POR ROL
  const getNavLinks = () => {
    switch (rolActivo) {
      case 1:
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Prestamos', path: '/prestamos-activos' }
        ];
      case 3:
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Validar Peticiones', path: '/validar-solicitudes' }
        ];
      case 2:
        return [
          { name: 'Mis Solicitudes', path: '/mis-solicitudes' }
        ];
      case 7:
        return [{ name: 'Inventario', path: '/activos' }];
      default: return [];
    }
  };

  const getHomeLabel = () => {
    switch(rolActivo) {
      case 6: return 'Scanner';
      case 2: return 'Catálogo';
      default: return 'Inicio';
    }
  };

  return (
    <nav className="bg-[#0070BC] text-white relative font-sans shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(true)} className="md:hidden p-1 active:scale-90 transition-transform">
            <Menu size={32} />
          </button>
          <button onClick={handleHomeClick} className="active:scale-95 transition-transform">
            <img src={zfLogo} alt="ZF" className="h-8 hidden md:block brightness-0 invert" />
          </button>
        </div>

        {/* 🔍 BUSCADOR CONTEXTUAL */}
        {rolActivo !== 6 && (
          <div className="flex-1 max-w-md mx-4">
            <div className="bg-white rounded-xl flex items-center px-3 py-1.5 text-gray-500 shadow-inner">
              <Search size={18} className="mr-2 text-gray-400" />
              <input 
                type="text" 
                className="w-full bg-transparent outline-none text-black text-sm font-medium" 
                placeholder={searchConfig.placeholder} // <-- Placeholder dinámico
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleSearch} // <-- Comportamiento dinámico
              />
              <div className="w-px h-5 bg-gray-200 mx-2"></div>
              <button 
                onClick={() => navigate('/scanner')}
                className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-lg transition-colors text-[#0070BC]"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>
        )}

        {/* 📋 LINKS ESCRITORIO */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <button onClick={handleHomeClick} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px] font-black italic">
              {getHomeLabel()}
            </button>
            
            {getNavLinks().map((link) => (
              <Link key={link.name} to={link.path} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px] font-black italic">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            {rolActivo !== 6 && (
              <Link to="/notificaciones" className="hover:scale-110 transition-transform">
                <Bell size={22} />
              </Link>
            )}
            <Link to="/perfil" className="hover:scale-110 transition-transform">
              <User size={22} />
            </Link>
            <button onClick={handleLogout} className="text-red-300 hover:text-red-100 transition-colors">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* --- DRAWER MÓVIL --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-[80%] max-w-sm h-full bg-[#0070BC] p-8 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <button onClick={() => setIsOpen(false)} className="self-end text-white/70 p-2"><X size={32} /></button>
            <div className="flex flex-col gap-6 mt-12">
              <button onClick={handleHomeClick} className="text-white text-2xl font-black uppercase italic text-left px-4">
                {getHomeLabel()}
              </button>
              {getNavLinks().map((link) => (
                <Link key={link.name} to={link.path} className="text-white/80 text-xl font-bold uppercase tracking-tight text-left px-4 hover:text-white" onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <div className="mt-auto">
                <button onClick={handleLogout} className="w-full bg-red-500/20 border-2 border-red-500/50 text-red-100 font-black py-4 rounded-2xl uppercase tracking-widest text-xs">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;