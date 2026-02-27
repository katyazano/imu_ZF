import React, { useState, useEffect } from 'react';

import { useLocation, useNavigate, Link } from 'react-router-dom';

import {
Bell, User, Search, Camera, LogOut, Home, QrCode,
FileText, ClipboardList, CheckSquare, Package
} from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';

const Navbar = () => {

const location = useLocation();

const navigate = useNavigate();

const [busqueda, setBusqueda] = useState('');


// 🔴 ESTADO: Para el badge de notificaciones

const [tieneNotificaciones, setTieneNotificaciones] = useState(false);



const rolActivo = parseInt(localStorage.getItem('rol')) || 2;

const token = localStorage.getItem('token');

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';



// 📡 EFECTO: Sincronizar notificaciones/pendientes

useEffect(() => {

const revisarAlertas = async () => {

if (!token) return;

try {

// Si es Gerente (3), buscamos firmas. Si no, notificaciones generales.

const endpoint = rolActivo === 3 ? '/aprobaciones/pendientes' : '/notificaciones';

const response = await fetch(`${baseUrl}${endpoint}`, {

headers: { 'Authorization': `Bearer ${token}` }

});



if (response.ok) {

const data = await response.json();

setTieneNotificaciones(data.length > 0);

}

} catch (error) {

console.error("Error badges:", error);

}

};



revisarAlertas();

const interval = setInterval(revisarAlertas, 120000); // Revisa cada 2 min

return () => clearInterval(interval);

}, [rolActivo, token, location.pathname]);



const handleLogout = () => {

localStorage.removeItem('token');

localStorage.removeItem('rol');

localStorage.removeItem('nombre');

navigate('/', { replace: true });

};



// --- LÓGICA DE ESCRITORIO (ORIGINAL) ---

const getSearchConfig = () => {

const path = location.pathname;

if (path.includes('/mis-solicitudes') || path.includes('/solicitud/')) {

return { placeholder: "Buscar folio o equipo...", targetPath: "/mis-solicitudes" };

}

return {

placeholder: rolActivo === 7 ? "Rastrear trazabilidad..." : "Buscar activos o IDs...",

targetPath: "/activos"

};

};



const searchConfig = getSearchConfig();



const handleSearch = (e) => {

if (e.key === 'Enter' && busqueda.trim() !== '') {

navigate(`${searchConfig.targetPath}?q=${busqueda}`);

setBusqueda('');

}

};



const getHomePath = () => {

switch (rolActivo) {

case 1: return '/adminDashboard';

case 2: return '/categorias';

case 3: return '/gerenteDashboard';

case 6: return '/scanner';

case 7: return '/auditorDashboard';

default: return '/categorias';

}

};



const getNavLinks = () => {

switch (rolActivo) {

case 1: return [{ name: 'Activos', path: '/activos' }, { name: 'Prestamos', path: '/prestamos-activos' }];

case 3: return [{ name: 'Activos', path: '/activos' }, { name: 'Validar Peticiones', path: '/validar-solicitudes' }];

case 2: return [{ name: 'Mis Solicitudes', path: '/mis-solicitudes' }];

case 7: return [{ name: 'Inventario', path: '/activos' }];

default: return [];

}

};



const getHomeLabel = () => {

switch(rolActivo) {

case 6: return 'Scanner';

case 2: return 'Catálogo';

default: return 'Home';

}

};



// --- LÓGICA MÓVIL (SIMETRÍA) ---

const getMobileSecondaryButton = () => {

switch (rolActivo) {

case 1: return { name: 'Préstamos', path: '/prestamos-activos', icon: <FileText size={24} /> };

case 3: return { name: 'Validar', path: '/validar-solicitudes', icon: <CheckSquare size={24} /> };

case 2: return { name: 'Trámites', path: '/mis-solicitudes', icon: <FileText size={24} /> };

case 7: return { name: 'Inventario', path: '/activos', icon: <ClipboardList size={24} /> };

default: return { name: 'Catálogo', path: '/categorias', icon: <FileText size={24} /> };

}

};



const mobileSecondary = getMobileSecondaryButton();

const isActive = (path) => location.pathname === path;



return (

<>

{/* 💻 NAVBAR ESCRITORIO */}

<nav className="bg-[#0070BC] text-white relative font-sans shadow-md z-50">

<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

<div className="flex items-center gap-4">

<button onClick={() => navigate(getHomePath())} className="active:scale-95 transition-transform">

<img src={zfLogo} alt="ZF" className="h-8 brightness-0 invert" />

</button>

</div>



{rolActivo !== 6 && (

<div className="flex-1 max-w-md mx-4">

<div className="bg-white rounded-xl flex items-center px-3 py-1.5 text-gray-500 shadow-inner">

<Search size={18} className="mr-2 text-gray-400" />

<input

type="text"

className="w-full bg-transparent outline-none text-black text-sm font-medium"

placeholder={searchConfig.placeholder}

value={busqueda}

onChange={(e) => setBusqueda(e.target.value)}

onKeyDown={handleSearch}

/>

<div className="w-px h-5 bg-gray-200 mx-2"></div>

<button onClick={() => navigate('/scanner')} className="text-[#0070BC] hover:scale-110 transition-transform">

<Camera size={20} />

</button>

</div>

</div>

)}



<div className="flex items-center gap-6">

<div className="hidden md:flex items-center gap-6">

<button onClick={() => navigate(getHomePath())} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px] font-black italic">

{getHomeLabel()}

</button>

{getNavLinks().map((link) => (

<Link key={link.name} to={link.path} className="hover:text-blue-200 transition-colors uppercase tracking-widest text-[10px] font-black italic">

{link.name}

</Link>

))}

</div>



<div className="hidden md:flex gap-4 items-center">

{/* Notificaciones Escritorio */}

<Link to="/notificaciones" className="relative hover:scale-110 transition-transform">

<Bell size={22} />

{tieneNotificaciones && (

<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#0070BC] rounded-full animate-pulse"></span>

)}

</Link>

<Link to="/perfil" className="hover:scale-110 transition-transform"><User size={22} /></Link>

<button onClick={handleLogout} className="text-red-300 hover:text-red-100 transition-colors"><LogOut size={22} /></button>

</div>
</div>
</div>
</nav>

{/* 📱 NAVBAR MÓVIL */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-[72px] z-[100] pb-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[30px]">

{/* 1. Inicio */}
<button onClick={() => navigate(getHomePath())} className={`flex flex-col items-center justify-center w-full h-full pt-2 transition-all active:scale-95 ${isActive(getHomePath()) ? 'text-[#0070BC]' : 'text-gray-400'}`}>
<Home size={24} strokeWidth={isActive(getHomePath()) ? 2.5 : 2} />
<span className="text-[9px] font-black uppercase tracking-widest mt-1">Home</span>
</button>

{/* 2. Dinámico (Validar / Trámites / Inventario) */}
<button onClick={() => navigate(mobileSecondary.path)} className={`relative flex flex-col items-center justify-center w-full h-full pt-2 transition-all active:scale-95 ${isActive(mobileSecondary.path) ? 'text-[#0070BC]' : 'text-gray-400'}`}>
{React.cloneElement(mobileSecondary.icon, { strokeWidth: isActive(mobileSecondary.path) ? 2.5 : 2 })}

{/* Badge para el Gerente en su botón de validar */}
{rolActivo === 3 && tieneNotificaciones && (
<span className="absolute top-3 right-5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
)}
<span className="text-[9px] font-black uppercase tracking-widest mt-1">{mobileSecondary.name}</span>
</button>

{/* 📸 3. SCANNER (CENTRAL) */}
<button onClick={() => navigate('/scanner')} className="relative flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform">
<div className={`absolute -top-6 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-gray-50 ${isActive('/scanner') ? 'bg-gray-900 shadow-gray-900/30' : 'bg-[#0070BC] shadow-blue-900/30'}`}>
<QrCode size={28} className="text-white" strokeWidth={2.5} />
</div>
<span className="text-[9px] font-black uppercase tracking-widest mt-10 text-gray-500">Scanner</span>
</button>

{/* 4. Espacio Inteligente (Avisos para Auditor / Activos para otros) */}
{rolActivo === 7 ? (
<button onClick={() => navigate('/notificaciones')} className={`relative flex flex-col items-center justify-center w-full h-full pt-2 transition-all active:scale-95 ${isActive('/notificaciones') ? 'text-[#0070BC]' : 'text-gray-400'}`}>
<Bell size={24} strokeWidth={isActive('/notificaciones') ? 2.5 : 2} />
{tieneNotificaciones && (
<span className="absolute top-3 right-5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
)}
<span className="text-[9px] font-black uppercase tracking-widest mt-1">Avisos</span>
</button>
) : (
<button onClick={() => navigate('/activos')} className={`flex flex-col items-center justify-center w-full h-full pt-2 transition-all active:scale-95 ${isActive('/activos') ? 'text-[#0070BC]' : 'text-gray-400'}`}>
<Package size={24} strokeWidth={isActive('/activos') ? 2.5 : 2} />
<span className="text-[9px] font-black uppercase tracking-widest mt-1">Activos</span>
</button>
)}

{/* 5. Perfil */}
<button onClick={() => navigate('/perfil')} className={`flex flex-col items-center justify-center w-full h-full pt-2 transition-all active:scale-95 ${isActive('/perfil') ? 'text-[#0070BC]' : 'text-gray-400'}`}>
<User size={24} strokeWidth={isActive('/perfil') ? 2.5 : 2} />
<span className="text-[9px] font-black uppercase tracking-widest mt-1">Perfil</span>
</button>

</nav>
</>
);
};

export default Navbar;