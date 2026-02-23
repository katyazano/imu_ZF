import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus, ArrowLeft, Search, Camera, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const activosMock = [
  { id: '100001', nombre: 'BetaWorks Serie X300', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Herramienta' },
  { id: '100023', nombre: 'Epsilon Systems RAD-77G', estado: 'Prestado', color: 'bg-orange-200 text-orange-700', tipo: 'Equipo Especializado' },
  { id: '100005', nombre: 'GammaTech Modelo B1', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Laptop' },
  { id: '100028', nombre: 'BetaWorks HIL-1000', estado: 'Mantenimiento', color: 'bg-red-200 text-red-700', tipo: 'Herramienta' },
];

const Activos = () => {
  const navigate = useNavigate();
  const [userRole] = useState('admin'); 
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [isMenuFiltrosOpen, setIsMenuFiltrosOpen] = useState(false);

  const categorias = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];

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

      <header className="px-6 mt-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 leading-none">Activos</h1>
          <div className="w-16 h-1.5 bg-[#0070BC] mx-auto mt-1"></div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setIsMenuFiltrosOpen(true)} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90 transition-transform">
            <Filter size={24} />
          </button>
          {userRole === 'admin' && (
            <button onClick={() => navigate('/nuevo-activo')} className="p-2 bg-[#0070BC] rounded-full text-white shadow-lg active:scale-90 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>


      <div className="flex gap-3 px-6 mt-6 overflow-x-auto no-scrollbar">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroEstado(cat)}
            className={`px-6 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all
              ${filtroEstado === cat ? 'bg-[#0070BC] border-[#0070BC] text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 mt-6 overflow-y-auto pb-28">
        <div className="flex flex-col gap-5">
          {activosFiltrados.map((activo, index) => (
            <div key={index} className="border-2 border-gray-100 rounded-[25px] p-5 flex flex-col relative shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Link to={`/activo/${activo.id}`} className="block">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-3/4">
                    <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{activo.nombre}</h3>
                    <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">ID: {activo.id}</p>
                  </div>
                </div>
                <div className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${activo.color}`}>
                  {activo.estado}
                </div>
              </Link>
              {userRole === 'admin' && (
                <button 
                  onClick={() => navigate(`/editar-activo/${activo.id}`)}
                  className="absolute bottom-5 right-6 text-[#0070BC] font-black text-xs uppercase hover:underline"
                >
                  Editar
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Activos;