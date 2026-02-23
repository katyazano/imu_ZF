import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // para la navegación fluida
import { Menu, X, Bell, User, Plus, Search, Camera, Home } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Definimos las rutas de tu proyecto
  const navLinks = [
    { name: 'Home', path: '/adminDashboard' },
    { name: 'Activos', path: '/activos' },
    { name: 'Prestamos', path: '/prestamos-activos' },
    { name: 'Cerrar sesión', path: '/' }, // Redirige al Login
  ];

  return (
    <nav className="bg-[#0070BC] text-white relative font-sans">
      {/* Top Bar / Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile: Botón Hamburguesa / Desktop: Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="md:hidden p-1 active:scale-90 transition-transform"
          >
            <Menu size={32} />
          </button>
          <Link to="/adminDashboard">
            <img src={zfLogo} alt="ZF" className="h-8 hidden md:block brightness-0 invert" />
          </Link>
        </div>

        {/* Barra de Búsqueda estilo Figma */}
        <div className="flex-1 max-w-md mx-4">
          <div className="bg-white rounded-lg flex items-center px-3 py-1.5 text-gray-500 shadow-inner">
            <Search size={18} className="mr-2" />
            <input 
              type="text" 
              className="w-full bg-transparent outline-none text-black text-sm" 
              placeholder="Buscar activos..."
            />
            <Camera size={18} className="ml-2 cursor-pointer active:text-blue-500" />
          </div>
        </div>

        {/* Desktop Menu con <Link> */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="hover:text-blue-200 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-4 ml-4">
            <Bell size={24} className="cursor-pointer" />
            <Link to="/perfil"><User size={24} className="cursor-pointer" /></Link>
          </div>
        </div>
      </div>

      {/* --- MENU DESPLEGABLE (Drawer) --- */}
      <div className={`fixed inset-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)}></div>
        
        <div className="relative w-4/5 max-w-xs h-full bg-[#0070BC] p-8 flex flex-col items-center">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white">
            <X size={32} />
          </button>

          {/* Avatar del usuario (Segunda imagen) */}
          <div className="mt-12 mb-10">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-gray-200">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vanessa" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Links del Menú Móvil */}
          <div className="flex flex-col gap-6 w-full">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-white text-2xl font-bold text-center py-2 hover:bg-white/10 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- TAB BAR INFERIOR (Mobile First) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 flex items-center justify-around z-40">
        
        {/* Campana de Notificaciones */}
        <Link to="/notificaciones">
          <Bell size={28} className="text-gray-400 hover:text-[#0070BC] transition-colors" />
        </Link>

        {/* Botón Home Central Flotante */}
        <div className="relative -top-6">
          <Link to="/adminDashboard">
            <div className="bg-white border-4 border-[#0070BC] rounded-full p-4 shadow-xl active:scale-95 transition-transform">
              <Home size={32} className="text-[#0070BC]" />
            </div>
          </Link>
        </div>

        {/* Perfil de Usuario */}
        <Link to="/perfil">
          <User size={28} className="text-gray-400 hover:text-[#0070BC] transition-colors" />
        </Link>

      </footer>
    </nav>
  );
};

export default Navbar;