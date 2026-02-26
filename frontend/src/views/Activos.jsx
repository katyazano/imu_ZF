import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus, ArrowLeft, X, Loader2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';


const Activos = () => {
  const navigate = useNavigate();
  
  // Estados de datos
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [userRole] = useState(localStorage.getItem('rol') === '1' ? 'admin' : 'user'); 
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [isMenuFiltrosOpen, setIsMenuFiltrosOpen] = useState(false);

  const categorias = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];

  // ==========================================
  // 1. CARGAR DATOS DESDE EL BACKEND
  // ==========================================
  useEffect(() => {
    const fetchActivos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:4000/api/activos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('No se pudieron cargar los activos');

        const data = await response.json();
        
        // Mapeamos los datos del Backend (Prisma) a tu formato de Frontend
        const activosMapeados = data.map(item => ({
          id: item.id_activo.toString(),
          nombre: item.nombre_maquina,
          // Mapeo de colores basado en el id_estado_maquina
          estado: item.estado_maquina?.nombre || 'Desconocido',
          color: getEstadoColor(item.id_estado_maquina),
          tipo: item.disciplina?.nombre || 'General',
          qr: item.qr_codigo
        }));

        setActivos(activosMapeados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivos();
  }, []);

  // Función auxiliar para los colores de ZF
  const getEstadoColor = (idEstado) => {
    switch (idEstado) {
      case 1: return 'bg-green-100 text-green-700';    // Disponible
      case 2: return 'bg-red-100 text-red-700';        // Mantenimiento
      case 3: return 'bg-orange-100 text-orange-700';  // Prestado
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ==========================================
  // 2. LÓGICA DE FILTRADO
  // ==========================================
  const activosFiltrados = useMemo(() => {
    return activos.filter((activo) => {
      const coincideEstado = filtroEstado === 'Todos' || activo.estado === filtroEstado;
      const coincideBusqueda = 
        activo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        activo.id.includes(busqueda);
      return coincideEstado && coincideBusqueda;
    });
  }, [filtroEstado, busqueda, activos]);

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
          <button 
            onClick={() => setIsMenuFiltrosOpen(true)} 
            className="p-2 rounded-full bg-gray-100 text-gray-600 active:scale-90 transition-transform"
          >
            <Filter size={24} />
          </button>
          {userRole === 'admin' && (
            <button onClick={() => navigate('/nuevo-activo')} className="p-2 bg-[#0070BC] rounded-full text-white shadow-lg active:scale-90 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      {/* Buscador de Activos */}
      <div className="px-6 mt-4">
        <div className="relative flex items-center group">
          {/* El Icono de Lucide en lugar del emoji */}
          <Search 
            size={20} 
            className="absolute left-4 text-gray-400 group-focus-within:text-[#0070BC] transition-colors" 
          />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-12 outline-none focus:border-blue-200 focus:bg-white transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros Rápidos (Estado) */}
      <div className="flex gap-3 px-6 mt-6 overflow-x-auto no-scrollbar pb-2">
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

      <main className="flex-1 px-6 mt-4 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Cargando inventario...</p>
          </div>
        ) : error ? (
            <div className="text-center mt-20 bg-red-50 p-6 rounded-3xl">
                <p className="text-red-500 font-bold italic">{error}</p>
                <button onClick={() => window.location.reload()} className="text-red-700 underline text-sm mt-2">Reintentar</button>
            </div>
        ) : (
          <div className="flex flex-col gap-5">
            {activosFiltrados.length > 0 ? (
              activosFiltrados.map((activo, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-[25px] p-5 flex flex-col relative shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Link to={`/activo/${activo.id}`} className="block">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-3/4">
                        <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{activo.nombre}</h3>
                        <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest italic">TIPO: {activo.tipo} | ID: {activo.id}</p>
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
              ))
            ) : (
              <div className="text-center mt-20">
                <p className="text-gray-300 font-black text-xl uppercase tracking-widest">Sin resultados</p>
                <button onClick={() => {setFiltroEstado('Todos'); setBusqueda('');}} className="text-[#0070BC] font-bold mt-2 underline">Limpiar filtros</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Activos;