import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Camera, X, Bell, User, Home } from 'lucide-react';
import Navbar from '../components/Navbar';

const activosMock = [
  { id: '100001', nombre: 'BetaWorks Serie X300', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Herramienta' },
  { id: '100023', nombre: 'Epsilon Systems RAD-77G', estado: 'Prestado', color: 'bg-orange-200 text-orange-700', tipo: 'Equipo Especializado' },
  { id: '100005', nombre: 'GammaTech Modelo B1', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Laptop' },
  { id: '100028', nombre: 'BetaWorks HIL-1000', estado: 'Mantenimiento', color: 'bg-red-200 text-red-700', tipo: 'Herramienta' },
];

const Activos = () => {
  const [userRole] = useState('admin'); //cambiamos a 'user' para deshabilitar el agregar y editar activos
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [isMenuFiltrosOpen, setIsMenuFiltrosOpen] = useState(false);

  const categorias = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];

  // LÓGICA DE FILTRADO: Esta es la parte que tus compañeros usarán después con la API
  const activosFiltrados = useMemo(() => {
    return activosMock.filter((activo) => {
      const coincideEstado = filtroEstado === 'Todos' || activo.estado === filtroEstado;
      const coincideBusqueda = 
        activo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        activo.id.includes(busqueda);
      return coincideEstado && coincideBusqueda;
    });
  }, [filtroEstado, busqueda]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      {/* Buscador Móvil Funcional */}
      <div className="px-6 mt-6 md:hidden">
        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3 text-gray-500 shadow-inner border border-gray-200 focus-within:border-[#0070BC] transition-all">
          <Search size={20} className="mr-2" />
          <input 
            type="text" 
            className="w-full bg-transparent outline-none text-black placeholder-gray-400" 
            placeholder="Buscar por ID o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && <X size={18} className="ml-2 cursor-pointer" onClick={() => setBusqueda('')} />}
          <Camera size={20} className="ml-2 cursor-pointer text-[#0070BC]" />
        </div>
      </div>

      <header className="px-6 mt-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Activos</h1>
          <div className="w-16 h-1.5 bg-[#0070BC] mt-1"></div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsMenuFiltrosOpen(true)}
            className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90 transition-transform"
          >
            <Filter size={24} />
          </button>
          {userRole === 'admin' && (
            <button className="p-2 bg-[#0070BC] rounded-full text-white shadow-lg active:scale-90 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      {/* Filtros rápidos por Estado */}
      <div className="flex gap-3 px-6 mt-6 overflow-x-auto no-scrollbar">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroEstado(cat)}
            className={`px-6 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all
              ${filtroEstado === cat 
                ? 'bg-[#0070BC] border-[#0070BC] text-white' 
                : 'bg-white border-gray-200 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Activos Filtrada */}
      <main className="flex-1 px-6 mt-6 overflow-y-auto pb-28">
        <div className="flex flex-col gap-5">
          {activosFiltrados.length > 0 ? (
            activosFiltrados.map((activo, index) => (
              <div key={index} className="border-2 border-gray-100 rounded-[25px] p-5 flex flex-col relative shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-3/4">
                    <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{activo.nombre}</h3>
                    <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">ID: {activo.id}</p>
                  </div>
                </div>
                <div className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${activo.color}`}>
                  {activo.estado}
                </div>
                {userRole === 'admin' && (
                  <button className="absolute bottom-5 right-6 text-[#0070BC] font-black text-xs uppercase">Editar</button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center mt-10 text-gray-400 font-bold">No se encontraron activos.</div>
          )}
        </div>
      </main>

      {/* MODAL DE OPCIONES DE FILTRO */}
      {isMenuFiltrosOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuFiltrosOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-t-[30px] sm:rounded-[30px] p-8 animate-in slide-in-from-bottom duration-300">
            <h2 className="text-2xl font-black mb-6">Opciones de Filtro</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-bold text-gray-500 text-sm uppercase mb-3">Tipo de Activo</p>
                <div className="flex flex-wrap gap-2">
                  {['Laptop', 'Herramienta', 'Especializado'].map(t => (
                    <button key={t} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:border-[#0070BC]">{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsMenuFiltrosOpen(false)}
              className="w-full mt-8 bg-[#0070BC] text-white font-bold py-4 rounded-2xl"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activos;