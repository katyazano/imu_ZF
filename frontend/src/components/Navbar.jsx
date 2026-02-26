import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Menu, X, Bell, User, Search, Camera, Home, LogOut } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 1. OBTENCIÓN DEL ROL REAL DESDE EL LOGIN
  const rolActivo = parseInt(localStorage.getItem('rol')) || 3; 

  // 2. FUNCIÓN DE CIERRE DE SESIÓN SEGURO
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setIsOpen(false);
    navigate('/', { replace: true }); 
  };

  // 3. RUTEO DINÁMICO DEL BOTÓN "HOME"
  const getHomePath = () => {
    switch (rolActivo) {
      case 1: return '/adminDashboard';
      case 2: return '/gerenteDashboard';
      case 3: return '/dashboard';
      case 7: return '/auditorDashboard';
      default: return '/dashboard';
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(getHomePath());
  };

  // 4. TEXTO DEL BUSCADOR SEGÚN ROL
  const getSearchPlaceholder = () => {
    if (rolActivo === 7) return "Rastrear trazabilidad..."; 
    if (rolActivo === 3) return "Buscar mis solicitudes..."; 
    return "Buscar activos..."; 
  };

  // 5. ENLACES DINÁMICOS (SIN BÚSQUEDA GLOBAL)
  const getNavLinks = () => {
    switch (rolActivo) {
      case 1: // Admin
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Prestamos', path: '/prestamos-activos' }
        ];
      case 2: // Gerente
        return [
          { name: 'Activos', path: '/activos' },
          { name: 'Validar Peticiones', path: '/validar-solicitudes' }
        ];
      case 7: // Auditor
        return [
          // 🛠️ FIX: Quitamos 'Búsqueda Global' y le dejamos acceso rápido a todo el inventario
          { name: 'Activos', path: '/activos' }
        ];
      default: // Usuario (Rol 3)
        return [
          { name: 'Catálogo', path: '/categorias' },
          { name: 'Mis Solicitudes', path: '/mis-solicitudes' }
        ];
    }
  };

  const handleCameraClick = () => {
    navigate('/scanner');
  };

  return (
    <nav className="bg-[#0070BC] text-white relative font-sans shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(true)} className="md:hidden p-1 active:scale-90 transition-transform">
            <Menu size={32} />
          </button>
          <button onClick={handleHomeClick}>
            <img src={zfLogo} alt="ZF" className="h-8 hidden md:block brightness-0 invert" />
          </button>
        </div>

        {/* BUSCADOR CON CÁMARA INTELIGENTE */}
        <div className="flex-1 max-w-md mx-4">
          <div className="bg-white rounded-lg flex items-center px-3 py-1.5 text-gray-500 shadow-inner">
            <Search size={18} className="mr-2" />
            <input 
              type="text" 
              className="w-full bg-transparent outline-none text-black text-sm" 
              placeholder={getSearchPlaceholder()} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                    navigate(`/auditor/trazabilidad/${e.target.value}`);
                }
              }}
            />
            
            <div className="w-px h-5 bg-gray-300 mx-2"></div>
            
            <button 
              onClick={handleCameraClick}
              title="Escanear Código QR"
              className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-md transition-colors text-[#0070BC]"
            >
              <Camera size={20} />
              <span className="hidden lg:block text-xs font-bold uppercase mt-0.5">Escanear</span>
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium">
          <button onClick={handleHomeClick} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px]">Home</button>
          
          {getNavLinks().map((link) => (
            <Link key={link.name} to={link.path} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px]">{link.name}</Link>
          ))}
          <div className="flex gap-4 ml-4 items-center">
            <Link to="/notificaciones"><Bell size={24} className="cursor-pointer hover:text-blue-200 transition-colors" /></Link>
            <Link to="/perfil"><User size={24} className="cursor-pointer hover:text-blue-200 transition-colors" /></Link>
            <button onClick={handleLogout} className="text-red-300 hover:text-red-400 ml-2 transition-colors" title="Cerrar sesión">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU DESPLEGABLE (Drawer Móvil) --- */}
      <div className={`fixed inset-0 z-[100] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)}></div>
        
        <div className="relative w-[80%] max-w-sm h-full bg-[#0070BC] p-8 flex flex-col shadow-2xl">
          <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
            <X size={24} />
          </button>

          <div className="mt-8 mb-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-lg bg-gray-200 text-black">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ZFUser" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <p className="text-white font-bold mt-4 uppercase tracking-widest text-xs">Menu Principal</p>
          </div>

          <div className="flex flex-col gap-2 w-full flex-1">
            <button onClick={handleHomeClick} className="text-white font-bold text-left px-6 py-4 hover:bg-white/10 rounded-2xl transition-colors">Inicio</button>
            
            {getNavLinks().map((link) => (
              <Link key={link.name} to={link.path} className="text-white font-bold text-left px-6 py-4 hover:bg-white/10 rounded-2xl transition-colors" onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>

          <button onClick={handleLogout} className="mt-auto w-full flex items-center justify-center gap-3 bg-red-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* --- TAB BAR INFERIOR (Solo visible en Móvil) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-20 flex items-center justify-around z-40 pb-safe">
        <Link to="/notificaciones" className="p-2">
          <Bell size={26} className="text-gray-400 hover:text-[#0070BC] transition-colors" />
        </Link>

        {/* Botón Home Central Flotante */}
        <div className="relative -top-8">
          <button onClick={handleHomeClick} className="active:scale-95 transition-transform">
            <div className="bg-[#0070BC] border-[6px] border-white rounded-full p-4 shadow-xl">
              <Home size={28} className="text-white" />
            </div>
          </button>
        </div>

        <Link to="/perfil" className="p-2">
          <User size={26} className="text-gray-400 hover:text-[#0070BC] transition-colors" />
        </Link>
      </footer>
    </nav>
  );
};

export default Navbar;